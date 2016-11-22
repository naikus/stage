var gulp = require("gulp"),
    del = require("del"),
    jshint = require("gulp-jshint"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    less = require("gulp-less"),
    eventStream = require("event-stream"),
    connect = require("gulp-connect");


var config = {
  src_dir: "src",
  dist: {
    dir: "dist",
    css_dir: "dist/css"
  }
};

gulp.task("default", function() {
  console.log("Available tasks:");
  console.log([
    "------------------------------------------------------------------------",
    "build           Build stage in the dist directory",
    "clean           Clean the dest directory",
    "-------------------------------------------------------------------------"
  ].join("\n"));
});


gulp.task("clean", function(cb) {
  del([
    config.dist.dir
  ], cb);
});


gulp.task("jshint", function() {
  return gulp.src([config.src_dir + "/**/*.js"])
      .pipe(jshint())
      .pipe(jshint.reporter("default"));
});


gulp.task("lessc", function() {
  return gulp.src(config.src_dir + "/**/*.less")
      .pipe(less())
      .pipe(gulp.dest(config.dist.dir));
});


gulp.task("build-lib", [], function() {
   // do other build things
   gulp.start("jshint");
   gulp.start("lessc");

   return eventStream.merge(
      gulp.src(["src/stage.js"]/*, {debug: true}*/)
            .pipe(concat("stage.js"))
            .pipe(gulp.dest(config.dist.dir))
            .pipe(concat("stage.min.js"))
            .pipe(gulp.dest(config.dist.dir))
            .pipe(uglify({comments: /^\/\*\!*/}))
            .pipe(gulp.dest(config.dist.dir)),

      gulp.src(["src/stage.less"])
            .pipe(concat("stage.less"))
            .pipe(gulp.dest(config.dist.dir))
   );
});

gulp.task("build", ["build-lib"], function() {
  gulp.src(config.dist.dir + "/**/*.*").pipe(gulp.dest("example"));
});


gulp.task("example", ["build"], function() {
  connect.server({
    root: "example",
    post: 8080
  });
});

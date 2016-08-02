var gulp = require("gulp"),
    del = require("del"),
    jshint = require("gulp-jshint"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    less = require("gulp-less"),
    vsource = require("vinyl-source-stream"),
    eventStream = require("event-stream"),
    connect = require("gulp-connect"),
    browserify = require("browserify"),
    pkg = require("./package.json");


var config = {
  src: {
    dir: "src/www/",
    assets: [
      "css/",
      "fonts/",
      "images/",
      // "lib/",
      "js/",
      "views/",
      "!less"
    ],
    libs: [
      "activables"
    ]
  },
  dist: {
    app_dir: "dist/",
    css_dir: "dist/css"
  },
  browserify: {
    debug: false,
    extensions: [
      ".js",
      ".json"
    ]
  }
};

gulp.task("default", function() {
  console.log("Available tasks:");
  console.log([
    "------------------------------------------------------------------------",
    "build           Build webapp in the dest directory",
    "clean           Clean the dest directory",
    "-------------------------------------------------------------------------"
  ].join("\n"));
});


gulp.task("jshint", function() {
  return gulp.src(["src/js", "!src/js/lib"])
      .pipe(jshint())
      .pipe(jshint.reporter("default"));
});


gulp.task("lessc", function() {
  gulp.src(config.src.dir + "less/*.theme.less")
        .pipe(less())
        .pipe(gulp.dest(config.dist.css_dir));

  gulp.src(config.src.dir + "less/app.less")
      .pipe(less())
      .pipe(gulp.dest(config.dist.css_dir));
});


gulp.task("clean", function(cb) {
  del([
    config.dist.app_dir
  ], cb);
});


gulp.task("build", ["clean"], function() {
  gulp.start("jshint", "lessc");

  var src = config.src.dir, dist = config.dist.app_dir;
  config.src.assets.forEach(function(ass) {
    gulp.src(src + ass + "**/*")
        .pipe(gulp.dest(dist + ass));
  });

  var b = browserify("./src/www/index.js", config.browserify);

  // Expose all the project dependencies so that view scripts can directly require(...)
  var deps = pkg.dependencies;
  for(var dep in deps) {
    b.require(dep);
  }

  // Expose additional libs in the js and lib directories
  config.src.libs.forEach(function(lib) {
    b.require("./" + lib, {
      basedir: config.src.dir + "/lib",
      expose: lib
    });
  });

  b.bundle().pipe(vsource("bundle.js")).pipe(gulp.dest(dist + "/lib/"));

  return gulp.src([
    src + "*.{html, css, png, jpg}"
  ]).pipe(gulp.dest(dist));

});


gulp.task("server", ["build"], function() {
  connect.server({
    root: "dist",
    post: 8080
  });
});

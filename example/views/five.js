Stage.defineView({
  id: "five",
  template: `<div class="stage-view five">
    <h1>View Five</h1>
    <p id="dt"></p>
    <button class="btn" id="btn8">&#171;</button>
    <button class="btn" id="btn9">&#171;&#171;</button>
  </div>`,
  factory: function(view_context, viewUi, viewConfig) {
    var dt;
    return {
      initialize: function() {
        console.log("View five configuration", viewConfig);
        document.getElementById("btn8").addEventListener(ACTION, function () {
          view_context.popView();
        }, false);

        document.getElementById("btn9").addEventListener(ACTION, function () {
          view_context.popView({toView: "one"});
        }, false);

        dt = document.getElementById("dt");
        dt.innerHTML = Date();
      },
      activate: function(options) {
        this.intervalId = setInterval(function() {
          dt.innerHTML = Date();
        }, 1000);
      },
      deactivate: function() {
        clearInterval(this.intervalId);
      }
    };
  }
});
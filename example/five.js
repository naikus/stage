Stage.defineView({
  id: "five",
  template: `<div class="stage-view five">
    <h1>View Five</h1>
    <p id="dt"></p>
    <button class="btn" id="btn8">&#171;</button>
    <button class="btn" id="btn9">&#187;</button>
  </div>`,
  factory: function(stageContext, viewUi) {
    var dt;
    return {
      initialize: function() {
        viewUi.addEventListener(ACTION, function() {
          stageContext.popView({toView: "one"});
        });

        document.getElementById("btn8").addEventListener(ACTION, function () {
          stageContext.popView();
        }, false);

        document.getElementById("btn9").addEventListener(ACTION, function () {
          stageContext.popView({toView: "one"});
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
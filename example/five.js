Stage.defineView({
  id: "five",
  template: `<div class="stage-view five">
    <h1>View Five</h1>
    <p id="dt"></p>
  </div>`,
  factory: function(stageContext, viewUi) {
    var dt;
    return {
      initialize: function() {
        viewUi.addEventListener("click", function() {
          stageContext.popView({toView: "one"});
        });
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
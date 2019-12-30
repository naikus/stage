function heroTransition(stageContext, viewUi) {
  var hero = viewUi.getElementsByClassName("hero")[0],
      onClick = function(e) {
        hero.className = "hero transition"
        viewUi.classList.add("hero-transitioning")
      },
      onTransitionEnd = function(e) {
        stageContext.pushView("five", {
          transition: "fade"
        });
      };
  return {
    init: function() {
      hero.addEventListener("click", onClick);
      hero.addEventListener("transitionend", onTransitionEnd);
    },
    reset: function() {
      hero.className = "hero";
      viewUi.classList.remove("hero-transitioning")
    },
    destroy: function() {
      hero.removeEventListener("click", onClick);
      hero.removeEventListener("transitionend", onTransitionEnd);
    }
  };
}
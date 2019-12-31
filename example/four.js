function heroTransition(stageContext, viewUi) {
  var hero = viewUi.getElementsByClassName("hero")[0],
      calculateScaling = function(fromElem, toElem) {
        var fromRect = fromElem.getBoundingClientRect(),
            toRect = toElem.getBoundingClientRect(),
            x = Math.round((toRect.width / fromRect.width) * 3),
            y = Math.round((toRect.height / fromRect.height) * 3);
        console.log(x, y);
        y = x > y ? x : (x = y), y;
        return {
          x, y
        };
      },
      onClick = function(e) {
        // hero.className = "hero transition"
        var scale = calculateScaling(e.target, viewUi);
        console.log(scale);
        viewUi.classList.add("hero-transitioning");
        hero.style.transform = `scale(${scale.x}, ${scale.y})`
        setTimeout(function() {
          stageContext.pushView("five", {
            transition: "fade-in"
          });
        }, 200);
      },
      onTransitionEnd = function(e) {};
  return {
    init: function() {
      hero.addEventListener(ACTION, onClick);
      hero.addEventListener("transitionend", onTransitionEnd);
    },
    reset: function() {
      // hero.className = "hero";
      hero.style.transform = "scale(1, 1)";
      viewUi.classList.remove("hero-transitioning")
    },
    destroy: function() {
      hero.removeEventListener(ACTION, onClick);
      hero.removeEventListener("transitionend", onTransitionEnd);
    }
  };
}
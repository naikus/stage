function fabTransition(view_context, viewUi) {
  var fab = viewUi.getElementsByClassName("fab")[0],
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
        // fab.className = "fab transition"
        var scale = calculateScaling(e.target, viewUi);
        // console.log(scale);
        viewUi.classList.add("fab-transitioning");
        fab.style.transform = `scale(${scale.x}, ${scale.y})`
        setTimeout(function() {
          view_context.pushView("five", {
            transition: "fab-fade"
          });
        }, 200);
      },
      onTransitionEnd = function(e) {};
  return {
    init: function() {
      fab.addEventListener(ACTION, onClick);
      fab.addEventListener("transitionend", onTransitionEnd);
    },
    reset: function() {
      // fab.className = "fab";
      fab.style.transform = "scale(1, 1)";
      viewUi.classList.remove("fab-transitioning")
    },
    destroy: function() {
      fab.removeEventListener(ACTION, onClick);
      fab.removeEventListener("transitionend", onTransitionEnd);
    }
  };
}
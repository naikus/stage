/* global window, define, module */
(function(global, factory) {
  var activables = factory(global);
  if(typeof define === "function" && define.amd) {
    // AMD support
    define(function() {return activables;});
  }else if(typeof module === "object" && module.exports) {
    // CommonJS support
    module.exports = activables;
  }else {
    // We are probably running in the browser    
    global.Activables = activables;
  }
  
})(typeof window === "undefined" ? this : window, function(global, undefined) {
  var touchstart = "touchstart", touchend = "touchend", touchmove = "touchmove";
  if(!("ontouchstart" in document.documentElement)) {
    touchstart = "mousedown";
    touchmove = "mousemove";
    touchend = "mouseup";
  }
  var clsRegExps = {};
  
  function shallowCopy(/*target, source0, souce1, souce2, ... */) {
    var target = arguments[0], sources = Array.prototype.slice.call(arguments, 1), src;
    for(var i = 0, len = sources.length; i < len; i++) {
      src = sources[i];
      for(var k in src) {
        target[k] = src[k];
      }
    }
    return target;
  }
  
  function classRe(clazz) {
    // new RegExp("\\b" + clazz + "[^\w-]")
    return clsRegExps[clazz] || (clsRegExps[clazz] =
        new RegExp("(^|\\s+)" + clazz + "(?:\\s+|$)")); // thank you xui.js :) 
  }

  function addClass(elem, clName) {
    var cList = elem.classList;
    if(!cList || !clName) {
      return false;
    }
    cList.add(clName);
    return true;
  }

  function removeClass(elem, clName) {
    var cList = elem.classList;
    if(!cList || !clName) {
      return false;
    }
    cList.remove(clName);
    return true;
  }
  
  function hasClass(element, clName) {
    return classRe(clName).test(element.className);
  }
  
  var defaults = {
    level: 4,
    delay: 90,
    targetClass: "activable",
    activeClass: "active"
  };
  
  function Activables(container, opts) {
    var options = shallowCopy({}, defaults, (opts || {})),
        level = options.level,
        delay = options.delay,
        activeClass = options.activeClass,
        targetClass = options.targetClass,
        timer,
        element;

    function activate() {
      addClass(element, activeClass);
    }
    function deactivate() {
      if(!element) return;
      container.removeEventListener(touchmove, move, false);
      removeClass(element, activeClass);
      element = null;
    }
    function start(e) {
      if(element) return;

      var target = e.target, lvl = level;
      while(target && lvl--) {
        if(hasClass(target, targetClass)) {
          element = target;
          break;
        }else {
          target = target.parentNode;
        }
      }

      if(!element) return;

      // console.log("adding listener");
      container.addEventListener(touchmove, move, false);

      // start the timer
      timer = setTimeout(activate, delay);
    }
    function end(e) {
      if(element) {
        clearTimeout(timer);

        if(hasClass(element, activeClass)) {
          deactivate();
        }else {
          addClass(element, activeClass);
          setTimeout(deactivate, delay);
        }
      }
    }
    function move(e) {
      // console.log("move...");
      if(element) {
        // console.log("moved!! de-activating...");
        clearTimeout(timer);
        deactivate();
      }
    }

    return {
      start: function() {
        container.addEventListener(touchstart, start, false);
        container.addEventListener(touchend, end, false);
      },
      stop: function() {
        container.removeEventListener(touchstart, start, false);
        container.removeEventListener(touchend, end, false);
      }
    };
  };
  
  return Activables;
});
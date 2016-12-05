/* global window, define, module */
(function(global, factory) {
  var stg = factory(global);
  if(typeof define === "function" && define.amd) {
    // AMD support
    define(function() {return stg;});
  }else if(typeof module === "object" && module.exports) {
    // CommonJS support
    module.exports = stg;
  }else {
    // We are probably running in the browser
    global.Stage = stg;
  }

})(typeof window === "undefined" ? this : window, function(global, undefined) {
  // All global variables that are used in stagejs
  var document = global.document,
      setTimeout = global.setTimeout,
      setInterval = global.setInterval,
      XMLHttpRequest = global.XMLHttpRequest,
      getComputedStyle = global.getComputedStyle,
      requestAnimationFrame = global.requestAnimationFrame;


  /* ------------------------------------- Utility Functions ------------------------------------ */
  var Util = (function() {
    // Some utility functions
    /* @Deadcode
    function create(from) {
      function T() {}
      T.prototype = from;
      return new T();
    }
    */

    var noop = function() {},
        /* @Deadcode
        createObject = (Object.create || create),
        */
        AProto = Array.prototype,
        OProto = Object.prototype,
        slice = AProto.slice,
        nSlice = slice,
        objToString = OProto.toString;

    return {
      /* @Deadcode
      create: createObject,
      extend: function(From, extraProps) {
        // we provide for initialization after constructor call
        var initialize = extraProps._initialize || noop;
        // once initialized, we don't really need it in the actual object
        delete extraProps._initialize;

        function F() {
          From.apply && From.apply(this, arguments);
          // call subclass initialization
          initialize.apply(this, arguments);
        }

        var Proto = F.prototype = createObject(From.prototype);
        for(var k in extraProps) {
          if(extraProps.hasOwnProperty(k)) {
            Proto[k] = extraProps[k];
          }
        }
        Proto.constructor = F;
        return F;
      },
      */
      shallowCopy: function(/*target, source0, souce1, souce2, ... */) {
        var target = arguments[0], sources = Array.prototype.slice.call(arguments, 1), src;
        for(var i = 0, len = sources.length; i < len; i++) {
          src = sources[i];
          for(var k in src) {
            target[k] = src[k];
          }
        }
        return target;
      },
      /**
       * Gets the type of object specified. The type returned is the [[Class]] internal property
       * of the specified object. For build in types the values are:
       * -----------------------------------------------------------
       * String
       * Number
       * Boolean
       * Date
       * Error
       * Array
       * Function
       * RegExp
       * Object
       *
       * @param {Object} that The object/function/any of which the type is to be determined
       */
      /* @Deadcode
      getTypeOf: function(that) {
        // why 8? cause the result is always of pattern '[object <type>]'
        return objToString.call(that).slice(8, -1);
      },
      isTypeOf: function(that, type) {
        return objToString.call(that).slice(8, -1) === type;
      },
      */

      /**
       * Whether the specified object has its own property
       * @param {type} obj The target object
       * @param {type} prop The property to check
       * @returns {Boolean} true if the property belongs to the target object
       */
      ownsProperty: function(obj, prop) {
        if(obj.hasOwnProperty) {
          return obj.hasOwnProperty(prop);
        }else {
          var val = obj[prop];
          return typeof val !== "undefined" && obj.constructor.prototype[prop] !== val;
        }
      },
      /* @Deadcode
      isFunction: function(that) {
        return objToString.call(that) === "[object Function]";
      },
      isArray: function(that) {
        return objToString.call(that) === "[object Array]";
      },
      */
      slice: function(arrayLike, start, end) {
        var arr, i,
            /* jshint validthis:true */
            len = arrayLike.length,
            s = start || 0, e = end || len;
        /* jshint validthis:true */
        if(objToString.call(arrayLike) === "[object Array]") {
          /* jshint validthis:true */
          arr = nSlice.call(arrayLike, s, e);
        }else {
          // so that we can have things like sliceList(1, -1);
          if(e < 0) {
            e = len - e;
          }
          arr = [];
          for(i = s; i < e; i++) {
            arr[arr.length] = arrayLike[i];
          }
        }
        return arr;
      },
      trim: function(str) {
        return str.replace(/^\s+|\s+$/g, "");
      }
    };
  })();



  /* --------------------------------------- DOM Functions -------------------------------------- */
  var DOM = (function() {
    var clsRegExps = {},
        isIe = !!global.ActiveXObject,
        htmlRe = /^\s*<(!--\s*.*)?(\w+)[^>]*>/,
        div = document.createElement("div"),
        table = document.createElement("table"),
        tr = document.createElement("tr"),
        containers = {
          "*": div,
          tbody: table,
          tfoot: table,
          tr: document.createElement("tbody"),
          td: tr,
          th: tr
        },
        supportsEvent = typeof(global.Event === "function");

    function asNodes(nodeName, html, isTable) {
        var frags, c = div.cloneNode();
        html += "";
        c.innerHTML = ["<", nodeName, ">", html, "</", nodeName, ">"].join("");
        frags = isTable ? c.firstChild.firstChild.childNodes : c.firstChild.childNodes;
        return frags;
    }

    function classRe(clazz) {
      // new RegExp("\\b" + clazz + "[^\w-]")
      return clsRegExps[clazz] || (clsRegExps[clazz] =
          new RegExp("(^|\\s+)" + clazz + "(?:\\s+|$)")); // thank you xui.js :)
    }

    function _addClass(elem, clName) {
      var cList = elem.classList;
      if(!cList || !clName) {
        return false;
      }
      cList.add(clName);
      return true;
    }

    function _removeClass(elem, clName) {
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

    function createEvent(type, node, options) {
      var event = document.createEvent('Event');
      event.initEvent(type, options.bubbles, options.cancelable);
      event.srcElement = node;
      return event;
    }

    return {
      selectOne: function(selector, context) {
        if(typeof selector === "string") {
          return (context || document).querySelector(selector);
        }
        return selector;
      },
      select: function(selector, context) {
        if(typeof selector === "string") {
          return (context || document).querySelectorAll(selector);
        }
        return selector;
      },
      asFragment: function(html, tgName) {
        var c, ret, children, tag, fragment;
        if(!tgName) {
          ret = htmlRe.exec(html);
          tgName = ret ? ret[2] : null;
        }
        c = (containers[tgName] || div).cloneNode();
        if(isIe) {
          tag = c.tagName.toLowerCase();
          if(tag === "tbody" || tag === "table" || tag === "thead" || tag === "tfoot") {
              children = asNodes("table", html, true);
          }else {
            c.innerHTML = "" + html;
            children = c.childNodes;
          }
        }else {
          c.innerHTML = "" + html;
          children = c.childNodes;
        }

        children = Util.slice(children);

        fragment = document.createDocumentFragment();
        for(var i = 0, len = children.length; i < len; i += 1) {
          fragment.appendChild(children[i]);
        }
        return fragment;
      },
      dispatchEvent: function(type, options) {
        var event, node = options.element || document, data = options.data;
        if(supportsEvent) {
          try {
            event = new Event(type, {
              bubbles: options.bubbles || false,
              cancelable: options.cancelable || false
            });
          }catch(e) {
            event = createEvent(type, node, options);
          }
        }else {
          event = createEvent(type, node, options);
        }
        // event.data = options.data;
        for(var k in data) {
          if(Util.ownsProperty(data, k)) {
            event[k] = data[k];
          }
        }
        node.dispatchEvent(event);
      },
      hasClass: hasClass,
      addClass: function(elements, clName) {
        var el;
        if(elements.length) {
          for(var i = 0, len = elements.length; i < len; i += 1) {
            el = elements[i];
            if(!hasClass(el, clName) && !_addClass(el, clName)) {
               el.className += " " + clName;
            }
          }
        }else {
          el = elements;
          if(!hasClass(el, clName) && !_addClass(el, clName)) {
             el.className += " " + clName;
          }
        }
        return this;
      },
      removeClass: function(elements, clName) {
        var el;
        if(elements.length) {
          for(var i = 0, len = elements.length; i < len; i += 1) {
            el = elements[i];
            if(hasClass(el, clName) && !_removeClass(el, clName)) {
               el.className = Util.trim(el.className.replace(classRe(clName), "$1"));
            }
          }
        }else {
          el = elements;
          if(hasClass(el, clName) && !_removeClass(el, clName)) {
             el.className = Util.trim(el.className.replace(classRe(clName), "$1"));
          }
        }
        return this;
      },
      getComputedStyle: function(elem) {
        return getComputedStyle ? getComputedStyle(elem) : elem.currentStyle;
      },
      data: function(element) {
        var name = arguments[1],
            value = arguments[2],
            data = element.__stagedata__;
        if(!data) {
          data = element.__stagedata__ = {};
        }

        if(arguments.length === 2) {
          return data[name];
        }else if(arguments.length === 3) {
          data[name] = value;
        }
        return this;
      }
    };
  })();



  /* ----------------------------------- Stage Implementation ----------------------------------- */
  var Stage = (function() {
    var VIEW_DEFS = {},
        CONTROLLER_METHODS = ["initialize", "activate", "update", "deactivate", "destroy"],
        noop = function() {},
        raf = (requestAnimationFrame ||
            global.mozRequestAnimationFrame ||
            global.webkitRequestAnimationFrame ||
            global.msRequestAnimationFrame ||
            function(cb) {
              return setTimeout(cb, 1000 / 60);
            }),
        Env = (function() {
          var prefixes = ["", "Webkit", "Moz", "O", "ms", "MS"],
              transitionend = ["transitionend", "webkitTransitionEnd", "transitionend",
                "oTransitionEnd", "MSTransitionEnd"],
              animationend = ["animationend", "webkitAnimationEnd", "animationend",
                "oAnimationEnd", "animationend"],
              div = document.createElement("div"),
              style = div.style;
          return {
            transition: (function() {
              var prefix, prop;
              for(var i = 0, len = prefixes.length; i < len; i += 1) {
                prefix = prefixes[i];
                prop = prefix ? prefix + "Transition" : "transition";
                if(typeof style[prop] !== "undefined") {
                  return {
                    property: prop,
                    end: transitionend[i]
                  };
                }
              }
              return {};
            })(),
            animation:(function() {
              var prefix, prop;
              for(var i = 0, len = prefixes.length; i < len; i += 1) {
                prefix = prefixes[i];
                prop = prefix ? prefix + "Animation" : "animation";
                if(typeof style[prop] !== "undefined") {
                  return {
                    property: prop,
                    end: animationend[i]
                  };
                }
              }
              return {};
            })()
            // , hashchange: ("onhashchange" in global) ? "onhashchange" : null
          };
        })(),
        STAGE_DEFAULT_OPTIONS = {
          transitionDelay: 150,
          transition: "slide"
        },
        NO_TRANSITION = "no-transition";

    // console.log(Env);

    /**
     * Makes an XmlHttpRequest request
     * @param {Object} options The options can be
     * {
     *   path: "the path of the resource",
     *   method: http method (defaults to "GET")
     *   success: The success handler
     *   fail: Failure handler
     *   timeout: The timeout for the request
     * }
     * @returns {undefined}
     */
    function ajax(options) {
      var xhr = new XMLHttpRequest(),
          wasConnected = false,
          path = options.path,
          method = options.method || "GET",
          success = options.success,
          fail = options.fail,
          timeout = typeof options.timeout === "undefined" ? 30000 : options.timeout;

      xhr.open(method, path, true);
      xhr.timeout = timeout;
      // Some headers
      // Add listeners
      xhr.addEventListener("readystatechange", function() {
        var state = xhr.readyState, code;

         // This is for safari/chrome where ready state is 4 but status is 0 in case of local
         // files i.e. file://
         if(state === 2 || state === 3) {
           wasConnected = true;
         }
         if(state === 4) {
           code = xhr.status;
           if((code >= 200 && code < 400) || (code === 0 && wasConnected)) {
             (success && success(xhr)); // jshint ignore:line
           }else {
             (fail && fail(code, xhr)); // jshint ignore:line
           }
         }
      });
      xhr.addEventListener("timeout", function() {
        (fail && fail("timeout", xhr)); // jshint ignore:line
      });
      // Send!
      xhr.send();
    }

    /**
     * Appends an inline script element to the specified element
     * @param {String} scriptContent The content of the script
     * @param {Element} toElement The HTML element
     * @param {boolean} wrapInAnonFunc Whether to wrap script in an annonymous function (false)
     * @returns {undefined}
     */
    function addInlineScript(scriptContent, toElement, wrapInAnonFunc) {
      var script = document.createElement("script");
      script.textContent = wrapInAnonFunc ? "(function() {\n" + scriptContent + "\n})();"
          : scriptContent;
      toElement.appendChild(script);
    }

    /**
     * Adds a script element with a 'src' attribute and appends the script element to specified
     * element
     * @param {String} src The source of the script
     * @param {Element} toElement The element to append to
     * @param {function} callback The function to call after the script has loaded
     * @returns {undefined}
     */
    function addRemoteScript(src, toElement, callback) {
      var script = document.createElement("script");
      if("onreadystatechange" in script) {
        script.onreadystatechange = function() {
          if(this.readyState === "loaded" || this.readyState === "complete") {
            callback(src);
          }
        };
      }else {
        script.onload = function() {
          callback(src);
        };
      }
      script.src = src;
      script.async = 1;
      toElement.appendChild(script);
    }

    /**
     * Loads the view template along with the scripts the view has defined into the viewPort
     * @param {String} path The view template path
     * @param {Element} viewPort The viewport element
     * @param {function} callback The function to call after the view has been loaded
     * @returns {undefined}
     */
    function loadView(path, viewPort, callback) {
      ajax({
        path: path,
        method: "GET",
        success: function(xhr) {
          var div = document.createElement("div"),
              viewFragment = DOM.asFragment(xhr.responseText),
              scriptElements = Util.slice(DOM.select("script", viewFragment)).filter(function(se) {
                var type = se.getAttribute("type") || "text/javascript";
                return type.indexOf("/javascript") !== -1;
              }),
              processScripts = function() {
                var script, src;
                if(scriptElements.length) {
                  script = scriptElements.shift();
                  if((src = script.getAttribute("src"))) {
                    addRemoteScript(src, div, processScripts);
                  }else {
                    addInlineScript(script.textContent, div);
                    processScripts();
                  }
                }else {
                  callback({
                    path: path,
                    error: false,
                    element: div
                  });
                }
              };

          scriptElements.forEach(function(script) {
            script.parentNode.removeChild(script);
          });

          // set some div attrs
          div.className = "view-holder";
          div.setAttribute("data-view-template", path);
          div.appendChild(viewFragment);

          // put it in the viewport so that the scripts load correctly
          viewPort.appendChild(div);

          // start processing scripts
          processScripts();
        },
        fail: function(error, xhr) {
          callback({
            path: path,
            error: error || true,
            xhr: xhr
          });
        }
      });
    }

    /*
     *
     * View definition
     * {
     *    id: "view-id",
     *    templatePath: "/path/to/template",
     *    factory: factory function that creates view controller
     * }
     *
     */
    function getOrCreateViewDef(viewId) {
      var def = VIEW_DEFS[viewId];
      if(!def) {
        def = VIEW_DEFS[viewId] = {
          id: viewId
        };
      }
      return def;
    }



    function View(id, elem, controller) {
      this.id = id;
      this.element = elem;
      this.controller = controller;
      // DOM.data(this.element, "viewId", id);
    }
    View.prototype = {
      constructor: View,
      show: function(bShowing) {
        if(bShowing === false) {
          DOM.removeClass(this.element, "showing");
        }else {
          DOM.addClass(this.element, "showing");
        }
        return this;
      },
      bringIn: function() {
        DOM.addClass(this.element, "in");
      },
      isIn: function() {
        return DOM.hasClass(this.element, "in");
      },
      stack: function() {
        if(!DOM.hasClass(this.element, "stack")) {
          DOM.removeClass(this.element, "in")
              .addClass(this.element, "stack");
        }
        return this;
      },
      isStacked: function() {
         return DOM.hasClass(this.element, "stack");
      },
      unStack: function(unstackClass) {
        DOM.removeClass(this.element, "stack");
        if(unstackClass) {
            DOM.addClass(this.element, "unstack");
        }
        return this;
      },
      wasUnStacked: function() {
        return DOM.hasClass(this.element, "unstack");
      },
      pop: function() {
        DOM.removeClass(this.element, "in").addClass(this.element, "pop");
        // DOM.replaceClass(this.element, "in", "pop");
        return this;
      },
      wasPopped: function() {
        return DOM.hasClass(this.element, "pop");
      },
      reset: function(states) {
        if(typeof states === "string") {
          DOM.removeClass(this.element, states);
        }else {
          var self = this;
          states.forEach(function(s) {
            DOM.removeClass(self.element, s);
          });
        }
      }
    };


    function TransitionTracker() {
      var name,
          fromView,
          toView,
          progressing = false;
          eventCount = {};

      function getTransitionPropertyCount(viewElem) {
        var style = DOM.getComputedStyle(viewElem), property = style["transition-property"];
        return property ? property.split(",").length : 0;
      }
      /*
      function getTransitionPropertyCount(viewElem) {
        // console.log(TransitionTracker.PropertyCount);
        var viewId = viewElem.getAttribute("data-view"),
            key = name + "_" + viewId,
            count = TransitionTracker.PropertyCount[key],
            property,
            style;

        if(typeof count === "undefined") {
          style = DOM.getComputedStyle(viewElem);
          property = style["transition-property"];
          count = TransitionTracker.PropertyCount[key] = property ? property.split(",").length : 0; 
        }
        return count;
      }
      */

      return {
        name: function() {
          if(arguments.length) {
            name = arguments[0];
            return this;
          }else {
            return name;
          }
        },
        from: function(view) {
          fromView = view.id;
          eventCount[view.id] = getTransitionPropertyCount(view.element);
          return this;
        },
        to: function(view) {
          toView = view.id;
          eventCount[view.id] = getTransitionPropertyCount(view.element);
          return this;
        },
        transitionEnded: function(view) {
          var ended;
          eventCount[view.id] -= 1;
          ended = !eventCount[view.id];
          // progressing = !(!eventCount[fromView] && !eventCount[toView]);
          progressing = eventCount[fromView] || eventCount[toView];
          return ended;
        },
        inProgress: function() {
          if(arguments.length) {
            progressing = arguments[0];
            return this;
          }else {
            return progressing;
          }
        },
        clear: function() {
          delete eventCount[fromView];
          delete eventCount[toView];
          progressing = false;
          fromView = toView = null;
        }
      };

    }
    // TransitionTracker.PropertyCount = {};

    /**
     * A limited feature stage context to be used in views
     * @param {type} stageInstance
     * @returns {Object} The context object for use in views
     */
    function StageContext(stageInstance) {
      var stage = stageInstance;
      return {
        getViewPort: function() {
          return stage.getViewPort();
        },
        pushView: function(viewId, options) {
          return stage.pushView(viewId, options);
        },
        popView: function(options) {
          return stage.popView(options);
        },
        currentView: function() {
          return stage.currentView();
        },
        previousView: function() {
          return stage.previousView();
        }
      };
    }

    /**
     * Creates a Stage instance
     * @param {Object} opts The options object as below:
     * {
     *   viewport: The viewPort element selector
     *   transitionDelay: The delay between transitions (default 50)
     *   transition: The transition name (default "slide")
     * }
     * @returns {Object} A stage instance
     */
    function Stage(opts) {
      var options = Util.shallowCopy({}, STAGE_DEFAULT_OPTIONS, opts),
          viewPort = DOM.selectOne(options.viewport),
          views = {},
          transitionTracker = TransitionTracker(),
          viewStack = [],
          context,
          instance;

      console.debug("Stage options ", options);

      if(!viewPort || viewPort.nodeType !== 1) {
        throw new Error("Use a valid element as view port");
      }

      var defaultTransition = options.transition;

      if(defaultTransition) {
        DOM.addClass(viewPort, defaultTransition);
        // transitionState.transition = defaultTransition;
        transitionTracker.name(defaultTransition);
      }

      /**
       * Prepares the view from view definition (as defined by Stage.defineView()). This method
       * calls the factory and creates the view controller specific to this Stage instance
       * @param {String} viewId The vid id specified by data-view attribute
       * @returns {Object} The view info object
       */
      function prepareView(viewId) {
        var selector = '[data-view="' + viewId + '"]',
            viewUi = DOM.selectOne(selector, viewPort),
            viewDef = VIEW_DEFS[viewId],
            viewController,
            view;

        if(!viewUi) {
          throw new Error("UI for view " + viewId + " not found.");
        }

        viewUi.addEventListener(Env.transition.end || "transitionend", handleViewTransitionEnd);
        viewUi.addEventListener(Env.animation.end || "animationend", handleViewTransitionEnd);

        // console.debug("Creating view factory for ", viewId);
        // viewController = viewDef.factory(instance, viewUi);
        viewController = viewDef.factory(context, viewUi);
        CONTROLLER_METHODS.forEach(function(m) {
          if(typeof viewController[m] === "undefined") {
            viewController[m] = noop;
          }
        });

        view = views[viewId] = new View(viewId, viewUi, viewController);
        return view;
      }

      /**
       * Pushes a view onto the view stack and transitions the old and new views
       * @param {String} viewId The id of the defined view to push
       * @param {Object} viewOptions Optional options and data for the view
       * @returns {undefined}
       */
      function pushViewInternal(viewId, viewOptions) {
        var view = views[viewId],
            currentView,
            transition = "transition" in viewOptions ? viewOptions.transition : defaultTransition,
            transitionUI = function() {
              if(currentView) dispatchBeforeViewTransitionEvent("out", currentView);
              dispatchBeforeViewTransitionEvent("in", view);

              raf(function() {
                if(currentView) {
                  stackViewUI(currentView, transition);
                }
                pushViewUI(view, transition);
              });
            };


        // Transitions are set on the view port
        // console.debug("pushView(): Using transition ", transition);
        var currTransition = transitionTracker.name();

        if(currTransition !== transition) {
          transitionTracker.name(transition);
          if(currTransition) {DOM.removeClass(viewPort, currTransition);}
          DOM.addClass(viewPort, transition);
          // console.debug("pushView(): Replacing transition", currTransition, " -> ", transition);
        }

        // Check if this is an update to current view
        currentView = viewStack.length ? viewStack[viewStack.length - 1] : null;
        if(currentView) {
          if(currentView.id === viewId) {
            // Its just a view update with different options
            currentView.controller.update(viewOptions);
            transitionTracker.clear();
            return;
          }
          transitionTracker.from(currentView);
          viewOptions.fromView = currentView.id;
        }

        // We are actually transitioning
        DOM.addClass(viewPort, "view-transitioning");

        // Initialize the view if its a new view
        if(!view) {
          view = prepareView(viewId, viewOptions);
          // Make the dom visible for controller to initialize.
          view.show(true);
          // Initialize the view
          view.controller.initialize(viewOptions);
        }else {
          // If this view was earlier stacked, remove the 'stack' class
          view.unStack().show(true);
        }

        // set the current transition (should we use a stack?)
        view.transition = transition;
        transitionTracker.to(view);

        if(currentView) {
          currentView.controller.deactivate();
        }
        var viewActivate = view.controller.activate;
        if(viewActivate.length === 2) { // expects acync activation
          view.controller.activate(viewOptions, function() {
            setTimeout(transitionUI, options.transitionDelay);
          });
        }else {
          // @TODO Add Promise API support?
          view.controller.activate(viewOptions);
          setTimeout(transitionUI, options.transitionDelay);
        }
        viewStack.push(view);
      }

      function popViewInternal(viewOptions, toView) {
        var currentView,
            view,
            idx,
            transition = transitionTracker.name(),
            transitionUI = function() {
              dispatchBeforeViewTransitionEvent("out", currentView);
              dispatchBeforeViewTransitionEvent("in", view);

              raf(function() {
                popViewUI(currentView, transition);
                unstackViewUI(view, transition);
              });
            };

        currentView = viewStack.pop();
        if(toView) {
          idx = indexOfView(toView);
          if(idx === -1) {
            viewStack.push(currentView);
            transitionTracker.clear();
            throw new Error("View " + toView + " is not on stack");
          }
          view = viewStack[idx];
          // Remove upto 'view' views from the stack
          viewStack.splice(idx + 1, viewStack.length - (idx + 1));
        }else {
          view = viewStack[viewStack.length - 1];
        }

        // Check if this view has a 'stack' class
        view.stack();
        // We are actually transitioning
        DOM.addClass(viewPort, "view-transitioning");
        view.show(true);

        transitionTracker.from(currentView).to(view);

        currentView.controller.deactivate();
        var viewActivate = view.controller.activate;
        if(viewActivate.length === 2) { // expects acync activation
          view.controller.activate(viewOptions, function() {
            setTimeout(transitionUI, options.transitionDelay);
          });
        }else {
          // @TODO Add Promise API support?
          view.controller.activate(viewOptions);
          setTimeout(transitionUI, options.transitionDelay);
        }
      }

      function indexOfView(viewId) {
        var i, len;
        for(i = 0, len = viewStack.lenth; (i < len && viewStack[i].id !== viewId); i += 1);
        return i === len ? -1 : i;
      }

      function pushViewUI(view, transition) {
        view.bringIn();
        if(!Env.transition.end || !transition) {
          handleViewTransitionEnd({
            target: view.element,
            propertyName: NO_TRANSITION
          });
        }
      }

      function stackViewUI(view, transition) {
        view.stack();
        if(!Env.transition.end || !transition) {
          handleViewTransitionEnd({
            target: view.element,
            propertyName: NO_TRANSITION
          });
        }
      }

      function popViewUI(view, transition) {
        view.pop();
        if(!Env.transition.end || !transition) {
          handleViewTransitionEnd({
            target: view.element,
            propertyName: NO_TRANSITION
          });
        }
      }

      function unstackViewUI(view, transition) {
        view.unStack("unstack").bringIn();
        // console.log(view.element);
        if(!Env.transition.end || !transition) {
          handleViewTransitionEnd({
            target: view.element,
            propertyName: NO_TRANSITION
          });
        }
      }

      /*
      function dispatchViewLoad(type, viewId) {
        DOM.dispatchEvent("viewload" + type, {
          element: viewPort,
          data: {viewId: viewId}
        });
      }
      */

      function dispatchViewTransitionEvents(type, view) {
        DOM.dispatchEvent("viewtransition" + type, {
          element: viewPort,
          data: {
            viewId: view.id
          }
        });
        DOM.dispatchEvent("transition" + type, {
          element: view.element
        });
      }

      function dispatchBeforeViewTransitionEvent(tType, view) {
        DOM.dispatchEvent("beforeviewtransition" + tType, {
          element: viewPort,
          cancelable: true,
          data: {
            viewId: view.id
          }
        });

        DOM.dispatchEvent("beforetransition" + tType, {
          element: view.element
        });
      }

      function handleViewTransitionEnd(e) {
        var viewElement = e.target,
            viewId = viewElement.getAttribute("data-view"), // DOM.data(viewElement, "viewId"),
            view,
            tType,
            currTransition,
            currView;

        if(!viewId) {
          // Not our transition end event (Bubbled from children)
          return;
        }

        view = views[viewId];

        if(!transitionTracker.transitionEnded(view)) {
          // console.log("Transition pending for", view.id, e.propertyName);
          return;
        }

        if(view.isIn()) {
          if(view.wasUnStacked()) {
            // use the transition of view that was unstacked so that it pops or stacks appropriately
            view.reset("unstack");
          }
          tType = "in";
        }else if(view.wasPopped()) {
          view.reset(["showing", "pop"]);
          tType = "out";
        }else if(view.isStacked()) {
          view.show(false);
          tType = "out";
        }

        dispatchViewTransitionEvents(tType, view);

        if(!transitionTracker.inProgress()) {
          // console.log("Transition complete!");
          transitionTracker.clear();
          DOM.removeClass(viewPort, "view-transitioning");
          currTransition = transitionTracker.name();
          currView = viewStack[viewStack.length - 1];
          if(currTransition !== currView.transition) {
            DOM.removeClass(viewPort, currTransition)
                .addClass(viewPort, currView.transition);
            // console.debug("handleViewTransitionEnd() Replacing transition", currTransition,
            //    " -> ", view.transition);
            transitionTracker.name(currView.transition);
          }
        }
      }

      instance = {
        getViewPort: function() {
          return viewPort;
        },
        pushView: function(viewId, opts) {
          var self = this,
              view = views[viewId],
              viewDef,
              viewOptions = Util.shallowCopy({}, opts);

          // If we are already transitioning, ignore this call
          if(transitionTracker.inProgress()) {
            console.log("pushView() View transitioin in progress. Ignoring this call");
            return;
          }

          transitionTracker.inProgress(true);

          if(!view) {
            self.loadView(viewId, function(viewData) {
              if(viewData.error) {
                // clear transition states when there are errors
                transitionTracker.clear();
                throw new Error("Error loading view: " + viewData.error);
              }
              pushViewInternal(viewId, viewOptions);
            });
          }else {
            pushViewInternal(viewId, viewOptions);
          }

          /*
          if(!view) {
            viewDef = VIEW_DEFS[viewId];
            if(!viewDef) {
              // clear transition states when there are errors
              transitionTracker.clear();
              throw new Error("Don't know of view: " + viewId);
            }
            if(!viewDef.factory) {
              self.loadView(viewDef.templatePath, viewPort, function(viewData) {
                if(viewData.error) {
                  // clear transition states when there are errors
                  transitionTracker.clear();
                  throw new Error("Error loading view: " + viewData.error);
                }
                pushViewInternal(viewId, viewOptions);
              });
            }else {
              pushViewInternal(viewId, viewOptions);
            }
          }else {
            pushViewInternal(viewId, viewOptions);
          }
          */
        },
        popView: function(opts) {
          var viewOptions = Util.shallowCopy({}, opts), toViewId = viewOptions.toView;

          // If we are already transitioning, ignore this call
          if(transitionTracker.inProgress()) {
            console.debug("popView() View transitioin in progress. Ignoring this call");
            return;
          }
          if(viewStack.length < 2) {
            throw new Error("Can't pop. One or less view(s)");
          }

          // Indicate that we are transitionin from current view
          transitionTracker.inProgress(true);

          popViewInternal(viewOptions, toViewId);
        },
        currentView: function() {
          var currView = viewStack[viewStack.length - 1];
          return currView ? currView.id : null;
        },
        previousView: function() {
          var preView;
          if(viewStack.length >= 2) {
            preView = viewStack[viewStack.length - 2];
            return preView ? preView.id : null;
          }
          return null;
        },
        indexOfView: function(viewId) {
          var index = -1;
          viewStack.some(function(v, i) {
            if(v.id === viewId) {
              index = i;
              return true;
            }
            return false;
          });
          return index;
        },
        isTransitionInProgress: function() {
          return transitionTracker.inProgress();
        },
        loadView: function(viewId, callback) {
          var viewDef = VIEW_DEFS[viewId];
          if(!viewDef) {
            throw new Error("Don't know of view: " + viewId);
          }
          if(!viewDef.factory) {
            // dispatchViewLoad("start", viewId);
            loadView(viewDef.templatePath, viewPort, function(viewData) {
              // dispatchViewLoad("end", viewId);
              callback({viewId: viewId, error: viewData.error});
            });
          }else {
            callback({viewId: viewId, error: false});
          }
        },
        getViewController: function(viewId) {
          return views[viewId].controller;
        }
      };

      // This is used as context in view factory
      context = StageContext(instance);

      return instance;
    }


    /* ------------------------------------ Some static functions ------------------------------- */

    Stage.defineView = function(viewId, factory) {
      var def = getOrCreateViewDef(viewId, factory);
      def.factory = factory;
    };

    /**
     * Register multiple views with stage. The object contains view id as key and template path as
     * value.
     * {
     *    "main": "views/main.html",
     *    "about": "views/about.html"
     * }
     * @param {type} views
     * @returns {undefined}
     */
    Stage.views = function(views) {
      var def;
      for(var viewId in views) {
        if(!Util.ownsProperty(views, viewId)) {
          continue;
        }
        def = getOrCreateViewDef(viewId);
        def.templatePath = views[viewId];
      }
    };

    /**
     * Register a singel view with stage
     * @param {type} viewId The id of the view. e.g. "main"
     * @param {type} templatePath The path of the view template (html) e.g. "views/main.html"
     */
    Stage.view = function(viewId, templatePath) {
      var def = getOrCreateViewDef(viewId);
      def.templatePath = templatePath;
    };

    return Stage;
  })();



  return Stage;
});

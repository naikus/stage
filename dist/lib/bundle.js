require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function pathToRegExp (path, keys) {
  path = path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, tweak)
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + '$', 'i');

  function tweak (match, slash, format, key, capture, optional) {
    if (match === '*') {
      keys.push(void 0);
      return match;
    }

    keys.push(key);

    slash = slash || '';

    return ''
      + (optional ? '' : slash)
      + '(?:'
      + (optional ? slash : '')
      + (format || '')
      + (capture ? capture.replace(/\*/g, '{0,}').replace(/\./g, '[\\s\\S]') : '([^/]+?)')
      + ')'
      + (optional || '');
  }
}

module.exports = pathToRegExp;

},{}],2:[function(require,module,exports){
var ruta3 = require("ruta3");


module.exports = function RouteHandler(StageInstance) {
  var AppStage = StageInstance,
      router = ruta3(),
      routes = require("../routes"),
      paused = false,
      instance;



  // Add views (also routes) to router
  for(var route in routes) {
    router.addRoute(route, routes[route]);
  }


  function getPath(url) {
    var href = url || window.location.href, hashIdx = href.indexOf("#"), path = "";
    if(hashIdx !== -1) {
      path = href.substring(hashIdx + 1);
    }
    return path;
  }

  function isPaused() {
    return paused;
  }

  function pause() {
    paused = true;
  }

  function handleRouteChange() {
    var path, match, viewInfo, viewId;
    if(isPaused()) {
      return;
    }
    path = getPath();
    match = router.match(path);
    if(!match) {
      console.log("View not found,", path);
      return;
    }

    viewInfo = match.action;
    viewId = viewInfo.view;

    if(AppStage.previousView() === viewId) {
      AppStage.popView();
    }else {
      AppStage.pushView(viewId, {
        route: {
          params: match.params,
          splats: match.splats,
        } 
      });
    }
  }

  instance =  {
    isPaused: isPaused,
    pause: pause,
    getPath: getPath,
    route: function(path) {
      if(getPath() !== path) {
        location.assign("#" + path);
      }else {
        handleRouteChange();
      }
    }
  };

  window.addEventListener("hashchange", handleRouteChange);

  return instance;

};

},{"../routes":4,"ruta3":"ruta3"}],3:[function(require,module,exports){
var Stage = require("stage"),
    Routes = require("./routes"),
    RouteHandler = require("./components/route-handler"),
    AppStage;


var viewInfo;
for(var route in Routes) {
  viewInfo = Routes[route];
  Stage.view(viewInfo.view, viewInfo.template);
}

AppStage = Stage({
  viewport: "#viewPort",
  transition: "lollipop"
});

var routeHandler = RouteHandler(AppStage);


function Nav() {
  var navigation = document.getElementById("nav"),
      items = Array.prototype.slice.call(navigation.getElementsByTagName("a"), 0);
      selectedItem = null;

  function selectItem() {
    if(selectedItem) {
      selectedItem.className = "";
    }
    var path = location.hash;
    items.some(function(a) {
      if(a.href.endsWith(path)) {
        selectedItem = a;
        return true;
      }
      return false;
    });
    if(selectedItem) {
      selectedItem.className = "active";
    }
  }

  window.addEventListener("hashchange", selectItem);

  return {
    selectItem: selectItem,
    clear: function() {
      if(!selectedItem) return;
      selectedItem.className = "";
      selectedItem = null;
    }
  };
}


var navigation = Nav();

module.exports = window.App = {
  run: function() {
    var currPath = routeHandler.getPath(location.href), 
        route = Routes[currPath];
    if(route) {
      routeHandler.route(currPath);
    }else {
      console.log('Defaulting to /home');
      routeHandler.route("/home");
    }
    // Select item at curent path
    navigation.selectItem();
  }
};

},{"./components/route-handler":2,"./routes":4,"stage":"stage"}],4:[function(require,module,exports){
module.exports = {
  "/home": {
    view: "home",
    template: "views/home.html"
  },
  "/getting-started": {
    view: "getting-started",
    template: "views/getting-started.html"
  }
};
},{}],"activables":[function(require,module,exports){
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
},{}],"prismjs":[function(require,module,exports){
(function (global){

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(\w+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					// Check for existence for IE8
					return o.map && o.map(function(v) { return _.util.clone(v); });
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || document.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				pattern = pattern.pattern || pattern;

				for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str),
					    delNum = 1;

					// Greedy patterns can override/remove up to two previously matched tokens
					if (!match && greedy && i != strarr.length - 1) {
						// Reconstruct the original text using the next two tokens
						var nextToken = strarr[i + 1].matchedStr || strarr[i + 1],
						    combStr = str + nextToken;

						if (i < strarr.length - 2) {
							combStr += strarr[i + 2].matchedStr || strarr[i + 2];
						}

						// Try the pattern again on the reconstructed text
						pattern.lastIndex = 0;
						match = pattern.exec(combStr);
						if (!match) {
							continue;
						}

						var from = match.index + (lookbehind ? match[1].length : 0);
						// To be a valid candidate, the new match has to start inside of str
						if (from >= str.length) {
							continue;
						}
						var to = match.index + match[0].length,
						    len = str.length + nextToken.length;

						// Number of tokens to delete and replace with the new match
						delNum = 3;

						if (to <= len) {
							if (strarr[i + 1].greedy) {
								continue;
							}
							delNum = 2;
							combStr = combStr.slice(0, len);
						}
						str = combStr;
					}

					if (!match) {
						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1].length;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.matchedStr = matchedStr || null;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = '';

	for (var name in env.attributes) {
		attributes += (attributes ? ' ' : '') + name + '="' + (env.attributes[name] || '') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}
 	// In worker
	_self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code,
		    immediateClose = message.immediateClose;

		_self.postMessage(_.highlight(code, _.languages[lang], lang));
		if (immediateClose) {
			_self.close();
		}
	}, false);

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			requestAnimationFrame(_.highlightAll, 0);
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/,
	'prolog': /<\?[\w\W]+?\?>/,
	'doctype': /<!DOCTYPE[\w\W]+?>/,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {
					'punctuation': /[=>"']/
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css'
		}
	});
	
	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': {
		pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	}
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\\\|\\?[^\\])*?`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		if(Array.prototype.forEach) { // Check to prevent error in IE8
			Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
				var src = pre.getAttribute('data-src');

				var language, parent = pre;
				var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
				while (parent && !lang.test(parent.className)) {
					parent = parent.parentNode;
				}

				if (parent) {
					language = (pre.className.match(lang) || [, ''])[1];
				}

				if (!language) {
					var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
					language = Extensions[extension] || extension;
				}

				var code = document.createElement('code');
				code.className = 'language-' + language;

				pre.textContent = '';

				code.textContent = 'Loading…';

				pre.appendChild(code);

				var xhr = new XMLHttpRequest();

				xhr.open('GET', src, true);

				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {

						if (xhr.status < 400 && xhr.responseText) {
							code.textContent = xhr.responseText;

							Prism.highlightElement(code);
						}
						else if (xhr.status >= 400) {
							code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
						}
						else {
							code.textContent = '✖ Error: File does not exist or is empty';
						}
					}
				};

				xhr.send(null);
			});
		}

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"ruta3":[function(require,module,exports){
'use strict';

var pathToRegExp = require('./pathToRegExp');

function match (routes, uri, startAt) {
  var captures;
  var i = startAt || 0;

  for (var len = routes.length; i < len; ++i) {
    var route = routes[i];
    var re = route.re;
    var keys = route.keys;
    var splats = [];
    var params = {};

    if (captures = uri.match(re)) {
      for (var j = 1, len = captures.length; j < len; ++j) {
        var value = typeof captures[j] === 'string' ? unescape(captures[j]) : captures[j];
        var key = keys[j - 1];
        if (key) {
          params[key] = value;
        } else {
          splats.push(value);
        }
      }

      return {
        params: params,
        splats: splats,
        route: route.src,
        next: i + 1,
        index: route.index
      };
    }
  }

  return null;
}

function routeInfo (path, index) {
  var src;
  var re;
  var keys = [];

  if (path instanceof RegExp) {
    re = path;
    src = path.toString();
  } else {
    re = pathToRegExp(path, keys);
    src = path;
  }

  return {
     re: re,
     src: path.toString(),
     keys: keys,
     index: index
  };
}

function Router () {
  if (!(this instanceof Router)) {
    return new Router();
  }

  this.routes = [];
  this.routeMap = [];
}

Router.prototype.addRoute = function (path, action) {
  if (!path) {
    throw new Error(' route requires a path');
  }
  if (!action) {
    throw new Error(' route ' + path.toString() + ' requires an action');
  }

  var route = routeInfo(path, this.routeMap.length);
  route.action = action;
  this.routes.push(route);
  this.routeMap.push([path, action]);
}

Router.prototype.match = function (uri, startAt) {
  var route = match(this.routes, uri, startAt);
  if (route) {
    route.action = this.routeMap[route.index][1];
    route.next = this.match.bind(this, uri, route.next);
  }
  return route;
}

module.exports = Router;

},{"./pathToRegExp":1}],"stage":[function(require,module,exports){
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
      hasOwnProperty: function(obj, prop) {
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
          if(Util.hasOwnProperty(data, k)) {
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
                prefix = prefixes[i], prop = prefix ? prefix + "Transition" : "transition";
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
                prefix = prefixes[i], prop = prefix ? prefix + "Animation" : "animation";
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

    console.log(Env);

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
             (success && success(xhr));
           }else {
             (fail && fail(code, xhr));
           }
         }
      });
      xhr.addEventListener("timeout", function() {
        (fail && fail("timeout", xhr));
      });
      // Send!
      xhr.send();
    }

    /**
     * Appends an inline script element to the specified element
     * @param {String} scriptContent The content of the script
     * @param {Element} toElement The HTML element
     * @returns {undefined}
     */
    function addInlineScript(scriptContent, toElement) {
      var script = document.createElement("script");
      script.textContent = scriptContent;
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
            error: error,
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
      DOM.data(this.element, "viewId", id);
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
        viewController = viewDef.factory(instance, viewUi);
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
            transition = "transition" in viewOptions
                ? viewOptions.transition
                : defaultTransition,
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
            viewId = DOM.data(viewElement, "viewId"),
            view = views[viewId],
            tType,
            currTransition,
            currView;

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
          var view = views[viewId],
              viewDef,
              viewOptions = Util.shallowCopy({}, opts);

          // If we are already transitioning, ignore this call
          if(transitionTracker.inProgress()) {
            console.log("pushView() View transitioin in progress. Ignoring this call");
            return;
          }
          
          transitionTracker.inProgress(true);

          if(!view) {
            viewDef = VIEW_DEFS[viewId];
            if(!viewDef) {
              // clear transition states when there are errors
              transitionTracker.clear();
              throw new Error("Don't know of view: " + viewId);
            }
            if(!viewDef.factory) {
              loadView(viewDef.templatePath, viewPort, function(viewData) {
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
        }
      };

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
        if(!views.hasOwnProperty(viewId)) {
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

},{}]},{},[3]);

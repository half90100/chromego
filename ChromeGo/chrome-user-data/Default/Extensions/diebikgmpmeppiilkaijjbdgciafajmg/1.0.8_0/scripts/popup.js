(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.popup = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Compacts given list of paths: keeps smallest right-hand 
 * difference between paths
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _libUtils = require('../lib/utils');

exports['default'] = function (list) {
	var data = (0, _libUtils.unique)(list).map(function (path) {
		return {
			parts: path.split(/\/|\\/).filter(Boolean),
			rightParts: [],
			path: path
		};
	});

	var lookup = {};
	var hasCollision = true,
	    hasNext = true;
	var process = function process(item) {
		if (item.parts.length) {
			item.rightParts.unshift(item.parts.pop());
			var lookupKey = item.rightParts.join('/');
			if (!lookup[lookupKey]) {
				lookup[lookupKey] = true;
			} else {
				hasCollision = true;
			}
		}
		return !!item.parts.length;
	};

	while (hasNext) {
		hasNext = false;
		hasCollision = false;
		lookup = {};
		for (var i = 0, il = data.length; i < il; i++) {
			hasNext = process(data[i]) || hasNext;
		}

		if (!hasCollision) {
			break;
		}
	}

	return data.map(function (item) {
		return {
			label: item.parts.length ? item.rightParts.join('/') : item.path,
			value: item.path
		};
	});
};

;
module.exports = exports['default'];
},{"../lib/utils":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
window._gaq = window._gaq || [];
window._gaq.push(['_setAccount', 'UA-4523560-11']);
loadTracker();

exports['default'] = function (category, action, label) {
	window._gaq.push(['_trackEvent', category, action, label]);
};

function loadTracker() {
	var ga = document.createElement('script');
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
}
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.defaults = defaults;
exports._all = _all;
exports.stop = stop;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function extend(obj) {
	for (var i = 1, il = arguments.length, source; i < il; i++) {
		source = arguments[i];
		if (source) {
			for (var prop in source) {
				obj[prop] = source[prop];
			}
		}
	}

	return obj;
}

var dummyFn = function dummyFn() {};
var anims = [];
var idCounter = 0;

var defaults = {
	duration: 500, // ms
	delay: 0,
	easing: 'linear',
	start: dummyFn,
	step: dummyFn,
	complete: dummyFn,
	autostart: true,
	reverse: false
};

exports['default'] = function (options) {
	return new Tween(options);
};

/**
 * Get or set default value
 * @param  {String} name
 * @param  {Object} value
 * @return {Object}
 */

function defaults(name, value) {
	if (typeof value != 'undefined') {
		defaults[name] = value;
	}

	return defaults[name];
}

/**
 * Returns all active animation objects.
 * For debugging mostly
 * @return {Array}
 */

function _all() {
	return anims;
}

function stop() {
	anims.forEach(function (anim) {
		return anim.stop();
	});
	anims.length = 0;
}

var easings = {
	linear: function linear(t, b, c, d) {
		return c * t / d + b;
	},
	inQuad: function inQuad(t, b, c, d) {
		return c * (t /= d) * t + b;
	},
	outQuad: function outQuad(t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},
	inOutQuad: function inOutQuad(t, b, c, d) {
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * (--t * (t - 2) - 1) + b;
	},
	inCubic: function inCubic(t, b, c, d) {
		return c * (t /= d) * t * t + b;
	},
	outCubic: function outCubic(t, b, c, d) {
		return c * ((t = t / d - 1) * t * t + 1) + b;
	},
	inOutCubic: function inOutCubic(t, b, c, d) {
		if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
		return c / 2 * ((t -= 2) * t * t + 2) + b;
	},
	inExpo: function inExpo(t, b, c, d) {
		return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
	},
	outExpo: function outExpo(t, b, c, d) {
		return t == d ? b + c : c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
	},
	inOutExpo: function inOutExpo(t, b, c, d) {
		if (t == 0) return b;
		if (t == d) return b + c;
		if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005;
		return c / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	inElastic: function inElastic(t, b, c, d, a, p) {
		var s;
		if (t == 0) return b;if ((t /= d) == 1) return b + c;if (!p) p = d * .3;
		if (!a || a < Math.abs(c)) {
			a = c;s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(c / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	outElastic: function outElastic(t, b, c, d, a, p) {
		var s;
		if (t == 0) return b;if ((t /= d) == 1) return b + c;if (!p) p = d * .3;
		if (!a || a < Math.abs(c)) {
			a = c;s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(c / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	inOutElastic: function inOutElastic(t, b, c, d, a, p) {
		var s;
		if (t == 0) return b;
		if ((t /= d / 2) == 2) return b + c;
		if (!p) p = d * (.3 * 1.5);
		if (!a || a < Math.abs(c)) {
			a = c;s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(c / a);
		if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
	},
	inBack: function inBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	outBack: function outBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	inOutBack: function inOutBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
		return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
	},
	inBounce: function inBounce(t, b, c, d) {
		return c - this.outBounce(t, d - t, 0, c, d) + b;
	},
	outBounce: function outBounce(t, b, c, d) {
		if ((t /= d) < 1 / 2.75) {
			return c * (7.5625 * t * t) + b;
		} else if (t < 2 / 2.75) {
			return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
		} else if (t < 2.5 / 2.75) {
			return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
		}
	},
	inOutBounce: function inOutBounce(t, b, c, d) {
		if (t < d / 2) return this.inBounce(t * 2, 0, c, d) * .5 + b;
		return this.outBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
	},
	outHard: function outHard(t, b, c, d) {
		var ts = (t /= d) * t;
		var tc = ts * t;
		return b + c * (1.75 * tc * ts + -7.4475 * ts * ts + 12.995 * tc + -11.595 * ts + 5.2975 * t);
	}
};

exports.easings = easings;

var Tween = (function () {
	function Tween(options) {
		_classCallCheck(this, Tween);

		this.options = extend({}, defaults, options);

		var e = this.options.easing;
		if (typeof e == 'string') {
			if (!easings[e]) {
				throw new Error('Unknown "' + e + '" easing function');
			}
			this.options.easing = easings[e];
		}

		if (typeof this.options.easing !== 'function') {
			throw 'Easing should be a function';
		}

		this._id = 'tw' + idCounter++;

		if (this.options.autostart) {
			this.start();
		}
	}

	/**
  * Start animation from the beginning
  */

	_createClass(Tween, [{
		key: 'start',
		value: function start() {
			if (!this.animating) {
				this.pos = 0;
				this.startTime = Date.now() + (this.options.delay || 0);
				this.infinite = this.options.duration === 'infinite';
				this.endTime = this.infinite ? 0 : this.startTime + this.options.duration;
				this.animating = true;
				this.options.start(this);
				addToQueue(this);
			}

			return this;
		}

		/**
   * Stop animation
   */
	}, {
		key: 'stop',
		value: function stop() {
			if (this.animating) {
				this.animating = false;
				if (this.options.complete) {
					this.options.complete(this);
				}
			}
			return this;
		}
	}, {
		key: 'toggle',
		value: function toggle() {
			if (this.animating) {
				this.stop();
			} else {
				this.start();
			}
		}
	}]);

	return Tween;
})();

exports.Tween = Tween;

function mainLoop() {
	if (!anims.length) {
		// no animations left, stop polling
		return;
	}

	var now = Date.now();
	var filtered = [],
	    tween,
	    opt;

	// do not use Array.filter() of _.filter() function
	// since tween’s callbacks can add new animations
	// in runtime. In this case, filter function will loose
	// newly created animation
	for (var i = 0; i < anims.length; i++) {
		tween = anims[i];

		if (!tween.animating) {
			continue;
		}

		opt = tween.options;

		if (tween.startTime > now) {
			filtered.push(tween);
			continue;
		}

		if (tween.infinite) {
			// opt.step.call(tween, 0);
			opt.step(0, tween);
			filtered.push(tween);
		} else if (tween.pos === 1 || tween.endTime <= now) {
			tween.pos = 1;
			// opt.step.call(tween, opt.reverse ? 0 : 1);
			opt.step(opt.reverse ? 0 : 1, tween);
			tween.stop();
		} else {
			tween.pos = opt.easing(now - tween.startTime, 0, 1, opt.duration);
			// opt.step.call(tween, opt.reverse ? 1 - tween.pos : tween.pos);
			opt.step(opt.reverse ? 1 - tween.pos : tween.pos, tween);
			filtered.push(tween);
		}
	}

	anims = filtered;

	if (anims.length) {
		requestAnimationFrame(mainLoop);
	}
}

function addToQueue(tween) {
	if (anims.indexOf(tween) === -1) {
		anims.push(tween);
		if (anims.length === 1) {
			mainLoop();
		}
	}
}
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.$ = $;
exports.$$ = $$;
exports.toArray = toArray;
exports.toDom = toDom;
exports.extend = extend;
exports.copy = copy;
exports.closest = closest;
exports.unique = unique;
exports.debounce = debounce;
exports.stringifyPath = stringifyPath;
exports.stringifyPatch = stringifyPatch;

function $(selector) {
	var context = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

	return context.querySelector(selector);
}

function $$(selector) {
	var context = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

	return toArray(context.querySelectorAll(selector));
}

function toArray(obj) {
	var ix = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	return Array.prototype.slice.call(obj, 0);
}

function toDom(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	var result = div.firstChild;
	div.removeChild(result);
	return result;
}

/**
 * Extend given object with properties from other objects
 * @param  {Object} obj
 * @return {Object}
 */

function extend(obj) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	args.forEach(function (arg) {
		if (arg) {
			for (var key in arg) if (arg.hasOwnProperty(key)) {
				obj[key] = arg[key];
			}
		}
	});
	return obj;
}

function copy() {
	for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		args[_key2] = arguments[_key2];
	}

	return extend.apply(undefined, [{}].concat(args));
}

function closest(elem, sel) {
	while (elem && elem !== document) {
		if (elem.matches && elem.matches(sel)) {
			return elem;
		}
		elem = elem.parentNode;
	}
}

/**
 * Returns copy of given array with unique values 
 * @param {Array} arr
 * @return {Array}
 */

function unique(arr) {
	var lookup = [];
	return arr.filter(function (val) {
		if (lookup.indexOf(val) < 0) {
			lookup.push(val);
			return true;
		}
	});
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * 
 * @src underscore.js
 * 
 * @param  {Function} func
 * @param  {Number} wait
 * @param  {Boolean} immediate
 * @return {Function}
 */

function debounce(func, wait, immediate) {
	var timeout, args, context, timestamp, result;

	var later = function later() {
		var last = Date.now() - timestamp;

		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			}
		}
	};

	return function () {
		context = this;
		args = arguments;
		timestamp = Date.now();
		var callNow = immediate && !timeout;
		if (!timeout) timeout = setTimeout(later, wait);
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};
}

/**
 * Returns string representation for given node path
 * @param {Array} nodePath
 * @type {String}
 */

function stringifyPath(nodePath) {
	return nodePath.map(function (c) {
		return c[0] + (c[1] > 1 ? '|' + c[1] : '');
	}).join(' / ');
}

/**
 * Returns string representation of given patch JSON
 * @param {Object} patch
 * @type {String}
 */

function stringifyPatch(patch) {
	var str = this.stringifyPath(patch.path) + ' {\n' + patch.update.map(function (prop) {
		return '  ' + prop.name + ': ' + prop.value + ';\n';
	}).join('') + patch.remove.map(function (prop) {
		return '  /* ' + prop.name + ': ' + prop.value + '; */\n';
	}).join('') + '}';

	if (patch.action === 'remove') {
		str = '/* remove: ' + this.stringifyPath(patch.path) + ' */';
	}

	if (patch.hints && patch.hints.length) {
		var hint = patch.hints[patch.hints.length - 1];
		var self = this;

		var before = (hint.before || []).map(function (p) {
			return self.stringifyPath([p]);
		}).join(' / ');

		var after = (hint.after || []).map(function (p) {
			return self.stringifyPath([p]);
		}).join(' / ');

		if (before) {
			str = '/** before: ' + before + ' */\n' + str;
		}

		if (after) {
			str += '\n/** after: ' + after + ' */\n';
		}
	}

	return str.trim();
}
},{}],5:[function(require,module,exports){
/**
 * Main popup controller
 */
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersCompactPaths = require('./helpers/compact-paths');

var _helpersCompactPaths2 = _interopRequireDefault(_helpersCompactPaths);

var _uiSelectBox = require('./ui/select-box');

var selectBox = _interopRequireWildcard(_uiSelectBox);

var _libUtils = require('./lib/utils');

var _uiRemoteView = require('./ui/remote-view');

var _uiRemoteView2 = _interopRequireDefault(_uiRemoteView);

var _libTracker = require('./lib/tracker');

var _libTracker2 = _interopRequireDefault(_libTracker);

var updateDirections = ['both', 'to browser', 'to editor'];
var currentModel = null;

(0, _libTracker2['default'])('Popup', 'open');

function sendMessage(name, data) {
	if (typeof chrome !== 'undefined') {
		chrome.runtime.sendMessage({
			name: name,
			data: data
		});
	}
}

function populateSelect(name, options, selected) {
	var opt = options.map(function (option, i) {
		var selectedAttr = selected === i || selected === option.value ? ' selected="selected"' : '';
		return '<option value="' + option.value + '"' + selectedAttr + '>' + option.label + '</option>';
	});

	return '<select name="' + name + '" id="fld-' + name + '">\n\t\t<option value="">…</option>\n\t\t' + opt.join('') + '\n\t\t</select>';
}

function renderFileItem(label, value, editorFilesView, isUserFile) {
	var parts = label.split('?');
	label = parts.shift();
	if (isUserFile) {
		label += '<i class="file__remove"></i>';
	}
	if (parts.length) {
		label += '<span class="file__browser-addon">' + parts.join('?') + '</span>';
	}

	return '<li class="file-list__item' + (isUserFile ? ' file-list__item_user' : '') + '">\n\t\t<div class="file__browser" data-full-path="' + value + '" title="' + value + '">' + label + '</div>\n\t\t<div class="file__editor">' + editorFilesView + '</div>\n\t\t</li>';
}

function renderFileList() {
	var browserFiles = (0, _helpersCompactPaths2['default'])(currentModel.get('browserFiles') || []);
	var editorFiles = (0, _helpersCompactPaths2['default'])(currentModel.get('editorFiles') || []);
	var userStylesheets = currentModel.get('userStylesheets') || {};
	var assocs = currentModel.associations();

	var html = '<ul class="file-list">' + browserFiles.map(function (file) {
		return renderFileItem(file.label, file.value, populateSelect(file.value, editorFiles, assocs[file.value]));
	}).join('') + Object.keys(userStylesheets).map(function (userId, i) {
		return renderFileItem('user stylesheet ' + (i + 1), userId, populateSelect(userId, editorFiles, assocs[userId]), true);
	}).join('') + '</ul>';

	var fileList = (0, _libUtils.toDom)(html);
	var prevFileList = (0, _libUtils.$)('.file-list');
	var parent = prevFileList.parentNode;
	parent.insertBefore(fileList, prevFileList);
	parent.removeChild(prevFileList);
	selectBox.init(fileList);
	(0, _libUtils.$$)('select', fileList).forEach(function (select) {
		select.addEventListener('change', function () {
			var assocs = (0, _libUtils.copy)(currentModel.get('assocs'));
			assocs[select.name] = select.value;
			currentModel.set('assocs', assocs);
		}, false);
	});

	return fileList;
}

function renderUpdateDirection() {
	var dir = currentModel.get('updateDirection') || updateDirections[0];
	(0, _libUtils.$)('.update-direction').dataset.direction = dir;
}

function cycleUpdateDirection() {
	var elem = (0, _libUtils.$)('.update-direction');
	var dir = elem.dataset.direction || updateDirections[0];
	var next = (updateDirections.indexOf(dir) + 1) % updateDirections.length;
	currentModel.set('updateDirection', updateDirections[next]);
}

function toggleEnabledState() {
	currentModel.set('enabled', (0, _libUtils.$)('#fld-enabled').checked);
}

function renderEnabledState() {
	var enabled = !!currentModel.get('enabled');
	(0, _libUtils.$)('.popup').classList.toggle('popup_enabled', enabled);
	(0, _libUtils.$)('#fld-enabled').checked = enabled;
}

/**
 * Displays temporary message about errors happened
 * in LiveStyle patcher
 * @param  {Boolean} hasError 
 */
function toggleErrorStateMessage(hasError) {
	(0, _libUtils.$)('.error-message').classList.toggle('hidden', !hasError);
}

/**
 * Displays permanent link on error log
 */
function showErrorLogLink() {
	(0, _libUtils.$)('.error-log-link').classList.remove('hidden');
}

function setup() {
	(0, _libUtils.$)('#fld-enabled').addEventListener('change', toggleEnabledState);
	(0, _libUtils.$)('.update-direction').addEventListener('click', cycleUpdateDirection);
	(0, _libUtils.$)('.add-file').addEventListener('click', function (evt) {
		evt.stopPropagation();
		sendMessage('add-user-stylesheet');
	});

	document.addEventListener('click', function (evt) {
		if (evt.target.classList.contains('file__remove')) {
			evt.stopPropagation();
			var browserFile = (0, _libUtils.closest)(evt.target, '.file__browser');
			sendMessage('remove-user-stylesheet', { url: browserFile.dataset.fullPath });
		}
	});
}

function setupModel(model) {
	currentModel = model;
	renderEnabledState();
	renderFileList();
	renderUpdateDirection();
	model.on('update', renderFileList).on('change:enabled', renderEnabledState).on('change:updateDirection', renderUpdateDirection);
}

function resetModel() {
	currentModel.off('update', renderFileList).off('change:enabled', renderEnabledState).off('change:updateDirection', renderUpdateDirection);
	currentModel = null;
}

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
	chrome.runtime.onMessage.addListener(function (message) {
		if (message && message.name === 'log-updated') {
			showErrorLogLink();
		}
	});

	// bind model with view
	chrome.runtime.getBackgroundPage(function (bg) {
		var LiveStyle = bg.LiveStyle;
		var updateActivityState = function updateActivityState() {
			(0, _libUtils.$)('.popup').classList.toggle('status__no-editor', !LiveStyle.isActive());
		};

		// keep track of errors
		LiveStyle.errorStateTracker.on('change:error', toggleErrorStateMessage);
		toggleErrorStateMessage(LiveStyle.errorStateTracker.get('error'));

		if (LiveStyle.hasErrors()) {
			showErrorLogLink();
		}

		updateActivityState();
		setup();
		LiveStyle.updateIconState();
		LiveStyle.editorController.on('change:active', updateActivityState);
		LiveStyle.getCurrentModel(function (model, tab) {
			setupModel(model);
			(0, _uiRemoteView2['default'])(model, (0, _libUtils.$)('.rv'));

			var displayFileWarning = /^file:/.test(model.get('origin') || '') && !LiveStyle.hasOpenedDevTools(tab.id);
			(0, _libUtils.$)('.message_file-proto').classList.toggle('hidden', !displayFileWarning);
			var popup = (0, _libUtils.$)('.popup');
			popup.classList.toggle('status__is-chrome', /^chrome/.test(tab.url));
			popup.classList.toggle('status__no-devtools', !LiveStyle.hasOpenedDevTools(tab.id));
			popup.classList.toggle('status__needs-refresh', model.get('needsRefresh'));

			window.addEventListener('unload', function () {
				resetModel();
				LiveStyle.editorController.off('change:active', updateActivityState);
				LiveStyle.errorStateTracker.off('change:error', toggleErrorStateMessage);
			}, false);
		});
	});
}
},{"./helpers/compact-paths":1,"./lib/tracker":2,"./lib/utils":4,"./ui/remote-view":6,"./ui/select-box":7}],6:[function(require,module,exports){
/**
 * Remote View UI
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.isEnabled = isEnabled;
exports.isExpanded = isExpanded;
exports.toggleExpand = toggleExpand;
exports.notify = notify;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libUtils = require('../lib/utils');

var _libTween = require('../lib/tween');

var _libTween2 = _interopRequireDefault(_libTween);

var _libTracker = require('../lib/tracker');

var _libTracker2 = _interopRequireDefault(_libTracker);

var spinner = '<span class="rv-spinner"><i class="rv-spinner__item"></i><i class="rv-spinner__item"></i><i class="rv-spinner__item"></i></span>';

var messages = {
	unavailable: message('Remote View is not available', 'Remote View only works for web-sites with HTTP, HTTPS and FILE protocols. <span class="rv-learn-more">Learn more</span>'),
	noOrigin: message('Remote View is not available', 'Unable to get URL origin for current page. Please <a href="http://github.com/livestyle/issues/issues" target="_blank">report this issue</a> with URL of your page.'),
	connecting: message('Connecting ' + spinner),
	noApp: message('No LiveStyle App', 'Make sure <a href="http://livestyle.io/" target="_blank">LiveStyle app</a> is running.'),
	reset: message(null, null)
};

exports['default'] = function (model, container) {
	// “Learn more” toggler
	container.addEventListener('click', function (evt) {
		if (evt.target.classList.contains('rv-learn-more') || isExpanded(container)) {
			toggleExpand(container);
		}
	});

	var url = parseUrl(model.get('url'));
	if (!/^(https?|file):$/.test(url.protocol)) {
		container.classList.add('rv__unavailable');
		notify(container, messages.unavailable);
		return (0, _libTracker2['default'])('RV Error', 'unavailable', url.protocol);
	}

	var origin = model.get('origin') || url.origin;
	if (!origin) {
		container.classList.add('rv__unavailable');
		notify(container, messages.noOrigin);
		return (0, _libTracker2['default'])('RV Error', 'no-origin', model.get('url'));
	}

	var localUrl = createLocalUrl(origin, model.get('url'));
	var enabled = false;
	var toggler = getToggler(container);
	var rvPayload = { localSite: origin };

	// check if there’s active RV session for current web-site
	toggler.disabled = true;
	sendMessage('rv-get-session', rvPayload, function (resp) {
		toggler.disabled = false;
		if (!resp || resp.error) {
			return;
		}

		enabled = toggler.checked = true;
		var publicUrl = 'http://' + resp.publicId;
		notify(container, {
			title: '<a href="' + createPublicHref(resp.publicId, localUrl) + '" target="_blank">' + publicUrl + '</a>',
			comment: 'Connected to ' + resp.localSite
		});
	});

	var _lastChange = 0; // prevents from accidental multiple clicks on toggler
	toggler.addEventListener('change', function () {
		if (Date.now() - _lastChange < 500 || this.checked === enabled) {
			return;
		}

		_lastChange = Date.now();
		enabled = this.checked;
		if (enabled) {
			// create new RV session.
			// disable toggler until we get response from back-end, this will
			// prevent from accidental toggles
			toggler.disabled = true;
			notify(container, messages.connecting);
			sendMessage('rv-create-session', rvPayload, function (resp) {
				toggler.disabled = false;
				if (resp.error) {
					enabled = toggler.checked = false;
					notify(container, errorMessage(resp));
				} else {
					notify(container, createSessionMessage(resp, localUrl));
					(0, _libTracker2['default'])('RV', 'new-session', url.protocol);
				}
			});
		} else {
			// close existing session
			sendMessage('rv-close-session', rvPayload);
			notify(container, messages.reset);
		}
	});
};

function isEnabled(container) {
	return getToggler(container).checked;
}

function isExpanded(section) {
	return section.classList.contains('rv__expanded');
}

function toggleExpand(section, callback) {
	if (isExpanded(section)) {
		collapse(section, callback);
	} else {
		expand(section, callback);
	}
}

function notify(container, message) {
	if (typeof message === 'string') {
		message = {
			title: message,
			comment: ''
		};
	}

	if (message.title || message.title === null) {
		notifySection((0, _libUtils.$)('.rv-title', container), message.title);
	}

	if (message.comment || message.comment === null) {
		notifySection((0, _libUtils.$)('.rv-comment', container), message.comment);
	}
}

function notifySection(container, message, callback) {
	if (container._animating) {
		// there’s message change animation running,
		// queue current message
		if (!container._msgQueue) {
			container._msgQueue = [];
		}

		return container._msgQueue.push([message, callback]);
	}

	if (message === null && container._msgDefault) {
		message = container._msgDefault;
	} else if (typeof message === 'string') {
		message = (0, _libUtils.toDom)('<div class="rv-message">' + message + '</div>');
	}

	// measure sizes and positions for previous message
	var pm = (0, _libUtils.$)('.rv-message', container);
	var pcRect = container.getBoundingClientRect();
	var pmRect = pm.getBoundingClientRect();

	// keep reference for default message
	if (!container._msgDefault) {
		container._msgDefault = pm;
	}

	// fix message state
	pm.style.width = pmRect.width + 'px';
	pm.style.left = pmRect.left - pcRect.left + 'px';
	pm.style.top = pmRect.top - pcRect.top + 'px';
	pm.style.position = 'absolute';

	// add new message and get new container state
	message.style.transform = 'translateY(' + pcRect.top + 'px)';
	pm.parentNode.insertBefore(message, pm);
	var ncRect = container.getBoundingClientRect();

	// get ready for animation
	var dh = ncRect.height - pcRect.height;
	container.style.height = pcRect.height + 'px';
	container._animating = true;

	return (0, _libTween2['default'])({
		easing: 'outExpo',
		duration: 300,
		step: function step(pos) {
			pm.style.transform = 'translateY(' + -pos * pcRect.height + 'px)';
			message.style.transform = 'translateY(' + (1 - pos) * pcRect.height + 'px)';
			if (dh) {
				container.style.height = pcRect.height + pos * dh + 'px';
			}
		},
		complete: function complete() {
			container._animating = false;
			pm.parentNode.removeChild(pm);

			// reset previous message state in case if it’s used
			// somewhere else
			pm.style.width = '';
			pm.style.left = '';
			pm.style.top = '';
			pm.style.position = '';

			message.style.transform = '';
			container.style.height = '';
			callback && callback();

			// do we have queued messages?
			if (container._msgQueue && container._msgQueue.length) {
				var queuedItem = container._msgQueue.shift();
				notifySection(container, queuedItem[0], queuedItem[1]);
			}
		}
	});
}

function parseUrl(url) {
	var a = document.createElement('a');
	a.href = url;
	return a;
}

function message(title) {
	var comment = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

	return { title: title, comment: comment };
}

function createSessionMessage(session, localUrl) {
	var publicUrl = 'http://' + session.publicId;
	var publicHref = localUrl ? createPublicHref(session.publicId, localUrl) : publicUrl;
	return {
		title: '<a href="' + publicHref + '" target="_blank">' + publicUrl + '</a>',
		comment: 'Use this URL to view ' + session.localSite + ' in any internet-connect browser, mobile device, virtual machine or share it with your friend and colleagues.'
	};
}

function errorMessage(err) {
	if (err.errorCode === 'ERVNOCONNECTION') {
		return messages.noApp;
	}

	var comment = err.error;
	if (err.errorCode) {
		comment += ' (' + err.errorCode + ')';
	}
	return { title: 'Error', comment: comment };
}

function sendMessage(name, data, callback) {
	if (typeof data === 'function') {
		callback = data;
		data = null;
	}

	data = data || {};
	chrome.runtime.sendMessage({ name: name, data: data }, callback);
}

function expand(section, callback) {
	if (section._animating) {
		return;
	}

	var content = (0, _libUtils.$)('.rv-description', section);
	var rect = section.getBoundingClientRect();
	var offset = rect.top | 0;

	section.classList.add('rv__expanded');
	section._animating = true;

	(0, _libTween2['default'])({
		duration: 400,
		easing: 'outExpo',
		step: function step(pos) {
			section.style.transform = 'translateY(' + -offset * pos + 'px)';
			content.style.height = offset * pos + 'px';
		},
		complete: function complete() {
			section._animating = false;
			callback && callback();
		}
	});
}

function collapse(section, callback) {
	if (section._animating) {
		return;
	}

	var content = (0, _libUtils.$)('.rv-description', section);
	var offset = content.offsetHeight | 0;

	section.classList.remove('rv__expanded');
	section._animating = true;

	(0, _libTween2['default'])({
		duration: 400,
		reverse: true,
		easing: 'outExpo',
		step: function step(pos) {
			section.style.transform = 'translateY(' + -offset * pos + 'px)';
			content.style.height = offset * pos + 'px';
		},
		complete: function complete() {
			section._animating = false;
			section.style.transform = content.style.height = '';
			callback && callback();
		}
	});
}

function getToggler(container) {
	return (0, _libUtils.$)('[name="rv-enabled"]', container);
}

function createPublicHref(publicId, localUrl) {
	if (typeof localUrl === 'string') {
		localUrl = parseUrl(localUrl);
	}
	return 'http://' + publicId + localUrl.pathname + localUrl.search;
}

/**
 * Creates a local URL of given page URL for easier UX management.
 * Mostly used for `file:` origins: creates a fake URL that relative to given
 * origin. This fake URL is easier to parse and replace host name with RV domain
 * @param  {String} origin 
 * @param  {String} pageUrl
 * @return {String}
 */
function createLocalUrl(origin, pageUrl) {
	var url = pageUrl;
	if (/^file:/.test(pageUrl) && pageUrl.indexOf(origin) === 0) {
		url = 'http://livestyle/' + pageUrl.slice(origin.length).split(/[\\\/]/g).filter(Boolean).join('/');
	}
	return url;
}
},{"../lib/tracker":2,"../lib/tween":3,"../lib/utils":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.init = init;
exports.find = find;
exports.convert = convert;
exports.sync = sync;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libUtils = require('../lib/utils');

var boxes = [];

function init(container) {
	(0, _libUtils.$$)('select', container).forEach(convert);
}

function find(sel) {
	var matchedBox = null;
	boxes.some(function (box) {
		if (box._sel === sel) {
			return matchedBox = box;
		}
	});

	return matchedBox;
}

;

function convert(sel) {
	if (!sel.getAttribute('data-select-box')) {
		return new SelectBox(sel);
	}

	return find(sel);
}

;

function sync(sel) {
	var box = find(sel);
	if (box) {
		return box.sync();
	}
}

/**
 * Creates custom select box from given <select>
 * element
 * @param {Element} sel
 */

var SelectBox = (function () {
	function SelectBox(sel) {
		_classCallCheck(this, SelectBox);

		this._sel = sel;
		this.box = el('div', 'select-box');
		this.label = el('span', 'select-box__label');
		this.picker = el('ul', 'select-box__picker');

		this._attachEvents();
		this.sync();
		this._sel.classList.add('offscreen');
		this._sel.setAttribute('data-select-box', 'true');

		this.box.appendChild(this.label);
		this.box.appendChild(this.picker);
		this._sel.parentNode.insertBefore(this.box, this._sel);

		boxes.push(this);
	}

	_createClass(SelectBox, [{
		key: '_attachEvents',
		value: function _attachEvents() {
			var self = this;
			this._sel.addEventListener('change', this.sync.bind(this));
			this._sel.addEventListener('sync', this.sync.bind(this));
			this.label.addEventListener('click', this.toggle.bind(this));
			this.picker.addEventListener('click', function (evt) {
				var pickerItem = (0, _libUtils.closest)(evt.target, '.select-box__picker-item');
				if (pickerItem) {
					self._sel.selectedIndex = +pickerItem.getAttribute('data-ix');
					self.hide();

					var event = self._sel.ownerDocument.createEvent('Events');
					event.initEvent('change', true, true);
					self._sel.dispatchEvent(event);
				}
			});
		}
	}, {
		key: 'toggle',
		value: function toggle() {
			if (this.box.classList.contains('select-box_active')) {
				this.hide();
			} else {
				this.show();
			}
		}
	}, {
		key: 'hide',
		value: function hide() {
			this.box.classList.remove('select-box_active');
		}
	}, {
		key: 'show',
		value: function show() {
			this.picker.classList.remove('select-box__picker_attop');
			this.picker.style.height = '';
			this.box.classList.add('select-box_active');

			// detect picker position and adjust it if required
			var pickerRect = this.picker.getBoundingClientRect();
			var viewportHeight = window.innerHeight;
			if (pickerRect.bottom <= viewportHeight) {
				// select box is completely visible
				return;
			}

			// let’s if it’s visible at top
			this.picker.classList.add('select-box__picker_attop');
			var pickerTopRect = this.picker.getBoundingClientRect();
			if (pickerTopRect.top >= 0) {
				return;
			}

			// picker is not completely visible neither at top nor bottom,
			// pick the best location, e.g. the one with more space
			var topDelta = Math.abs(pickerTopRect.top);
			var bottomDelta = Math.abs(pickerRect.bottom - viewportHeight);
			var height = pickerTopRect.height;
			if (bottomDelta < topDelta) {
				// keep at bottom
				this.picker.classList.remove('select-box__picker_attop');
				height = pickerRect.height;
			}

			this.picker.style.height = height - Math.min(topDelta, bottomDelta) + 'px';
		}

		/**
   * Syncronises select box content with
   * original <select> element
   */
	}, {
		key: 'sync',
		value: function sync() {
			var options = this._sel.options;
			var selIx = this._sel.selectedIndex;
			this.label.innerText = options[selIx] ? options[selIx].label : '...';

			// remove old picker items
			while (this.picker.firstChild) {
				this.picker.removeChild(this.picker.firstChild);
			}

			for (var i = 0, il = options.length, item; i < il; i++) {
				item = el('li', 'select-box__picker-item');
				item.innerText = options[i].label;
				item.setAttribute('data-ix', i);
				if (i === selIx) {
					item.classList.add('select-box__picker-item_selected');
				}
				this.picker.appendChild(item);
			}
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			var ix = boxes.indexOf(this);
			if (~ix) {
				boxes.splice(ix, 1);
			}
			this._sel = this.box = this.label = this.picker = null;
		}
	}]);

	return SelectBox;
})();

exports.SelectBox = SelectBox;

function el(name, className) {
	var elem = document.createElement('div');
	if (className) {
		elem.className = className;
	}
	return elem;
}

document.addEventListener('click', function (evt) {
	// if clicked inside select box – do nothing
	if (!(0, _libUtils.closest)(evt.target, '.select-box')) {
		boxes.forEach(function (box) {
			box.hide();
		});
	}
});
},{"../lib/utils":4}]},{},[5])(5)
});
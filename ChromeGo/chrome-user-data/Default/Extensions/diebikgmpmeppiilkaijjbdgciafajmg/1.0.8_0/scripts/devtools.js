(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.devtools = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var eventMixin = require('./lib/eventMixin');

var defaultConfig = {
	host: 'ws://127.0.0.1:54000',
	timeout: 2000,
	endpoint: '/livestyle'
};

var STATUS_IDLE = 'idle';
var STATUS_CONNECTING = 'connecting';
var STATUS_CONNECTED = 'connected';

var sock = null;
var _timer;
var retry = true;
var status = STATUS_IDLE;

function extend(obj) {
	for (var i = 1, il = arguments.length, src; i < il; i++) {
		src = arguments[i];
		src && Object.keys(src).forEach(function(key) {
			obj[key] = src[key];
		});
	}
	return obj;
}

function createSocket(url, callback) {
	var s = new WebSocket(url);
	s.onclose = function() {
		if (status !== STATUS_CONNECTED && callback) {
			// cannot establish initial connection
			callback();
		}
	};

	s.onopen = function() {
		callback(s);
	};
}

function connect(config, callback) {
	config = extend({}, defaultConfig, config || {});
	status = STATUS_CONNECTING;
	sock = null;

	if (_timer) {
		clearTimeout(_timer);
		_timer = null;
	}

	// create pool of urls we should try before
	// restarting connection sequence
	var urls = (Array.isArray(config.host) ? config.host : [config.host]).map(function(url) {
		return url + config.endpoint;
	});

	var _connect = function() {
		if (!urls.length) {
			return reconnect(config);
		}

		createSocket(urls.shift(), function(s) {
			if (s) {
				// connection established
				sock = s;
				status = STATUS_CONNECTED;
				callback && callback(true, s);
				module.exports.emit('open');

				s.onclose = function() {
					sock = null;
					module.exports.emit('close');
					reconnect(config);
				};

				s.onmessage = handleMessage;
				s.onerror = handleError;
			} else {
				// no connection, try next url
				module.exports.emit('close');
				_connect();
			}
		});
	};
	_connect();
}

function reconnect(config, callback) {
	if (config.timeout && retry) {
		_timer = setTimeout(connect, config.timeout, config, callback);
	} else {
		status = STATUS_IDLE;
	}
}

function handleMessage(evt) {
	var payload = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
	module.exports.emit('message-receive', payload.name, payload.data);
	module.exports.emit(payload.name, payload.data);
}

function handleError(e) {
	module.exports.emit('error', e);
}

module.exports = extend({
	config: function(data) {
		if (typeof data === 'object') {
			extend(defaultConfig, data);
		}
		return defaultConfig;
	},
	
	/**
	 * Establishes connection to server
	 * @param {Object} config Optional connection config
	 * @param {Function} callback A function called with connection status
	 */
	connect: function(config, callback) {
		if (typeof config === 'function') {
			callback = config;
			config = {};
		}

		if (status === STATUS_IDLE) {
			retry = true;
			connect(config, callback);
		} else if (status === STATUS_CONNECTED && callback) {
			callback(true, sock);
		}

		return this;
	},

	/**
	 * Drop connection to server
	 */
	disconnect: function() {
		if (this.connected) {
			retry = false;
			status = STATUS_IDLE;
			sock.close();
		}
		return this;
	},

	/**
	 * Sends given message to socket server
	 * @param  {String} message
	 */
	send: function(name, data) {
		if (this.connected) {
			module.exports.emit('message-send', name, data);
			sock && sock.send(JSON.stringify({
				name: name,
				data: data
			}));
		}
		return this;
	},

	/**
	 * Update status (for debugging and unit-testing)
	 */
	_setStatus: function(value) {
		status = value;
	}
}, eventMixin);

Object.defineProperties(module.exports, {
	connected: {
		enumerable: true,
		get: function() {
			return status === STATUS_CONNECTED;
		}
	},
	status: {
		enumerable: true,
		get: function() {
			return status;
		}
	}
});
},{"./lib/eventMixin":2}],2:[function(require,module,exports){
/**
 * A simple event dispatcher mixin, borrowed from Backbone.Event.
 * Users should extend their objects/modules with this mixin.
 */
// Regular expression used to split event strings
var eventSplitter = /\s+/;

// Create a local reference to slice/splice.
var slice = Array.prototype.slice;

module.exports = {
	/**
	 * Bind one or more space separated events, `events`, to a `callback`
	 * function. Passing `"all"` will bind the callback to all events fired.
	 * @param {String} events
	 * @param {Function} callback
	 * @param {Object} context
	 * @memberOf eventDispatcher
	 */
	on: function(events, callback, context) {
		var calls, event, node, tail, list;
		if (!callback)
			return this;
		
		events = events.split(eventSplitter);
		calls = this._callbacks || (this._callbacks = {});

		// Create an immutable callback list, allowing traversal during
		// modification.  The tail is an empty object that will always be used
		// as the next node.
		while (event = events.shift()) {
			list = calls[event];
			node = list ? list.tail : {};
			node.next = tail = {};
			node.context = context;
			node.callback = callback;
			calls[event] = {
				tail : tail,
				next : list ? list.next : node
			};
		}

		return this;
	},

	/**
	 * Remove one or many callbacks. If `context` is null, removes all
	 * callbacks with that function. If `callback` is null, removes all
	 * callbacks for the event. If `events` is null, removes all bound
	 * callbacks for all events.
	 * @param {String} events
	 * @param {Function} callback
	 * @param {Object} context
	 */
	off: function(events, callback, context) {
		var event, calls, node, tail, cb, ctx;

		// No events, or removing *all* events.
		if (!(calls = this._callbacks))
			return;
		if (!(events || callback || context)) {
			delete this._callbacks;
			return this;
		}

		// Loop through the listed events and contexts, splicing them out of the
		// linked list of callbacks if appropriate.
		events = events ? events.split(eventSplitter) : _.keys(calls);
		while (event = events.shift()) {
			node = calls[event];
			delete calls[event];
			if (!node || !(callback || context))
				continue;
			// Create a new list, omitting the indicated callbacks.
			tail = node.tail;
			while ((node = node.next) !== tail) {
				cb = node.callback;
				ctx = node.context;
				if ((callback && cb !== callback) || (context && ctx !== context)) {
					this.on(event, cb, ctx);
				}
			}
		}

		return this;
	},
	
	/**
	 * Trigger one or many events, firing all bound callbacks. Callbacks are
	 * passed the same arguments as `trigger` is, apart from the event name
	 * (unless you're listening on `"all"`, which will cause your callback
	 * to receive the true name of the event as the first argument).
	 * @param {String} events
	 */
	emit: function(events) {
		var event, node, calls, tail, args, all, rest;
		if (!(calls = this._callbacks))
			return this;
		all = calls.all;
		events = events.split(eventSplitter);
		rest = slice.call(arguments, 1);

		// For each event, walk through the linked list of callbacks twice,
		// first to trigger the event, then to trigger any `"all"` callbacks.
		while (event = events.shift()) {
			if (node = calls[event]) {
				tail = node.tail;
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, rest);
				}
			}
			if (node = all) {
				tail = node.tail;
				args = [ event ].concat(rest);
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, args);
				}
			}
		}

		return this;
	}
};
},{}],3:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _devtoolsResources = require('./devtools/resources');

var resources = _interopRequireWildcard(_devtoolsResources);

var port = chrome.runtime.connect({
	name: 'devtools-page:' + chrome.devtools.inspectedWindow.tabId
});

function send(name, data) {
	port.postMessage({
		name: name,
		data: data
	});
}

function log() {
	send('log', Array.prototype.slice.call(arguments, 0));
}

port.onMessage.addListener(function (message) {
	log('Received message', message);
	switch (message.name) {
		case 'diff':
			resources.get(message.data.uri, function (res) {
				res && res.patch(message.data.patches);
			});
			break;
		case 'pending-patches':
			resources.applyPendingPatches(message.data);
			break;
		case 'get-stylesheets':
			resources.list(function (urls) {
				send('stylesheets', urls.filter(Boolean));
			});
			break;
		case 'get-stylesheet-content':
			resources.get(message.data.url, function (res) {
				send('stylesheet-content', {
					content: res ? res.content : null
				});
			});
			break;
		case 'reset':
			resources.reset();
			break;
	}
});

resources.on('log', function (strings) {
	return log.apply(undefined, _toConsumableArray(strings));
}).on('update', function (url, content) {
	return send('resource-updated', { url: url, content: content });
});

chrome.devtools.panels.create('LiveStyle', 'icon/icon48.png', 'deprecated.html');

log('Connected');
},{"./devtools/resources":4}],4:[function(require,module,exports){
/**
 * Resource manager for DevTools: handles updates and
 * patching of instected we page resources
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.get = get;
exports.applyPendingPatches = applyPendingPatches;
exports.list = list;
exports.reset = reset;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _livestyleClient = require('livestyle-client');

var _livestyleClient2 = _interopRequireDefault(_livestyleClient);

var _libUtils = require('../lib/utils');

var _libCrc32 = require('../lib/crc32');

var _libCrc322 = _interopRequireDefault(_libCrc32);

var _libEventEmitter = require('../lib/event-emitter');

var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

var stylesheets = {};
var reStylesheet = /^blob:|\.css$/;
var emitter = new _libEventEmitter2['default']();

var on = emitter.on.bind(emitter);
var off = emitter.off.bind(emitter);
var emit = emitter.emit.bind(emitter);

/**
 * Initial resource loader: retrieves all stylesheet resources
 * from inspected page and keeps them in `stylesheets` collection
 * for patching
 */
var loadStylesheets = initStylesheetLoader();

exports.on = on;
exports.off = off;
exports.emit = emit;

/**
 * Returns resource by its url
 * @param {String} url Resource URL
 * @param {Function} callback Callback invoked when resource 
 * is fetched from backend
 */

function get(url, callback) {
	log('Requested', url);
	loadStylesheets.then(function () {
		callback(stylesheets[url]);
	});
}

function applyPendingPatches(payload) {
	loadStylesheets.then(function () {
		Object.keys(payload).forEach(function (url) {
			if (url in stylesheets) {
				log('Apply pending patches on', url, payload[url]);
				stylesheets[url].patch(payload[url]);
			}
		});
	});
}

/**
 * Returns list of URLs of all available stylesheets
 */

function list(callback) {
	loadStylesheets.then(function () {
		callback(Object.keys(stylesheets));
	});
}

function reset() {
	// explicitly break reference for Resource
	Object.keys(stylesheets).forEach(function (key) {
		return stylesheets[key].reset();
	});
	stylesheets = {};
	loadStylesheets = initStylesheetLoader();
}

function initStylesheetLoader() {
	return new Promise(function (resolve, reject) {
		chrome.devtools.inspectedWindow.getResources(function (resources) {
			resources = resources.filter(isStylesheet);
			stylesheets = {};

			var next = function next() {
				if (!resources.length) {
					log('Loaded stylesheets:', Object.keys(stylesheets));
					return resolve(stylesheets);
				}

				var res = resources.pop();
				res.getContent(function (content) {
					stylesheets[res.url] = new Resource(res, content);
					next();
				});
			};
			next();
		});
	});
}

function isStylesheet(res) {
	return res.type ? res.type === 'stylesheet' && res.url : isStylesheetURL(res.url);
}

function isStylesheetURL(url) {
	return reStylesheet.test(url.split('?')[0]);
}

function log() {
	emit('log', Array.prototype.slice.call(arguments, 0));
}

var Resource = (function () {
	function Resource(reference, content) {
		_classCallCheck(this, Resource);

		this._content = '';
		this._hash = null;
		this._patching = false;
		this._commitTimeout = null;

		this.reference = reference;
		this.content = content;
		this.pendingPatches = [];
		this._setInitialContent();
	}

	_createClass(Resource, [{
		key: '_setInitialContent',
		value: function _setInitialContent() {
			_livestyleClient2['default'].send('initial-content', {
				uri: this.url,
				syntax: 'css',
				hash: this.hash,
				content: this.content
			});
		}
	}, {
		key: 'patch',
		value: function patch(patches) {
			if (patches) {
				this.pendingPatches = this.pendingPatches.concat(patches);
			}

			log('Patch request for', this.reference.url);
			if (!this.isPatching && this.pendingPatches.length) {
				this._patching = true;
				log('Applying patch on', this.url);
				_livestyleClient2['default'].send('apply-patch', {
					uri: this.url,
					syntax: 'css',
					hash: 'devtools',
					content: this.content,
					patches: this.pendingPatches
				});
				this.pendingPatches = [];
			}
		}
	}, {
		key: 'commitPatch',
		value: function commitPatch(content, ranges) {
			var _this = this;

			// Resource commiting is very slow operation, especially combined
			// with preceding `apply-patch`/`patch` operations. If we commit
			// resource upon request, we can introduce “jank”: it may revert
			// changes already applied by much faster CSSOM updater.
			// Thus we have to postpone resource commiting as mush as possible to
			// apply only the most recent updates
			if (this._commitTimeout) {
				clearTimeout(this._commitTimeout);
			}

			log('Queueing patch commit for', this.url);
			this._commitTimeout = setTimeout(function () {
				_this._commitTimeout = null;
				if (_this.pendingPatches.length) {
					log('Pending patches, cancel current update for', _this.url);
					// there are more recent updates waiting to be applied, skip
					// current update to not revert CSSOM updates and apply pending
					// patches since last patch() request
					_this._patching = false;
					_this.content = content;
					return _this.patch();
				}

				log('Request resource commit for', _this.url);
				_this.reference.setContent(content, true, function (err) {
					if (!err || err.code === 'OK') {
						log('Resource committed successfully for', _this.url);
						_this.content = content;
						_this._setInitialContent();
					} else {
						log('Error commiting new content for', _this.url, err);
					}

					// apply pending patches since last patch() request
					_this._patching = false;
					_this.patch();
				});
			}, 200);
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.reference = this._content = this.pendingPatches = null;
			if (this._commitTimeout) {
				clearTimeout(this._commitTimeout);
			}
		}
	}, {
		key: 'url',
		get: function get() {
			return this.reference.url;
		}
	}, {
		key: 'content',
		get: function get() {
			return this._content;
		},
		set: function set(value) {
			this._content = value || '';
			this._hash = null;
		}
	}, {
		key: 'hash',
		get: function get() {
			if (!this._hash) {
				this._hash = (0, _libCrc322['default'])(this.content);
			}
			return this._hash;
		}
	}, {
		key: 'isPatching',
		get: function get() {
			return this._patching;
		}
	}]);

	return Resource;
})();

chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function (res, content) {
	var stylesheet = stylesheets[res.url];
	if (stylesheet && !stylesheet.isPatching && stylesheet.content !== content) {
		// This update is coming from user update
		log('Resource committed, request diff for', res.url);
		stylesheet.content = content;
		_livestyleClient2['default'].send('calculate-diff', {
			uri: res.url,
			syntax: 'css',
			content: content,
			hash: (0, _libCrc322['default'])(content)
		});
		emit('update', res.url, content);
	}
});

chrome.devtools.inspectedWindow.onResourceAdded.addListener(function (res) {
	if (isStylesheet(res) && !stylesheets[res.url]) {
		res.getContent(function (content) {
			stylesheets[res.url] = new Resource(res, content);
		});
	}
});

// connect to LiveStyle server
_livestyleClient2['default'].on('patch', function (data) {
	if (data.uri in stylesheets && data.hash === 'devtools') {
		stylesheets[data.uri].commitPatch(data.content, data.ranges);
	}
}).connect();
},{"../lib/crc32":5,"../lib/event-emitter":6,"../lib/utils":7,"livestyle-client":1}],5:[function(require,module,exports){
/**
 * Fast CRC32 algorithm for strings.
 * Original source: https://github.com/SheetJS/js-crc32
 * © 2014 SheetJS — http://sheetjs.com
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var table = new Array(256);
for (var n = 0, c; n != 256; ++n) {
	c = n;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	table[n] = c;
}

if (typeof Int32Array !== 'undefined') {
	table = new Int32Array(table);
}

exports['default'] = function (str) {
	for (var crc = -1, i = 0, L = str.length, c, d; i < L;) {
		c = str.charCodeAt(i++);
		if (c < 0x80) {
			crc = crc >>> 8 ^ table[(crc ^ c) & 0xFF];
		} else if (c < 0x800) {
			crc = crc >>> 8 ^ table[(crc ^ (192 | c >> 6 & 31)) & 0xFF];
			crc = crc >>> 8 ^ table[(crc ^ (128 | c & 63)) & 0xFF];
		} else if (c >= 0xD800 && c < 0xE000) {
			c = (c & 1023) + 64;d = str.charCodeAt(i++) & 1023;
			crc = crc >>> 8 ^ table[(crc ^ (240 | c >> 8 & 7)) & 0xFF];
			crc = crc >>> 8 ^ table[(crc ^ (128 | c >> 2 & 63)) & 0xFF];
			crc = crc >>> 8 ^ table[(crc ^ (128 | d >> 6 & 15 | c & 3)) & 0xFF];
			crc = crc >>> 8 ^ table[(crc ^ (128 | d & 63)) & 0xFF];
		} else {
			crc = crc >>> 8 ^ table[(crc ^ (224 | c >> 12 & 15)) & 0xFF];
			crc = crc >>> 8 ^ table[(crc ^ (128 | c >> 6 & 63)) & 0xFF];
			crc = crc >>> 8 ^ table[(crc ^ (128 | c & 63)) & 0xFF];
		}
	}
	return crc ^ -1;
};

;
module.exports = exports['default'];
},{}],6:[function(require,module,exports){
/**
 * A simple event emitter, borrowed from Backbone.Event.
 */
'use strict';

// Regular expression used to split event strings
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var eventSplitter = /\s+/;

// Create a local reference to slice/splice.
var slice = Array.prototype.slice;

var EventEmitter = (function () {
	function EventEmitter() {
		_classCallCheck(this, EventEmitter);
	}

	_createClass(EventEmitter, [{
		key: 'on',

		/**
   * Bind one or more space separated events, `events`, to a `callback`
   * function. Passing `"all"` will bind the callback to all events fired.
   * @param {String} events
   * @param {Function} callback
   * @param {Object} context
   * @memberOf eventDispatcher
   */
		value: function on(events, callback, context) {
			var calls, event, node, tail, list;
			if (!callback) return this;

			events = events.split(eventSplitter);
			calls = this._callbacks || (this._callbacks = {});

			// Create an immutable callback list, allowing traversal during
			// modification.  The tail is an empty object that will always be used
			// as the next node.
			while (event = events.shift()) {
				list = calls[event];
				node = list ? list.tail : {};
				node.next = tail = {};
				node.context = context;
				node.callback = callback;
				calls[event] = {
					tail: tail,
					next: list ? list.next : node
				};
			}

			return this;
		}

		/**
   * Remove one or many callbacks. If `context` is null, removes all
   * callbacks with that function. If `callback` is null, removes all
   * callbacks for the event. If `events` is null, removes all bound
   * callbacks for all events.
   * @param {String} events
   * @param {Function} callback
   * @param {Object} context
   */
	}, {
		key: 'off',
		value: function off(events, callback, context) {
			var event, calls, node, tail, cb, ctx;

			// No events, or removing *all* events.
			if (!(calls = this._callbacks)) return;
			if (!(events || callback || context)) {
				delete this._callbacks;
				return this;
			}

			// Loop through the listed events and contexts, splicing them out of the
			// linked list of callbacks if appropriate.
			events = events ? events.split(eventSplitter) : _.keys(calls);
			while (event = events.shift()) {
				node = calls[event];
				delete calls[event];
				if (!node || !(callback || context)) continue;
				// Create a new list, omitting the indicated callbacks.
				tail = node.tail;
				while ((node = node.next) !== tail) {
					cb = node.callback;
					ctx = node.context;
					if (callback && cb !== callback || context && ctx !== context) {
						this.on(event, cb, ctx);
					}
				}
			}

			return this;
		}

		/**
   * Trigger one or many events, firing all bound callbacks. Callbacks are
   * passed the same arguments as `emit` is, apart from the event name
   * (unless you're listening on `"all"`, which will cause your callback
   * to receive the true name of the event as the first argument).
   * @param {String} events
   */
	}, {
		key: 'emit',
		value: function emit(events) {
			var event, node, calls, tail, args, all, rest;
			if (!(calls = this._callbacks)) {
				return this;
			}
			all = calls.all;
			events = events.split(eventSplitter);
			rest = slice.call(arguments, 1);

			// For each event, walk through the linked list of callbacks twice,
			// first to trigger the event, then to trigger any `"all"` callbacks.
			while (event = events.shift()) {
				if (node = calls[event]) {
					tail = node.tail;
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || this, rest);
					}
				}
				if (node = all) {
					tail = node.tail;
					args = [event].concat(rest);
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || this, args);
					}
				}
			}

			return this;
		}
	}]);

	return EventEmitter;
})();

exports['default'] = EventEmitter;
module.exports = exports['default'];
},{}],7:[function(require,module,exports){
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
},{}]},{},[3])(3)
});
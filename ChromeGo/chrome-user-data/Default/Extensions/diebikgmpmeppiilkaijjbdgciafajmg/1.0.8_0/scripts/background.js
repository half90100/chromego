(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.background = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
/**
 * Main patcher module — a function that takes LiveStyle
 * client instance and listens specific events.
 * Note: client must be already connected to server (or at least
 * connection should be initiated)
 */
var CommandQueue = require('./lib/command-queue');

var currentClient = null;
var response = {
	'calculate-diff': function(data, command) {
		currentClient.send('diff', {
			uri: command.data.uri,
			syntax: command.data.syntax,
			patches: data
		});
	},
	'apply-patch': function(data, command) {
		var resp = {
			uri: command.data.uri,
			content: data.content,
			ranges: data.ranges
		};

		if (data.hash) {
			resp.hash = data.hash;
		}

		currentClient.send('patch', resp);
	},
	'initial-content': function(data, command) {}
};

/**
 * Identifies itself as a patcher for LiveStyle server
 * @param  {Client} client LiveStyle client instance
 */
function identify(client) {
	currentClient.send('patcher-connect');
}

module.exports = function(client, options) {
	options = options || {};
	currentClient = client;

	var worker = new Worker(options.worker || './lib/worker.js');
	var queue = new CommandQueue(worker);

	worker.addEventListener('message', function(evt) {
		var payload = evt.data;
		if (typeof payload === 'string') {
			payload = JSON.parse(payload);
		}

		if (payload.name === 'request-files' && currentClient) {
			currentClient.send(payload.name, payload.data);
		}
	});

	Object.keys(response).forEach(function(event) {
		client.on(event, function(data) {
			queue.add(event, data, function(status, responseData, command) {
				if (status !== 'ok') {
					var err = {
						message: responseData,
						origin: {
							name: command.name
						}
					};

					if (command.data && command.data.uri) {
						err.origin.uri = command.data.uri;
					}

					return client.send('error', err);
				}
				response[event](responseData, command);
			});
		});
	});

	client
		.on('open', identify)
		.on('files', function(data) {
			worker.postMessage({
				name: 'files',
				data: data
			});
		});

	if (client.connected) {
		identify();
	}

	return queue;
};
},{"./lib/command-queue":4}],4:[function(require,module,exports){
/**
 * Command queue batches patcher commands execution in worker
 * thread until currently running command is finished.
 *
 * Although Web Worker hosts has their own queue and 
 * batch `postMessage()` calls until workers’ event loop finish
 * execution, using custom queue has a very big advantage. 
 * For example, a burst of diff requests for the same file
 * can be squashed into a single command that will be sent to 
 * worker thread.
 */
var eventMixin = require('./event-mixin');
var commandId = 0;

function Command(name, data, callback) {
	this.id = 'command' + commandId++;
	this.name = name;
	this.data = data || {};
	this.callback = callback;
}

Command.prototype = {
	toJSON: function() {
		return {
			commandId: this.id,
			name: this.name,
			data: this.data
		};
	}
};

function similar(command, name, data) {
	return command.name === name && command.data.uri === data.uri;
}

function CommandQueue(worker) {
	if (!(this instanceof CommandQueue)) {
		return new CommandQueue(worker);
	}

	this.queue = [];
	this.expect = null;
	this.worker = worker;
	var self = this;
	worker.addEventListener('message', function(evt) {
		var payload = evt.data;
		var expect = self.expect;
		if (expect && expect.id === payload.commandId) {
			// received currently expected command
			self.emit('command-reply', payload);
			expect.callback && expect.callback(payload.status, payload.data, expect);
			self.expect = null;
			self.next();
		}
	});
}

CommandQueue.prototype = {
	/**
	 * Add command to queue. Some commands can be optimized
	 * and merged into existing commands in queue
	 * @param {String} name Command name
	 * @param {Object} data Command payload
	 * @param {Function} callback Function to execute when
	 * command is finished
	 */
	add: function(name, data, callback) {
		data = data || {};
		// let’s see if given command can be optimized
		var optimized = false;
		if (name === 'calculate-diff') {
			// Optimize diff calculation: in most cases
			// this message will be sent very often, on every
			// single update by user. Thus, we don’t have to calculate
			// all updates, we need the most recent one
			this.queue.some(function(command) {
				if (similar(command, name, data) && !command.data.previous && !data.previous) {
					command.data = data;
					return optimized = true;
				}
			});
		} else if (name === 'apply-patch') {
			// Optimize patch apply: multiple patches for
			// the same document can be easily condensed
			// so there’s no need to parse & evaluate source
			// for every single patch
			this.queue.some(function(command) {
				if (similar(command, name, data)) {
					var patches = command.data.patches.concat(data.patches);
					command.data = data;
					command.data.patches = patches;
					return optimized = true;
				}
			});
		} else if (name === 'initial-content') {
			// For initial content, simply replace payload
			this.queue.some(function(command) {
				if (similar(command, name, data)) {
					command.data = data;
					return optimized = true;
				}
			});
		}

		if (!optimized) {
			this.queue.push(new Command(name, data, callback));
			this.next();
		}

		return this;
	},

	/**
	 * Runs next command in queue, if possible
	 */
	next: function() {
		if (!this.expect && this.queue.length) {
			this.expect = this.queue.shift();
			var payload = this.expect.toJSON();
			this.emit('command-create', payload);
			this.worker.postMessage(payload);
		}
		return this;
	}
};

// Add event dispatcher on command queue
Object.keys(eventMixin).forEach(function(key) {
	CommandQueue.prototype[key] = eventMixin[key];
});

module.exports = CommandQueue;
},{"./event-mixin":5}],5:[function(require,module,exports){
/**
 * A simple event dispatcher mixin, borrowed from Backbone.Event.
 * Users should extend their objects/modules with this mixin.
 * @example
 * define(['lodash', 'eventMixin'], function(_, eventMixin) {
 * 	return _.extend({
 * 		...
 * 	}, eventMixin);
 * })
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
	 * passed the same arguments as `emit` is, apart from the event name
	 * (unless you're listening on `"all"`, which will cause your callback
	 * to receive the true name of the event as the first argument).
	 * @param {String} events
	 */
	emit: function(events) {
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
				args = [ event ].concat(rest);
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, args);
				}
			}
		}

		return this;
	}
};
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.getCurrentModel = getCurrentModel;
exports.hasErrors = hasErrors;
exports.log = log;
exports.isActive = isActive;
exports.hasOpenedDevTools = hasOpenedDevTools;
exports.updateIconState = updateIconState;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _livestyleClient = require('livestyle-client');

var _livestyleClient2 = _interopRequireDefault(_livestyleClient);

var _livestylePatcher = require('livestyle-patcher');

var _livestylePatcher2 = _interopRequireDefault(_livestylePatcher);

var _libEventEmitter = require('./lib/event-emitter');

var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

var _controllersEditor = require('./controllers/editor');

var _controllersEditor2 = _interopRequireDefault(_controllersEditor);

var _controllersErrorTracker = require('./controllers/error-tracker');

var _controllersErrorTracker2 = _interopRequireDefault(_controllersErrorTracker);

var _controllersModel = require('./controllers/model');

var modelController = _interopRequireWildcard(_controllersModel);

var _controllersDevtools = require('./controllers/devtools');

var devtoolsController = _interopRequireWildcard(_controllersDevtools);

var _controllersBrowserActionIcon = require('./controllers/browser-action-icon');

var iconController = _interopRequireWildcard(_controllersBrowserActionIcon);

var _controllersErrorLogger = require('./controllers/error-logger');

var errorLogger = _interopRequireWildcard(_controllersErrorLogger);

var _controllersRemoteView = require('./controllers/remote-view');

var _helpersUserStylesheets = require('./helpers/user-stylesheets');

var userStylesheets = _interopRequireWildcard(_helpersUserStylesheets);

var _helpersGetStylesheetContent = require('./helpers/get-stylesheet-content');

var _helpersGetStylesheetContent2 = _interopRequireDefault(_helpersGetStylesheetContent);

var _libUtils = require('./lib/utils');

var utils = _interopRequireWildcard(_libUtils);

var workerCommandQueue = (0, _livestylePatcher2['default'])(_livestyleClient2['default'], {
	worker: './scripts/worker.js'
});

/**
 * Returns model for currently opened page
 */

function getCurrentModel(callback) {
	modelController.current(callback);
}

function hasErrors() {
	return !!errorLogger.getLog().length;
}

function log(message) {
	console.log('%c[Content]', 'background:#e67e22;color:#fff', message);
}

/**
 * Check if there’s active connection to editor
 * @return {Boolean}
 */

function isActive() {
	return _controllersEditor2['default'].get('active');
}

function hasOpenedDevTools(tabId) {
	return devtoolsController.isOpenedForTab(tabId);
}

function updateIconState() {
	iconController.update();
}

exports.editorController = _controllersEditor2['default'];
exports.errorStateTracker = _controllersErrorTracker2['default'];

/**
 * Returns URI of associated editor file of given model for given 
 * browser URI.
 * @param  {LivestyleModel} model
 * @param  {String} uri Editor URI
 * @return {String}     Matched browser URL
 */
function matchedEditorUri(model, uri) {
	// maybe this URI matches user stylesheet?
	var user = model.get('userStylesheets');
	uri = Object.keys(user).reduce(function (prev, key) {
		return user[key] === uri ? key : prev;
	}, uri);
	return model.associations()[uri];
}

/**
 * Returns URI of associated browser file of given model for given 
 * editor URI.
 * @param  {LivestyleModel} model
 * @param  {String} uri Editor URI
 * @return {String}     Matched browser URL
 */
function matchedBrowserUri(model, uri) {
	var assocs = model.associations();
	var browserUri = null;
	Object.keys(assocs).some(function (key) {
		if (assocs[key] === uri) {
			return browserUri = key;
		}
	});

	var user = model.get('userStylesheets');
	if (browserUri in user) {
		browserUri = user[browserUri];
	}

	return browserUri;
}

function handleDiffForPage(page, data) {
	var editorUri = matchedEditorUri(page.model, data.uri);
	var browserUri = matchedBrowserUri(page.model, data.uri);
	if (editorUri) {
		// This diff result is for browser file, meaning that browser
		// file was updated and editor should receive these changes.

		// XXX send two 'incoming-updates' messages in case if updates
		// are coming from DevTools, e.g. user updates local stylesheet
		// then send it to all connected clients to update accordingly
		_livestyleClient2['default'].send('incoming-updates', {
			uri: data.uri,
			patches: data.patches
		});

		if (page.model.get('updateDirection') !== 'to browser') {
			_livestyleClient2['default'].send('incoming-updates', {
				uri: editorUri,
				patches: data.patches
			});
		}
	} else if (browserUri) {
		// Looks like this diff result is coming from editor file:
		// patch corresponding browser file
		_livestyleClient2['default'].send('incoming-updates', {
			uri: browserUri,
			patches: data.patches
		});

		if (page.model.get('updateDirection') !== 'to editor') {
			logPatches(browserUri, data.patches);
			chrome.tabs.sendMessage(page.tab.id, {
				name: 'apply-cssom-patch',
				data: {
					stylesheetUrl: browserUri,
					patches: data.patches
				}
			});
			devtoolsController.saveDiff(page.tab.id, browserUri, data.patches);
		}
	}
}

function applyDiff(data) {
	if (!data.patches || !data.patches.length) {
		return;
	}

	modelController.active(function (pages) {
		pages.forEach(function (page) {
			return handleDiffForPage(page, data);
		});
	});
}

function logPatches(prefix, patches) {
	console.groupCollapsed('apply diff on', prefix);
	patches.forEach(function (p) {
		console.log(utils.stringifyPatch(p));
	});
	console.groupEnd();
}

function identify() {
	_livestyleClient2['default'].send('client-id', { id: 'chrome' });
}

self.LiveStyle = utils.extend({
	/**
  * Returns model for currently opened page
  */
	getCurrentModel: function getCurrentModel(callback) {
		modelController.current(callback);
	},

	hasErrors: function hasErrors() {
		return !!errorLogger.getLog().length;
	},

	log: function log(message) {
		console.log('%c[Content]', 'background:#e67e22;color:#fff', message);
	},

	/**
  * Check if there’s active connection to editor
  * @return {Boolean}
  */
	isActive: function isActive() {
		return _controllersEditor2['default'].get('active');
	},

	hasOpenedDevTools: function hasOpenedDevTools(tabId) {
		return devtoolsController.isOpenedForTab(tabId);
	},

	editorController: _controllersEditor2['default'],
	errorStateTracker: _controllersErrorTracker2['default'].watch(workerCommandQueue),
	updateIconState: iconController.update
}, _libEventEmitter2['default'].prototype);

errorLogger.watch(workerCommandQueue);
_controllersErrorTracker2['default'].watch(workerCommandQueue);
// setup browser action icon state update on error
iconController.watchErrors(_controllersErrorTracker2['default']);

// event router
chrome.runtime.onMessage.addListener(_controllersRemoteView.router);
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	switch (message.name) {
		case 'add-user-stylesheet':
			modelController.current(function (model, tab) {
				var stylesheets = utils.copy(model.get('userStylesheets'));
				var maxId = 0;
				Object.keys(stylesheets).forEach(function (url) {
					var id = userStylesheets.is(url);
					if (id && +id > maxId) {
						maxId = +id;
					}
				});

				var newStylesheet = 'livestyle:' + (maxId + 1);
				console.log('Add user stylesheet %c%s', 'font-weight:bold', newStylesheet);
				userStylesheets.create(tab.id, newStylesheet, function (data) {
					stylesheets[newStylesheet] = data[newStylesheet] || '';
					model.set('userStylesheets', stylesheets);
				});
			});
			break;

		case 'remove-user-stylesheet':
			var url = message.data.url;
			console.log('Remove user stylesheet %c%s', 'font-weight:bold', url);
			modelController.current(function (model, tab) {
				var stylesheets = utils.copy(model.get('userStylesheets'));
				var assocs = utils.copy(model.get('assocs'));
				delete stylesheets[url];
				delete assocs[url];

				model.set({
					userStylesheets: stylesheets,
					assocs: assocs
				});
				userStylesheets.remove(tab.id, url);
			});
			break;

		case 'get-stylesheet-content':
			(0, _helpersGetStylesheetContent2['default'])(message.data.url, sender.tab && sender.tab.id, sendResponse);
			return true;
	}
});

// when tab is loaded, request unsaved changes
chrome.tabs.onUpdated.addListener(function (id, changeInfo, tab) {
	if (changeInfo.status === 'loading') {
		devtoolsController.reset(id);
	}

	if (changeInfo.status === 'complete') {
		modelController.destroy(tab);
		modelController.get(tab, function (model) {
			var assocs = model.associations();
			var editorFiles = utils.unique(Object.keys(assocs).map(function (key) {
				return assocs[key];
			}).filter(Boolean));

			if (editorFiles.length) {
				_livestyleClient2['default'].send('request-unsaved-changes', {
					files: editorFiles
				});
			}
		});
	}
});

workerCommandQueue.worker.addEventListener('message', function (message) {
	var payload = message.data;
	if (payload.name === 'init') {
		return console.log('%c%s', 'color:green;font-size:1.1em;font-weight:bold;', payload.data);
	}

	if (payload.status === 'error') {
		console.error(payload.data);
	}
});

_livestyleClient2['default'].on('message-send', function (name, data) {
	console.log('send socket message %c%s', 'font-weight:bold', name);
	if (name === 'diff') {
		// sending `diff` message from worker:
		// server won’t send it back to sender so handle it manually
		applyDiff(data);
	}
}).on('diff', function (data) {
	applyDiff(data);
}).on('open identify-client', identify).connect();
},{"./controllers/browser-action-icon":7,"./controllers/devtools":8,"./controllers/editor":9,"./controllers/error-logger":10,"./controllers/error-tracker":11,"./controllers/model":12,"./controllers/remote-view":13,"./helpers/get-stylesheet-content":14,"./helpers/user-stylesheets":15,"./lib/event-emitter":20,"./lib/utils":24,"livestyle-client":1,"livestyle-patcher":3}],7:[function(require,module,exports){
/**
 * Controls browser action icon state depending on 
 * user activity with tabs
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.watchErrors = watchErrors;
exports.update = update;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _model = require('./model');

var modelController = _interopRequireWildcard(_model);

var _libBrowserActionIcon = require('../lib/browser-action-icon');

var icon = _interopRequireWildcard(_libBrowserActionIcon);

var _libLivestyleModel = require('../lib/livestyle-model');

var _libLivestyleModel2 = _interopRequireDefault(_libLivestyleModel);

function watchErrors(tracker) {
	tracker.on('change:error', function () {
		if (this.get('error')) {
			modelController.current(function (model, tab) {
				return icon.state(tab.id, 'error');
			});
		} else {
			update();
		}
	});
}

function update() {
	chrome.tabs.query({ active: true, windowType: 'normal' }, function (tabs) {
		tabs.forEach(function (tab) {
			modelController.get(tab, function (model) {
				return updateIconState(tab, model);
			});
		});
	});
}

function updateIconState(tab, model) {
	if (typeof tab === 'object') {
		tab = tab.id;
	}

	var state = model.get('enabled') ? 'active' : 'disabled';
	if (state === 'active' && model.get('needsRefresh')) {
		state = 'warning';
	}
	icon.state(tab, state);
}

/**
 * Returns list of active tabs that matches given module
 * @param {LiveStyleModel} model
 * @param {Function} callback 
 */
function activeTabsForModel(model, callback) {
	chrome.tabs.query({ active: true, windowType: 'normal' }, function (tabs) {
		callback(tabs.filter(function (tab) {
			return modelController.id(tab) === model.id;
		}));
	});
}

// listen to changes on activity state of models and update
// browser icons accordingly
_libLivestyleModel2['default'].on('change:enabled', function (model) {
	activeTabsForModel(model, function (tabs) {
		tabs.forEach(function (tab) {
			return updateIconState(tab, model);
		});
	});
});

update();
chrome.tabs.onActivated.addListener(update);
chrome.tabs.onRemoved.addListener(icon.clearState);
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === 'loading') {
		return icon.clearState(tabId);
	}

	if (changeInfo.status === 'complete' && tab.active) {
		update();
	}
});
},{"../lib/browser-action-icon":17,"../lib/livestyle-model":21,"./model":12}],8:[function(require,module,exports){
/**
 * A DevTools controller for background page.
 *
 * For generic CSS patching extension uses CSSOM
 * which is very fast even on large sources. The problem is
 * that these changes in CSSOM are not reflected into original
 * source, e.g. in DevTools you’ll still see unchanges properties.
 * Moreover, any change in DevTools will reset all CSSOM changes.
 *
 * This module keeps track of all pending diffs for tabs and
 * when DevTools for tab became available, it flushes these 
 * changes to DevTools page so it can apply diffs on page resources.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.saveDiff = saveDiff;
exports.getPort = getPort;
exports.isOpenedForTab = isOpenedForTab;
exports.reset = reset;
exports.stylesheets = stylesheets;
exports.stylesheetContent = stylesheetContent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libPortExpect = require('../lib/port-expect');

var _libPortExpect2 = _interopRequireDefault(_libPortExpect);

var openedDevtools = {};
var pendingPatches = {};

var devtoolsPort = /^devtools\-page:(\d+)$/;

function saveDiff(tabId, stylesheetUrl, patches) {
	if (isOpenedForTab(tabId)) {
		// we have opened DevTools for this tab,
		// send diff directly to it
		console.log('DevTools opened, send diff directly');
		return getPort(tabId).postMessage({
			name: 'diff',
			data: {
				uri: stylesheetUrl,
				syntax: 'css', // always CSS
				patches: patches
			}
		});
	}

	// no opened DevTools, accumulate changes
	if (!pendingPatches[tabId]) {
		pendingPatches[tabId] = {};
	}

	if (!pendingPatches[tabId][stylesheetUrl]) {
		pendingPatches[tabId][stylesheetUrl] = [];
	}

	console.log('Append patches for', stylesheetUrl);
	pendingPatches[tabId][stylesheetUrl] = pendingPatches[tabId][stylesheetUrl].concat(patches);
}

function getPort(tabId) {
	if (typeof tabId === 'object') {
		tabId = tabId.id;
	}

	return openedDevtools[tabId];
}

function isOpenedForTab(tabId) {
	return !!getPort(tabId);
}

/**
 * Resets current DevTools state for given tab id
 */

function reset(tabId) {
	var port = getPort(tabId);
	if (port) {
		port.postMessage({ name: 'reset' });
	}
}

function stylesheets(tabId, callback) {
	if (!this.isOpenedForTab(tabId)) {
		return callback([]);
	}

	return (0, _libPortExpect2['default'])(getPort(tabId), 'get-stylesheets', 'stylesheets').then(callback, function (err) {
		return callback([]);
	});
}

function stylesheetContent(tabId, url) {
	if (!this.isOpenedForTab(tabId)) {
		return callback([]);
	}

	return (0, _libPortExpect2['default'])(getPort(tabId), 'get-stylesheet-content', { url: url }, 'stylesheet-content').then(function (resp) {
		return resp.content;
	});
}

function normalizeUrl(url) {
	return url.split('#')[0];
}

/**
 * Show log messages coming from DevTools
 * @param  {Array} strings Array of string
 */
function devtoolsLog(strings) {
	var args = ['%c[DevTools]', 'background-color:#344a5d;color:#fff'].concat(strings);
	console.log.apply(console, args);
}

/**
 * Handles incoming messages from DevTools connection port
 * @param  {Object} message Incoming message
 */
function devtoolsMessageHandler(tabId, message) {
	if (message.name === 'log') {
		devtoolsLog(message.data);
	} else if (message.name === 'resource-updated') {
		// notify tabs about updates resources
		chrome.tabs.sendMessage(tabId, message);
	}
}

function resetPatches(tabId) {
	if (tabId in pendingPatches) {
		delete pendingPatches[tabId];
	}
}

chrome.runtime.onConnect.addListener(function (port) {
	var m = port.name.match(devtoolsPort);
	if (m) {
		var tabId = +m[1];
		openedDevtools[tabId] = port;
		console.log('Opened devtools for', tabId);

		if (tabId in pendingPatches) {
			// flush pending patches
			port.postMessage({
				name: 'pending-patches',
				data: pendingPatches[tabId]
			});
			delete pendingPatches[tabId];
		}

		var messageHandler = function messageHandler(message) {
			devtoolsMessageHandler(tabId, message);
		};

		port.onMessage.addListener(messageHandler);

		port.onDisconnect.addListener(function () {
			console.log('Closed devtools for', tabId);
			delete openedDevtools[tabId];
			port.onMessage.removeListener(messageHandler);
		});
	}
});

// cleanup patches when tab is closed or refreshed
chrome.tabs.onRemoved.addListener(resetPatches);
chrome.tabs.onUpdated.addListener(resetPatches);
},{"../lib/port-expect":23}],9:[function(require,module,exports){
/**
 * Editor files controller: provides model with
 * available files from all connected editors. This model
 * is updated whenever user connects new editor or opens/closes
 * stylesheet files
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libModel = require('../lib/model');

var _libModel2 = _interopRequireDefault(_libModel);

var _libUtils = require('../lib/utils');

// The `active` key tells if there are any connected editor
var editorFiles = new _libModel2['default']();
var connectedEditors = {};

exports['default'] = editorFiles;

/**
 * Sync all connect editor files with underlying
 * editor files model
 */
function sync() {
	var allFiles = [];
	var ids = Object.keys(connectedEditors);
	ids.forEach(function (id) {
		allFiles = allFiles.concat(connectedEditors[id] || []);
	});

	allFiles = (0, _libUtils.unique)(allFiles);
	editorFiles.set('files', allFiles);
	editorFiles.set('active', ids.length > 0);
	return allFiles;
}

function onFileListReceived(payload) {
	connectedEditors[payload.id] = payload.files || [];
	sync();
}

function onEditorDisconnect(payload) {
	if (payload.id in connectedEditors) {
		delete connectedEditors[payload.id];
		sync();
	}
}

function onConnectionClosed() {
	connectedEditors = {};
	sync();
}

/**
 * Connects model with given LiveStyle client:
 * model now tracks all editor file-related changes and
 * notifies all listener on update
 * @param  {LiveStyleClient} client
 */
editorFiles.connect = function (client) {
	client.on('editor-files', onFileListReceived).on('editor-disconnect', onEditorDisconnect).on('close', onConnectionClosed);
};

/**
 * Disconnects model from given client: it no longer
 * listens to editor files update
 * @param  {LiveStyleClient} client
 */
editorFiles.disconnect = function (client) {
	client.off('editor-files', onFileListReceived).off('editor-disconnect', onEditorDisconnect).off('close', onConnectionClosed);
};

sync();
module.exports = exports['default'];
},{"../lib/model":22,"../lib/utils":24}],10:[function(require,module,exports){
/**
 * Logs all errors in LiveStyle worker. Unlike error tracker, which
 * simply notifies user about possible errors, this method actually
 * logs error messages and displays them upon request
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.watch = watch;
exports.unwatch = unwatch;
exports.getLog = getLog;
var logItems = [];
var maxLogItems = 50;
var messageId = 0;

/**
 * Watches for errors on given LiveStyle patcher instance
 * @param  {CommandQueue} patcher LiveStyle patcher
 */

function watch(patcher) {
	patcher.worker.addEventListener('message', handleWorkerEvent);
}

/**
 * Stops watching for errors on given LiveStyle patcher instance
 * @param  {CommandQueue} patcher LiveStyle patcher
 */

function unwatch(patcher) {
	patcher.worker.removeEventListener('message', handleWorkerEvent);
}

/**
 * Returns currently logged items
 * @return {Array} Array of log items
 */

function getLog() {
	return logItems;
}

function logMessage(message, type) {
	// Remove items with the same message
	for (var i = logItems.length - 1; i >= 0; i--) {
		if (logItems[i].message == message) {
			logItems.splice(i, 1);
		}
	}

	logItems.push({
		messageId: messageId++,
		date: Date.now(),
		message: message,
		type: type
	});

	messageId %= 10000;

	while (logItems.length > maxLogItems) {
		logItems.shift();
	}

	chrome.runtime.sendMessage({
		name: 'log-updated',
		data: logItems
	});
}

function handleWorkerEvent(message) {
	var payload = message.data;
	if (payload.status === 'error') {
		logMessage(payload.data, 'error');
	}
}

// handle internal extension communication
chrome.runtime.onMessage.addListener(function (message, sender, callback) {
	if (message.name === 'get-log') {
		callback(logItems);
		return true;
	}
});
},{}],11:[function(require,module,exports){
/**
 * Keeps track of errors occurred LiveStyle activity. 
 * Provides model with `error` boolean attribute indicating
 * if there’s something that user should be aware of.
 *
 * This controller tries to detect intermediate error states:
 * for example, when user type something he may accidentally 
 * put stylesheet in error state but fix it later. In this case,
 * we shouldn’t trigger error state.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libModel = require('../lib/model');

var _libModel2 = _interopRequireDefault(_libModel);

var _libUtils = require('../lib/utils');

// Worker commads that commands may generate errors we should track
var trackCommands = ['calculate-diff', 'apply-patch', 'initial-content'];
var commandState = {};
var errorFiles = [];
var model = new _libModel2['default']();

exports['default'] = model;

/**
 * Listens to events on given LiveStyle worker command queue
 * @param {CommandQueue} commandQueue
 */
model.watch = function (commandQueue) {
	commandQueue.on('command-create command-reply', handleWorkerEvent);
	return this;
};

/**
 * Stops listening events on given LiveStyle worker
 * @param {CommandQueue} commandQueue
 */
model.unwatch = function (commandQueue) {
	commandQueue.off('command-create command-reply', handleWorkerEvent);
	return this;
};

model.set({
	error: false,
	warning: false
});

var setErrorState = (0, _libUtils.debounce)(function () {
	if (errorFiles.length) {
		model.set('error', true);
		resetErrorState();
	}
}, 2000);

var resetErrorState = (0, _libUtils.debounce)(function () {
	model.set('error', false);
	errorFiles.length = 0;
}, 30000);

function markError(uri) {
	if (! ~errorFiles.indexOf(uri)) {
		errorFiles.push(uri);
		setErrorState();
	}
}

function unmarkError(uri) {
	var ix = errorFiles.indexOf(uri);
	if (~ix) {
		errorFiles.splice(ix, 1);
	}
}

function handleWorkerEvent(payload) {
	if (!payload.commandId) {
		return;
	}

	if ('name' in payload && ~trackCommands.indexOf(payload.name)) {
		// a command request sent to worker
		commandState[payload.commandId] = {
			created: Date.now(),
			uri: payload.data.uri
		};
	} else if ('status' in payload && payload.commandId in commandState) {
		// a reply from worker on previous command request
		var state = commandState[payload.commandId];
		if (payload.status === 'error') {
			markError(state.uri);
		} else {
			unmarkError(state.uri);
		}
		delete commandState[payload.commandId];
	}
}

// Watch for hung states: ones we didn’t received reply on
setInterval(function () {
	var end = Date.now() + 10000;
	Object.keys(commandState).forEach(function (id) {
		if (commandState[id].created < end) {
			delete commandState[id];
		}
	});
}, 5000);
module.exports = exports['default'];
},{"../lib/model":22,"../lib/utils":24}],12:[function(require,module,exports){
/**
 * Controller for LiveStyle model: creates or restores 
 * model for given tab (page url) and automatically syncs
 * changes with storage backend.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.get = get;
exports.active = active;
exports.current = current;
exports.destroy = destroy;
exports.matchingUrl = matchingUrl;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _livestyleClient = require('livestyle-client');

var _livestyleClient2 = _interopRequireDefault(_livestyleClient);

var _libLivestyleModel = require('../lib/livestyle-model');

var _libLivestyleModel2 = _interopRequireDefault(_libLivestyleModel);

var _editor = require('./editor');

var _editor2 = _interopRequireDefault(_editor);

var _devtools = require('./devtools');

var devtoolsController = _interopRequireWildcard(_devtools);

var _helpersUserStylesheets = require('../helpers/user-stylesheets');

var userStylesheets = _interopRequireWildcard(_helpersUserStylesheets);

var _libUtils = require('../lib/utils');

var collection = {}; // collection of all active page models
var storage = chrome.storage.local;
var dummyFn = function dummyFn() {};
var debouncedSaveChanges = (0, _libUtils.debounce)(saveChanges, 100);
var updateTimeout = 3000; // milliseconds

/**
 * Returns model ID from given tab
 * @type {String}
 */
exports.id = idFromTab;

/**
 * Returns model for given tab
 * @param  {String}   tab
 * @param  {Function} callback 
 */

function get(tab, callback) {
	if (!tab) {
		return callback();
	}

	getModel(tab, callback);
}

/**
 * Returns list of available active models and tabs that can be used
 * for patching
 * @param {Function} callback
 */

function active(callback) {
	chrome.tabs.query({ /* highlighted: true, */windowType: 'normal' }, function (tabs) {
		var models = [];
		var next = function next() {
			if (!tabs.length) {
				return callback(models);
			}

			var tab = tabs.pop();
			getModel(tab, function (model) {
				if (model && model.get('enabled')) {
					models.push({
						tab: tab,
						model: model
					});
				}
				next();
			});
		};
		next();
	});
}

/**
 * Returns currently active tab and its model
 * @param  {Function} callback
 */

function current(callback) {
	activeTab(function (tab) {
		get(tab, function (model) {
			callback(model, tab);
		});
	});
}

/**
 * Destroys model for given tab or id
 * @param  {Object} tab Tab or ID
 * @param {Boolean} noSave Do not save model
 */

function destroy(tab, noSave) {
	var id = idFromTab(tab);
	if (id in collection) {
		console.log('%cDestroy model for', 'font-weight:bold;color:red', id);
		var model = collection[id];
		delete collection[id];
		if (!noSave) {
			saveChanges(model);
		}
		model.destroy();
	}
}

/**
 * Returns matching file URL from active models. 
 * The `callback` argument receives array of objects
 * with `url` and `type` ('browser' or 'editor') keys
 * @param  {String}   url      
 * @param  {Function} callback
 */

function matchingUrl(url, callback) {
	url = idFromTab(url);
	this.active(function (models) {
		var result = [];
		models.forEach(function (model) {
			var browserFiles = model.get('browserFiles') || [];
			var editorFiles = model.get('editorFiles') || [];

			browserFiles.forEach(function (file) {
				if (file === url) {
					result.push({ url: file, type: 'browser' });
				}
			});

			editorFiles.forEach(function (file) {
				if (file === url) {
					result.push({ url: file, type: 'editor' });
				}
			});
		});

		callback(result);
	});
}

function eachModel(fn) {
	Object.keys(collection).forEach(function (key) {
		fn(collection[key], key);
	});
}

function idFromTab(tab) {
	var url = typeof tab === 'string' ? tab : tab.url;
	return url.split('#')[0];
}

function activeTab(callback) {
	chrome.tabs.query({ currentWindow: true, highlighted: true, windowType: 'normal' }, function (tabs) {
		callback(tabs && tabs[0]);
	});
}

function getModel(tab, callback) {
	callback = callback || dummyFn;
	var id = idFromTab(tab);
	if (id in collection) {
		return updateModelIfNeeded(tab, collection[id], callback);
	}

	var model = new _libLivestyleModel2['default'](id);
	collection[id] = model;
	storage.get(id, function (items) {
		items = items || {};
		if (items[id]) {
			var user = {};
			(items[id].userStylesheets || []).forEach(function (url) {
				user[url] = '';
			});
			items[id].userStylesheets = user;
			model.set(items[id]);
		} else {
			model.set({
				enabled: false,
				assocs: {},
				userStylesheets: {}
			});
		}

		updateModel(tab, model, function (model) {
			model.on('change:userStylesheets', handleUserStylesheetChange).on('change', debouncedSaveChanges);
			callback(model);
		});
	});
}

function updateModel(tab, model, callback) {
	model.set('editorFiles', _editor2['default'].get('files'));
	model.set('url', tab.url);
	model.lastUpdate = Date.now();

	// Fetching page origin is potentially slow operation but required only once.
	// Optimize this request
	var p = model.get('origin') ? Promise.resolve(model.get('origin')) : getTabOrigin(tab);
	p.then(function (origin) {
		console.log('set model origin', origin);
		model.set('origin', origin || '');
		model.set('needsRefresh', false);

		var user = model.get('userStylesheets');
		userStylesheets.validate(tab.id, Object.keys(user), function (stylesheets) {
			model.set('userStylesheets', stylesheets || user);
			var saveBrowserStylesheets = function saveBrowserStylesheets(stylesheets) {
				if (!stylesheets && chrome.runtime.lastError) {
					model.set('needsRefresh', true);
					console.error('Error while fetching list of stylesheets:', chrome.runtime.lastError.message);
					console.info('Maybe try refreshing the page?');
				} else {
					// XXX this thing looks like a hack: user stylesheets
					// are skipped from CSSOM but available in DevTools.
					// Should be a better way of precise user stylesheet detection
					stylesheets = (stylesheets || []).filter(function (url) {
						return !/^blob:/.test(url);
					});
					model.set('browserFiles', stylesheets);
				}
				callback(model);
			};

			// XXX currently, if source maps are enabled, a stylesheet list from
			// DevTools returns generates source map stylesheets as well, which
			// introduces a number of nasty issues. There’s no valid way
			// to filter those source maps stylesheets.
			// As a workaround, return list of stylesheets available from CSSOM

			// XXX lots of people uses LiveStyle with local files (e.g.
			// file:// protocol). With CSSOM only they can’t see @import
			// stylesheets. For now, allow DevTools stylesheet fetching
			// for file:// origins
			if (shouldGetResourcesFromDevtools(tab)) {
				devtoolsController.stylesheets(tab.id, saveBrowserStylesheets);
			} else {
				chrome.tabs.sendMessage(tab.id, { name: 'get-stylesheets' }, saveBrowserStylesheets);
			}
		});
	});
}

function updateModelIfNeeded(tab, model, callback) {
	if (model.lastUpdate + updateTimeout < Date.now()) {
		return updateModel(tab, model, callback);
	}

	callback(model);
}

function shouldGetResourcesFromDevtools(tab) {
	return devtoolsController.isOpenedForTab(tab.id) && /^(file|chrome|chrome\-extension):/.test(tab.url || '');
}

/**
 * An event listener for `userStylesheets` attribute change in model
 */
function handleUserStylesheetChange() {
	var model = this;
	activeTab(function (tab) {
		userStylesheets.validate(tab.id, Object.keys(model.get('userStylesheets')), function (data) {
			data = data || {};
			var assocs = (0, _libUtils.copy)(model.get('assocs'));
			Object.keys(assocs).forEach(function (browserFile) {
				if (userStylesheets.is(browserFile) && !(browserFile in data)) {
					delete assocs[browserFile];
				}
			});

			model.set({
				userStylesheets: data,
				assocs: assocs
			}, { silent: true });
		});
	});
}

function saveChanges(model) {
	var payload = {};
	var assocs = model.get('assocs') || {};

	// remove empty (unassociated) entries
	Object.keys(assocs).forEach(function (key) {
		if (assocs[key] == null) {
			delete assocs[key];
		}
	});

	payload[model.id] = {
		enabled: model.get('enabled'),
		assocs: assocs,
		updateDirection: model.get('updateDirection') || '',
		userStylesheets: Object.keys(model.get('userStylesheets') || {})
	};
	storage.set(payload);
}

function getTabOrigin(tab) {
	return new Promise(function (resolve, reject) {
		chrome.tabs.sendMessage(tab.id, { name: 'get-origin' }, resolve);
	});
}

/**
 * Invalidate current models: removes models that have 
 * no opened tab. This saves some memory 
 */
function invalidateModels() {
	chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
		var activeIds = tabs.map(idFromTab);
		Object.keys(collection).forEach(function (id) {
			if (! ~activeIds.indexOf(id)) {
				destroy(id);
			}
		});
	});
}

chrome.storage.onChanged.addListener(function (changes) {
	Object.keys(changes).forEach(function (key) {
		if (key in collection) {
			collection[key].set(changes[key], { silent: true });
		}
	});
});

// setup relationships between models
_editor2['default'].on('change:files', function () {
	var files = _editor2['default'].get('files');
	eachModel(function (model, id) {
		model.set('editorFiles', files);
	});
});

_editor2['default'].connect(_livestyleClient2['default']);

// clean up model collection when tab is closed
chrome.tabs.onRemoved.addListener(invalidateModels);
},{"../helpers/user-stylesheets":15,"../lib/livestyle-model":21,"../lib/utils":24,"./devtools":8,"./editor":9,"livestyle-client":1}],13:[function(require,module,exports){
/**
 * Remote View controller: handles communication with LiveStyle app
 * regarding Remote View sessions.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.checkConnection = checkConnection;
exports.getSession = getSession;
exports.closeSession = closeSession;
exports.createSession = createSession;
exports.router = router;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libUtils = require('../lib/utils');

var _libClientExpect = require('../lib/client-expect');

var client = _interopRequireWildcard(_libClientExpect);

var RV_REQUEST_SESSION_URL = 'http://livestyle.io:9000/connect/';

function checkConnection() {
	return client.send('rv-ping').expect('rv-pong').then(null, function (err) {
		if (isExpectError(err)) {
			err = new Error('No connection with LiveStyle app');
			err.code = 'ERVNOCONNECTION';
		}
		throw err;
	});
}

function getSession(localSite) {
	return checkConnection().then(function () {
		console.log('connection is active, get session for', localSite);
		return client.send('rv-get-session', { localSite: localSite }).expect('rv-session', function (data) {
			return data.localSite === localSite;
		});
	}).then(null, function (err) {
		if (isExpectError(err)) {
			err = new Error('No active session for ' + localSite);
			err.code = 'ERVNOSESSION';
		}
		throw err;
	});
}

function closeSession(localSite) {
	client.send('rv-close-session', { localSite: localSite });
}

function createSession(localSite) {
	return getSession(localSite).then(function (resp) {
		if (resp.error) {
			// no valid session, create it
			return getUserToken(localSite).then(createHTTPServerIfRequired).then(requestRvSession).then(function (payload) {
				return client.send('rv-create-session', payload).expect('rv-session', 15000, function (data) {
					return data.localSite === localSite;
				});
			});
		}
	});
}

/**
 * Event router for Remote View messages
 */

function router(message, sender, callback) {
	var data = message.data;
	var errResponse = function errResponse(err) {
		callback(errorJSON(err));
	};

	switch (message.name) {
		case 'rv-check-connection':
			checkConnection().then(function () {
				return callback({ connected: true });
			}, function () {
				return callback({ connected: false });
			});
			return true;
		case 'rv-get-session':
			getSession(data.localSite).then(callback, errResponse);
			return true;
		case 'rv-create-session':
			createSession(data.localSite).then(callback, errResponse);
			return true;
		case 'rv-close-session':
			closeSession(data.localSite);
			break;
	}
}

/**
 * Check if user granted `identity` permission for current extension.
 * `identity` permission allows fetching user token
 */
function checkIdentityPermission() {
	return new Promise(function (resolve, reject) {
		var payload = {
			permissions: ['identity']
		};

		chrome.permissions.contains(payload, function (result) {
			if (result) {
				return resolve();
			}

			// no permission to user identity, request it
			chrome.permissions.request(payload, function (granted) {
				if (granted) {
					resolve();
				} else {
					var err = new Error('User rejected identity permission');
					err.code = 'ERVIDENTITYPERM';
					reject(err);
				}
			});
		});
	});
}

function getUserToken(localSite, oldToken) {
	return new Promise(function (resolve, reject) {
		var getToken = function getToken() {
			chrome.identity.getAuthToken({ interactive: true }, function (token) {
				if (chrome.runtime.lastError) {
					var err = new Error('Unable to fetch auth token: ' + chrome.runtime.lastError.message);
					err.code = 'ERVTOKEN';
					return reject(err);
				}

				resolve({ localSite: localSite, token: token, retry: !!oldToken });
			});
		};

		if (oldToken) {
			chrome.identity.removeCachedAuthToken({ token: oldToken }, getToken);
		} else {
			getToken();
		}
	});
}

function requestRvSession(payload) {
	var errMessage = 'Unable to create session, Remote View server is not available. Please try again later.';

	return fetch(RV_REQUEST_SESSION_URL, {
		method: 'POST',
		headers: {
			Authorization: 'google ' + payload.token,
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			localSite: payload.localSite
		})
	}).then(function (res) {
		if (res.ok) {
			return res.json();
		}

		if (res.status === 401 && !payload.retry) {
			// unauthorized request, might be because of expired token
			return getUserToken(payload.localSite, payload.token).then(requestRvSession);
		}

		// unable to handle this response, fail with JSON data
		return res.json().then(function (data) {
			var err = new Error(data && data.error ? data.error.message : errMessage);
			err.code = res.status;
			throw err;
		});
	}, function () {
		var err = new Error(errMessage);
		err.code = 'ERVSESSION';
		throw err;
	});
}

function createHTTPServerIfRequired(payload) {
	if (!/^file:/.test(payload.localSite)) {
		return Promise.resolve(payload);
	}

	var docroot = payload.localSite;
	console.log('create HTTP server for %s', docroot);
	return client.send('rv-create-http-server', { docroot: docroot }).expect('rv-http-server', function (data) {
		return data.docroot === docroot;
	}).then(function (data) {
		return (0, _libUtils.extend)(payload, { localSite: data.origin });
	});
}

function isExpectError(err) {
	return err && err.code === 'EEXPECTTIMEOUT';
}

function errorJSON(err) {
	var json = {};
	if (err instanceof Error) {
		json.error = err.message;
		if (err.code) {
			json.errorCode = err.code;
		}
	} else if (typeof err === 'string') {
		json.error = err;
	} else if (err && typeof err === object) {
		json.error = err.error;
	}

	if (!json.error) {
		json.error = 'Unknown error format';
	}

	return json;
}
},{"../lib/client-expect":18,"../lib/utils":24}],14:[function(require,module,exports){
/**
 * Fetches content of given stylesheet URL by any possible way: either from
 * DevTools resource (faster, contains most recent version) or via XHR
 */
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _controllersDevtools = require('../controllers/devtools');

var devtools = _interopRequireWildcard(_controllersDevtools);

exports['default'] = function (url, tabId, callback) {
	if (typeof tabId === 'function') {
		callback = tabId;
		tabId = null;
	}

	var p;
	if (tabId && devtools.isOpenedForTab(tabId)) {
		p = devtools.stylesheetContent(tabId, url);
	} else {
		p = load(url);
	}

	p.then(callback, function (err) {
		console.error('Error fetching %s stylesheet content', url, err);
		callback(null);
	});
};

;

function load(url) {
	// no `fetch` here since it doesn’t support 'file:' protocol
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status < 300) {
					resolve(xhr.responseText);
				} else {
					var err = new Error('Unable to fetch ' + url + ': received ' + xhr.status + ' code');
					err.code = xhr.status;
					reject(new Error(err));
				}
			}
		};
		xhr.open('GET', url, true);
		xhr.send();
	});
}
module.exports = exports['default'];
},{"../controllers/devtools":8}],15:[function(require,module,exports){
/**
 * Manages user stylesheets life cycle.
 * A user stylesheet is a stylesheet created by LiveStyle
 * on current page specifically for live updates:
 * it is added below page stylesheets (hence has higher
 * priority), it’s small and fast: a good alternative 
 * for very large page stylesheets where each update
 * could take some time
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.create = create;
exports.remove = remove;
exports.validate = validate;
exports.is = is;
var reUser = /^livestyle:([0-9]+)$/;

/**
 * Creates user stylsheets for given IDs and
 * returns hash where key is given ID and value
 * is generated Blob URL
 * @param  {Array}   urls      Array of interlat LiveStyle IDs
 * @param  {Function} callback Invoked with hash result
 */

function create(tabId, url, callback) {
  if (!url || !url.length) {
    return callback({});
  }

  chrome.tabs.sendMessage(tabId, {
    name: 'create-user-stylesheet',
    data: { url: url }
  }, callback);
}

/**
 * Removes stylesheet with given URL (blob or internal LiveStyle ID)
 * @param  {String} url Stylesteet URL
 */

function remove(tabId, url) {
  chrome.tabs.sendMessage(tabId, {
    name: 'remove-user-stylesheet',
    data: { url: url }
  });
}

/**
 * Validates given list of interla URLs: creates missing
 * and removes redundant stylesheets
 * @param  {String}   url      Internal URL or array of URLs
 * @param  {Function} callback Callback function receives hash
 * where key is given URL and value is generated blob URL
 */

function validate(tabId, url, callback) {
  if (!url || !url.length) {
    return callback({});
  }

  chrome.tabs.sendMessage(tabId, {
    name: 'validate-user-stylesheet',
    data: { url: url }
  }, callback);
}

/**
 * Check if given URL is user stylesheet file
 * @param {String} url
 * @return {Boolean} 
 */

function is(url) {
  var m = url.match(reUser);
  return m && m[1];
}
},{}],16:[function(require,module,exports){
/**
 * Returns virtual associations between browser and editor files.
 *
 * Unlike “real” associations where user manually picks files,
 * virtual associations may contain guessed matches that
 * may change if user opens another file in editor
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

exports['default'] = function (browserFiles, editorFiles, assocs) {
	assocs = assocs || {};
	browserFiles = browserFiles || [];
	editorFiles = editorFiles || [];

	return browserFiles.reduce(function (result, browserFile) {
		var editorFile = assocs[browserFile];
		if (editorFile == null) {
			// user didn’t picked association yet: guess it
			// XXX compare with `null` and `undefined` because empty string
			// means user forcibly removed association (for example, from
			// guessed association)
			editorFile = ~editorFiles.indexOf(browserFile) ? browserFile : guessAssoc(editorFiles, browserFile);
		} else if (! ~editorFiles.indexOf(editorFile)) {
			// we have association but user didn’t opened it yet:
			// assume there’s no association
			editorFile = null;
		}
		result[browserFile] = editorFile;
		return result;
	}, {});
};

function pathLookup(path) {
	return path.split('?')[0].split('/').filter(Boolean);
}

function guessAssoc(list, file) {
	var fileLookup = pathLookup(file).reverse();
	var candidates = list.map(function (path) {
		return {
			path: path,
			lookup: pathLookup(path)
		};
	});

	var chunk, prevCandidates;
	for (var i = 0, il = fileLookup.length; i < il; i++) {
		prevCandidates = candidates;
		candidates = candidates.filter(function (candidate) {
			var part = candidate.lookup.pop();
			if (fileLookup[i] === part) {
				return true;
			}

			if (i === 0) {
				// comparing file names: also try names without extension
				return cleanFileName(fileLookup[i]) === cleanFileName(part);
			}
		});

		if (candidates.length === 1) {
			break;
		} else if (!candidates.length) {
			// empty candidates list on first pass means we
			// didn’t found anything at all
			candidates = i ? prevCandidates : null;
			break;
		}
	}

	if (candidates && candidates.length) {
		return candidates[0].path;
	}
}

function cleanFileName(file) {
	return file.replace(/\.\w+$/, '');
}
module.exports = exports['default'];
},{}],17:[function(require,module,exports){
/**
 * Displays browser action icon according to current activity state
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.state = state;
exports.reset = reset;
exports.clearState = clearState;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _deferred = require('./deferred');

var _deferred2 = _interopRequireDefault(_deferred);

var states = {};
var loaded = (0, _deferred2['default'])();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var images = {
	disabled: image('./icon/ba-disabled.png'),
	active: image('./icon/ba-active.png'),
	warning: image('./icon/ba-warning.png'),
	error1: image('./icon/ba-error1.png'),
	error2: image('./icon/ba-error2.png')
};
var PI2 = Math.PI * 2;
var errState = {
	pos: 0,
	step: 0.05
};

canvas.width = canvas.height = 19;

function state(tabId, value) {
	if (typeof value !== 'undefined' && value !== states[tabId]) {
		states[tabId] = value;
		loaded.then(function () {
			renderState(tabId, value);
		});
	}
	return states[tabId];
}

function reset() {
	Object.keys(states).forEach(function (tabId) {
		renderState(tabId, 'disabled');
		clearState(tabId);
	});
}

function clearState(tabId) {
	delete states[tabId];
}

function image(src) {
	var img = new Image();
	img.onload = function () {
		if (!loaded.total) {
			loaded.total = 0;
		}

		img.onload = null;
		if (++loaded.total >= Object.keys(images).length) {
			loaded.resolve(images);
		}
	};
	img.src = src;
	return img;
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	return ctx;
}

function draw(image) {
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function renderState(tabId, state) {
	if (states[tabId] === 'error') {
		renderErrorState();
	} else if (images[state]) {
		clear();
		draw(images[state]);
		paintIcon(tabId);
	} else {
		console.warn('Unknown icon state:', state);
	}
}

function renderErrorState() {
	var tabs = Object.keys(states);
	var errTabs = tabs.filter(function (tabId) {
		return states[tabId] === 'error';
	});

	if (!errTabs.length) {
		return tabs.forEach(function (tabId) {
			renderState(tabId, states[tabId]);
		});
	}

	errState.pos = (errState.pos + errState.step) % PI2;
	var alpha = Math.cos(errState.pos) * 0.5 + 0.5;

	clear();
	ctx.save();
	ctx.globalAlpha = alpha;
	draw(images.error1);
	ctx.globalAlpha = 1 - alpha;
	draw(images.error2);
	ctx.restore();

	errTabs.forEach(paintIcon);
	setTimeout(renderErrorState, 16);
}

function paintIcon(tabId) {
	chrome.browserAction.setIcon({
		imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
		tabId: +tabId
	});
}
},{"./deferred":19}],18:[function(require,module,exports){
/**
 * A wrapper around LiveStyle client able to send messages and wait for expected
 * response
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.send = send;
exports.on = on;
exports.off = off;
exports.emit = emit;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _livestyleClient = require('livestyle-client');

var _livestyleClient2 = _interopRequireDefault(_livestyleClient);

function send(name, data) {
	var messageSent = false;
	setTimeout(function () {
		_livestyleClient2['default'].send(name, data);
		messageSent = true;
	}, 0);

	return {
		expect: function expect(expectedMessageName, validate) {
			var timeout = arguments.length <= 2 || arguments[2] === undefined ? 1000 : arguments[2];

			if (messageSent) {
				var err = new Error('Message "' + expectedMessageName + '" already sent');
				err.code = 'EMESSAGESENT';
				return Promise.reject(err);
			}

			if (typeof validate === 'number') {
				timeout = validate;
				validate = null;
			}

			return new Promise(function (resolve, reject) {
				var cancelId = setTimeout(function () {
					_livestyleClient2['default'].off('message-receive', callback);
					var err = new Error('Expected message "' + expectedMessageName + '" timed out');
					err.code = 'EEXPECTTIMEOUT';
					err.messageName = expectedMessageName;
					reject(err);
				}, timeout);

				var callback = function callback(name, data) {
					if (name === expectedMessageName) {
						var isValid = true;
						if (validate) {
							try {
								isValid = validate(data);
							} catch (e) {
								isValid = false;
							}
						}

						if (isValid) {
							_livestyleClient2['default'].off('message-receive', callback);
							clearTimeout(cancelId);
							resolve(data);
						}
					}
				};

				_livestyleClient2['default'].on('message-receive', callback);
			});
		}
	};
}

function on() {
	_livestyleClient2['default'].on.apply(_livestyleClient2['default'], arguments);
}

function off() {
	_livestyleClient2['default'].off.apply(_livestyleClient2['default'], arguments);
}

function emit() {
	_livestyleClient2['default'].emit.apply(_livestyleClient2['default'], arguments);
}
},{"livestyle-client":1}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = Deferred;

var _utils = require('./utils');

var STATE_PENDING = 'pending';
var STATE_FULFILLED = 'fulfilled';
var STATE_REJECTED = 'rejected';

function fulfill(listeners, args) {
	listeners.forEach(function (fn) {
		fn.apply(null, args);
	});
}

function isFn(obj) {
	return typeof obj === 'function';
}

function Deferred(fn) {
	if (!(this instanceof Deferred)) {
		return new Deferred(fn);
	}

	var state = STATE_PENDING;
	var value = void 0;
	var fulfilled = [];
	var rejected = [];
	var self = this;

	var respond = function respond(callbacks) {
		fulfill(callbacks, value);
		fulfilled.length = rejected.length = 0;
	};

	var changeState = function changeState(newState, callbacks) {
		return function () {
			if (state === STATE_PENDING) {
				state = newState;
				value = (0, _utils.toArray)(arguments);
				respond(callbacks);
			}
			return self;
		};
	};

	this.resolve = changeState(STATE_FULFILLED, fulfilled);
	this.reject = changeState(STATE_REJECTED, rejected);
	this.then = function (onFulfilled, onRejected) {
		isFn(onFulfilled) && fulfilled.push(onFulfilled);
		isFn(onRejected) && rejected.push(onRejected);
		if (state === STATE_FULFILLED) {
			respond(fulfilled);
		} else if (state === STATE_REJECTED) {
			respond(rejected);
		}

		return this;
	};

	Object.defineProperty(this, 'state', {
		enumerable: true,
		get: function get() {
			return state;
		}
	});

	if (isFn(fn)) {
		fn.call(this);
	}
}

module.exports = exports['default'];
},{"./utils":24}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
/**
 * LiveStyle model: responsible for storing info about
 * LiveStyle state for context page
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _eventEmitter = require('./event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _associations2 = require('./associations');

var _associations3 = _interopRequireDefault(_associations2);

var emitter = new _eventEmitter2['default']();

var LiveStyleModel = (function (_Model) {
	_inherits(LiveStyleModel, _Model);

	function LiveStyleModel(id) {
		_classCallCheck(this, LiveStyleModel);

		_get(Object.getPrototypeOf(LiveStyleModel.prototype), 'constructor', this).call(this);
		this.id = id;
		this.lastUpdate = Date.now();
		this.on('change:browserFiles change:editorFiles change:assocs change:userStylesheets', function () {
			this.emit('update');
		}).on('all', function () {
			// pass all inner model events to the global dispatcher
			LiveStyleModel.emit.apply(LiveStyleModel, arguments);
		});
	}

	/**
  * Returns virtual file associations. Unlike “real“ associations,
  * where user explicitly pick files, virtual ones contains guessed
  * associations for files user didn’t picked yet
  * @return {Object}
  */

	_createClass(LiveStyleModel, [{
		key: 'associations',
		value: function associations() {
			var browserFiles = this.get('browserFiles') || [];
			var userStylesheets = Object.keys(this.get('userStylesheets') || {});
			return (0, _associations3['default'])(browserFiles.concat(userStylesheets), this.get('editorFiles'), this.get('assocs'));
		}
	}]);

	return LiveStyleModel;
})(_model2['default']);

exports['default'] = LiveStyleModel;

LiveStyleModel.on = emitter.on.bind(emitter);
LiveStyleModel.off = emitter.off.bind(emitter);
LiveStyleModel.emit = emitter.emit.bind(emitter);
module.exports = exports['default'];
},{"./associations":16,"./event-emitter":20,"./model":22}],22:[function(require,module,exports){
/**
 * A simple model object: a very simplified version of 
 * Backbone.Model
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventEmitter = require('./event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _utils = require('./utils');

var hasOwnProperty = Object.prototype.hasOwnProperty;

var Model = (function (_EventEmitter) {
	_inherits(Model, _EventEmitter);

	function Model() {
		_classCallCheck(this, Model);

		_get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this);
		if (!(this instanceof Model)) {
			return new Model();
		}
		this.attributes = {};
	}

	_createClass(Model, [{
		key: 'get',
		value: function get(key) {
			return this.attributes[key];
		}
	}, {
		key: 'set',
		value: function set(key, val, options) {
			var attr, attrs, unset, changes, silent, changing, prev, current;
			if (key == null) {
				return this;
			}

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options || (options = {});

			// Extract attributes and options.
			unset = options.unset;
			silent = options.silent;
			changes = [];
			changing = this._changing;
			this._changing = true;

			if (!changing) {
				this._previousAttributes = (0, _utils.copy)(this.attributes);
				this.changed = {};
			}
			current = this.attributes;
			prev = this._previousAttributes;

			// For each `set` attribute, update or delete the current value.
			for (attr in attrs) {
				val = attrs[attr];
				if (!isEqual(current[attr], val)) {
					changes.push(attr);
				}
				if (!isEqual(prev[attr], val)) {
					this.changed[attr] = val;
				} else {
					delete this.changed[attr];
				}
				unset ? delete current[attr] : current[attr] = val;
			}

			// Trigger all relevant attribute changes.
			if (!silent) {
				if (changes.length) {
					this._pending = options;
				}
				for (var i = 0, l = changes.length; i < l; i++) {
					this.emit('change:' + changes[i], this, current[changes[i]], options);
				}
			}

			// You might be wondering why there's a `while` loop here. Changes can
			// be recursively nested within `"change"` events.
			if (changing) {
				return this;
			}

			if (!silent) {
				while (this._pending) {
					options = this._pending;
					this._pending = false;
					this.emit('change', this, options);
				}
			}

			this._pending = false;
			this._changing = false;
			return this;
		}

		// Remove an attribute from the model, firing `"change"`. `unset` is a noop
		// if the attribute doesn't exist.
	}, {
		key: 'unset',
		value: function unset(attr, options) {
			return this.set(attr, void 0, (0, _utils.copy)(options, { unset: true }));
		}

		// Clear all attributes on the model, firing `"change"`.
	}, {
		key: 'clear',
		value: function clear(options) {
			var attrs = {};
			for (var key in this.attributes) {
				attrs[key] = void 0;
			}
			return this.set(attrs, (0, _utils.copy)(options, { unset: true }));
		}

		// Determine if the model has changed since the last `"change"` event.
		// If you specify an attribute name, determine if that attribute has changed.
	}, {
		key: 'hasChanged',
		value: function hasChanged(attr) {
			if (attr == null) {
				return !isEmpty(this.changed);
			}
			return has(this.changed, attr);
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return (0, _utils.copy)(this.attributes);
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this.off();
		}
	}]);

	return Model;
})(_eventEmitter2['default']);

exports['default'] = Model;

function has(obj, key) {
	return obj != null && hasOwnProperty.call(obj, key);
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
	return eq(a, b, [], []);
}

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
	if (obj == null) {
		return true;
	}
	if (Array.isArray(obj) || typeof obj === 'string') {
		return obj.length === 0;
	}
	for (var key in obj) if (has(obj, key)) {
		return false;
	}

	return true;
}

// Internal recursive comparison function for `isEqual`.
function eq(a, b, aStack, bStack) {
	// Identical objects are equal. `0 === -0`, but they aren't identical.
	// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	if (a === b) return a !== 0 || 1 / a === 1 / b;
	// A strict comparison is necessary because `null == undefined`.
	if (a == null || b == null) return a === b;

	// Compare `[[Class]]` names.
	var className = toString.call(a);
	if (className !== toString.call(b)) return false;
	switch (className) {
		// Strings, numbers, regular expressions, dates, and booleans are compared by value.
		case '[object RegExp]':
		// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
		case '[object String]':
			// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
			// equivalent to `new String("5")`.
			return '' + a === '' + b;
		case '[object Number]':
			// `NaN`s are equivalent, but non-reflexive.
			// Object(NaN) is equivalent to NaN
			if (+a !== +a) return +b !== +b;
			// An `egal` comparison is performed for other numeric values.
			return +a === 0 ? 1 / +a === 1 / b : +a === +b;
		case '[object Date]':
		case '[object Boolean]':
			// Coerce dates and booleans to numeric primitive values. Dates are compared by their
			// millisecond representations. Note that invalid dates with millisecond representations
			// of `NaN` are not equivalent.
			return +a === +b;
	}
	if (typeof a != 'object' || typeof b != 'object') return false;
	// Assume equality for cyclic structures. The algorithm for detecting cyclic
	// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	var length = aStack.length;
	while (length--) {
		// Linear search. Performance is inversely proportional to the number of
		// unique nested structures.
		if (aStack[length] === a) return bStack[length] === b;
	}
	// Objects with different constructors are not equivalent, but `Object`s
	// from different frames are.
	var aCtor = a.constructor,
	    bCtor = b.constructor;
	if (aCtor !== bCtor &&
	// Handle Object.create(x) cases
	'constructor' in a && 'constructor' in b && !(typeof aCtor === 'function' && aCtor instanceof aCtor && typeof bCtor === 'function' && bCtor instanceof bCtor)) {
		return false;
	}
	// Add the first object to the stack of traversed objects.
	aStack.push(a);
	bStack.push(b);
	var size, result;
	// Recursively compare objects and arrays.
	if (className === '[object Array]') {
		// Compare array lengths to determine if a deep comparison is necessary.
		size = a.length;
		result = size === b.length;
		if (result) {
			// Deep compare the contents, ignoring non-numeric properties.
			while (size--) {
				if (!(result = eq(a[size], b[size], aStack, bStack))) break;
			}
		}
	} else {
		// Deep compare objects.
		var keys = Object.keys(a),
		    key;
		size = keys.length;
		// Ensure that both objects contain the same number of properties before comparing deep equality.
		result = Object.keys(b).length === size;
		if (result) {
			while (size--) {
				// Deep compare each member
				key = keys[size];
				if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
			}
		}
	}
	// Remove the first object from the stack of traversed objects.
	aStack.pop();
	bStack.pop();
	return result;
};
module.exports = exports['default'];
},{"./event-emitter":20,"./utils":24}],23:[function(require,module,exports){
/**
 * A wrapper for Chrome Port messaging able to send given message and wait for
 * response with expected message name
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

exports['default'] = function (port, name, data, expectResponse) {
	if (typeof data === 'string' && expectResponse == null) {
		expectResponse = data;
		data = null;
	}

	return new Promise(function (resolve, reject) {
		var isResponded = false;
		var handleResponse = function handleResponse(message) {
			if (message && message.name === expectResponse) {
				resolve(message.data);
				port.onMessage.removeListener(handleResponse);
			}
		};

		// in case of any error in DevTools page, respond after some time
		setTimeout(function () {
			var err = new Error('Expectation timeout: did not received "' + expectResponse + '" response');
		}, 3000);

		port.onMessage.addListener(handleResponse);
		port.postMessage({ name: name, data: data });
	});
};

;
module.exports = exports['default'];
},{}],24:[function(require,module,exports){
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
},{}]},{},[6])(6)
});
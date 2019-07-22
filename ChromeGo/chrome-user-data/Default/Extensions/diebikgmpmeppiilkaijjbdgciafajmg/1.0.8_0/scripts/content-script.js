(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.contentScript = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * CSSOM LiveStyle patcher: maps incoming updates to browser’s 
 * CSS Object Model. This is a very fast method of applying 
 * incoming updates from LiveStyle which is also works in any
 * modern browser environment.
 */
var pathfinder = require('livestyle-pathfinder');
var splitBy = require('./lib/split');

/**
 * Returns hash with available stylesheets. The keys of hash
 * are absolute urls and values are pointers to StyleSheet objects
 * @return {Object}
 */
var stylesheets = module.exports.stylesheets = function() {
	return findStyleSheets(document.styleSheets);
};

/**
 * Updates given stylesheet with patches
 * @param  {CSSStyleSheet} stylesheet
 * @param  {Array} patches
 * @returns {StyleSheet} List of `insertRule` and `deleteRule` commands
 * that can be applied to stylesheet to receive the same result
 * (used for Shadow CSS in Chrome extension)
 */
var patch = module.exports.patch = function(stylesheet, patches) {
	var self = this;
	if (typeof stylesheet === 'string') {
		stylesheet = this.stylesheets()[stylesheet];
	}

	if (!stylesheet || !stylesheet.cssRules) {
		return false;
	}

	if (!Array.isArray(patches)) {
		patches = [patches];
	}

	var result = patches.map(function(patch) {
		var path = new NodePath(patch.path);
		var hints = patch.hints ? normalizeHints(patch.hints) : null;
		var index = self.createIndex(stylesheet);
		var location = pathfinder.find(index, path, hints);

		if (location.partial && patch.action === 'remove') {
			// node is absent, do nothing
			return;
		}

		if (!location.partial) {
			// exact match on node
			if (patch.action === 'remove') {
				var node = location.node;
				deleteRuleFromMatch(location);
				return resultOfDeletePatch(node);
			}
			return patchRule(location.node.ref, patch);
		}

		var out = [];
		var rule = setupFromPartialMatch(location, out);
		return out.concat(patchRule(rule, patch));
	}).filter(Boolean);

	return flatten(result);
};

var createIndex = module.exports.createIndex = function(ctx, parent) {
	var indexOf = function(item) {
		return this.children.indexOf(item);
	};

	if (!parent) {
		parent = {
			ix: -1,
			name: '',
			parent: null,
			children: [],
			ref: ctx,
			indexOf: indexOf
		};
	}

	var rules = ctx.cssRules;
	if (!rules) {
		return parent;
	}

	for (var i = 0, il = rules.length, rule, name, item; i < il; i++) {
		rule = rules[i];
		name = ruleName(rule);
		if (name === '@charset' || name === '@import') {
			continue;
		}

		item = {
			ix: i,
			name: normalizeSelector(name),
			parent: parent,
			children: [],
			ref: rule,
			indexOf: indexOf
		};

		parent.children.push(item);
		this.createIndex(rule, item);
	}

	return parent;
};

function last(arr) {
	return arr[arr.length - 1];
}

function flatten(input) {
	var output = [];
	for (var i = 0, il = input.length, value; i < il; i++) {
		value = input[i];
		if (Array.isArray(value)) {
			output = output.concat(flatten(value));
		} else {
			output.push(value);
		}
	}
	return output;
}

function isTopLevel(node) {
	return node && node.parent && !node.parent.parent;
}

function resultOfDeletePatch(node) {
	if (isTopLevel(node)) {
		// matched top-level section, removed it
		return {
			action: 'delete',
			index: node.ix
		};
	}

	// matched inner node, mark top-level node as updated
	var ctx = node;
	while (ctx && !isTopLevel(ctx)) {
		ctx = ctx.parent;
	}
	
	if (ctx) {
		return {
			action: 'update',
			index: ctx.ix,
			value: ctx.ref.cssText
		};
	}
}

/**
 * Node path shim
 */
class NodePath {
	constructor(path) {
		this.components = [];
		if (Array.isArray(path)) {
			this.components = path.map(function(c) {
				return new NodePathComponent(c);
			});
		}
	}

	toString() {
		return this.components.map(function(c) {
			return c.toString(true);
		}).join('/');
	}
}

class NodePathComponent {
	constructor(name, pos) {
		if (Array.isArray(name)) {
			pos = name[1];
			name = name[0]
		}

		this.name = normalizeSelector(name);
		this.pos = pos || 1;
	}

	toString() {
		return this.name +  (this.pos > 1 ? '|' + this.pos : '');
	}
}

function normalizeSelector(sel) {
	return sel.trim().replace(/:+(before|after)$/, '::$1');
}

/**
 * Findes all stylesheets in given context, including
 * nested `@import`s
 * @param  {StyleSheetList} ctx List of stylesheets to scan
 * @return {Object} Hash where key as a stylesheet URL and value
 * is a stylesheet reference
 */
function findStyleSheets(ctx, out) {
	out = out || {};
	for (var i = 0, il = ctx.length, url, item; i < il; i++) {
		item = ctx[i];
		url = item.href;
		if (url in out) {
			// stylesheet already added
			continue;
		}

		out[url] = item;
		
		// find @import rules
		// Firefox throws exception when accessing cssRules property 
		// of stylesheet from different origin
		try {
			if (item.cssRules) {
				for (var j = 0, jl = item.cssRules.length; j < jl; j++) {
					if (item.cssRules[j].type == 3) {
						findStyleSheets([item.cssRules[j].styleSheet], out);
					}
				}
			}
		} catch(e) {}
	}
	
	return out;
}

function atRuleName(rule) {
	/*
	 * Reference:
	 * UNKNOWN_RULE: 0
	 * STYLE_RULE: 1
	 * CHARSET_RULE: 2
	 * IMPORT_RULE: 3
	 * MEDIA_RULE: 4
	 * FONT_FACE_RULE: 5
	 * PAGE_RULE: 6
	 * KEYFRAMES_RULE: 7
	 * KEYFRAME_RULE: 8
	 * SUPPORTS_RULE: 12
	 * WEBKIT_FILTER_RULE: 17
	 * HOST_RULE: 1001
	 */
	switch (rule.type) {
		case 2: return '@charset';
		case 3: return '@import';
		case 4: return '@media ' + rule.media.mediaText;
		case 5: return '@font-face';
	}
}

/**
 * Returns name of given rule
 * @param  {CSSRule} rule
 * @return {String}
 */
function ruleName(rule) {
	var sel = rule.selectorText || atRuleName(rule);
	if (sel) {
		return sel;
	}

	var text = rule.cssText;
	if (text) {
		return (text.split('{', 2)[0] || '').trim();
	}
}

/**
 * Returns rule’s parent (stylesheet or rule)
 * @param  {CSSRule} rule
 * @return {CSSStyleSheet}
 */
function parent(rule) {
	return rule.parentRule || rule.parentStyleSheet;
}

/**
 * Check if given @-rule equals to given patch property
 * @param  {CSSRule} rule
 * @param  {Object}  prop
 * @return {Boolean}
 */
function atRuleEquals(rule, prop) {
	if (atRuleName(rule) !== prop.name) {
		return false;
	}

	switch (prop.name) {
		case '@charset':
			return rule.encoding === prop.value.trim().replace(/^['"]|['"]$/g, '');
		case '@import':
			return rule.href === prop.value.trim().replace(/^url\(['"]?|['"]?\)$/g, '');
	}
}

/**
 * Updates properties in given CSS rule
 * @param  {CSSRule} rule
 * @param  {Array} properties
 * @param  {Patch} patch
 */
function updateProperties(rule, properties, patch) {
	if (!rule || !rule.style) {
		return;
	}

	if ('ownerNode' in rule) {
		// A stylesheet (not CSS rule) cannot have properties;
		// updating them in Chrome gives unpredictable result
		return;
	}

	if (patch && patch.all) {
		// there are few challenges when changing updated
		// properies via CSSOM:
		// 1. Updating a a short-hand property only (for example,
		// `background` or `font`) will reset subsequent
		// full properties (`background-size`, `line-height` etc.)
		// that are not changed
		// 2. Chrome has buggy implementation of `background` shorthand:
		// at least it looses `background-size` property.
		// 
		// So right now the only valid and simple solution is to
		// re-apply all exising properties from source CSS even if they
		// were not updated or they doesn’t exist in current CSSOM rule
		properties = patch.all;
	}

	var style = rule.style;
	properties.forEach(function(p) {
		var important = null;
		var value = p.value.replace(/\!important\s*$/, function() {
			important = 'important';
			return '';
		})

		nameVariations(p.name).forEach(function(name) {
			style.setProperty(name, value, important);
		});
	});
}

function nameVariations(name) {
	var out = [name];
	if (name.indexOf('-') !== -1) {
		var camelCased = name.replace(/\-([a-z])/g, function(str, l) {
			return l.toUpperCase();
		});
		out.push(camelCased);
		if (name[0] === '-') {
			out.push(camelCased[0].toLowerCase() + camelCased.slice(1));
		}
	}
	return out;
}

/**
 * Updates given rule with data from patch
 * @param  {CSSRule} rule
 * @param  {Array} patch
 */
function patchRule(rule, patch) {
	var result = [];

	if (!rule) {
		// not a CSSStyleRule, aborting
		return result;
	}

	var reAt = /^@/, childRule;

	// remove properties
	patch.remove.forEach(function(prop) {
		if (reAt.test(prop)) {
			// @-properties are not properties but rules
			if (!rule.cssRules || !rule.cssRules.length) {
				return;
			}
			
			for (var i = 0, il = rule.cssRules.length; i < il; i++) {
				if (atRuleEquals(rule.cssRules[i], prop)) {
					return rule.deleteRule(i);
				}
			}
		} else if (rule.style) {
			rule.style.removeProperty(prop.name);
		}
	});

	var updateRules = {
		'@charset': [],
		'@import': []
	};

	// update properties on current rule
	var properties = patch.update.filter(function(prop) {
		if (prop.name in updateRules) {
			updateRules[prop.name].push(prop);
			return false;
		}

		return true;
	});

	updateProperties(rule, properties, patch);

	// insert @-properties as rules
	while (childRule = updateRules['@charset'].pop()) {
		rule.insertRule(childRule.name + ' ' + childRule.value, 0);
		result.push({
			action: 'insert',
			index: 0,
			value: childRule.name + ' ' + childRule.value
		});
	}

	if (updateRules['@import'].length && rule.cssRules) {
		// @import’s must be inserted right after existing imports
		var childIx = 0, childName;
		for (var i = rule.cssRules.length - 1; i >= 0; i--) {
			childName = atRuleName(rule.cssRules[i]);
			if (childName === '@charset' || childName === '@import') {
				childIx = i;
				break;
			}
		}

		while (childRule = updateRules['@import'].pop()) {
			rule.insertRule(childRule.name + ' ' + childRule.value, childIx);
			result.push({
				action: 'insert',
				index: childIx,
				value: childRule.name + ' ' + childRule.value
			});
		}
	}

	// find parent rule
	var ctx = rule;
	while (ctx.parentRule) {
		ctx = ctx.parentRule;
	}

	var ruleIx = -1;
	var allRules = ctx.parentStyleSheet && ctx.parentStyleSheet.cssRules;
	if (allRules) {
		for (var i = 0, il = allRules.length; i < il; i++) {
			if (allRules[i] === ctx) {
				ruleIx = i;
				break;
			}
		}
	}

	if (ruleIx !== -1) {
		result.push({
			action: 'update',
			index: ruleIx,
			value: ctx.cssText
		});
	}

	return result;
}

function setupFromPartialMatch(match, result) {
	// The `rest` property means we didn’t found exact section
	// where patch should be applied, but some of its parents.
	// In this case we have to re-create the `rest` sections
	// in best matching parent
	var accumulated = match.rest.reduceRight(function(prev, cur) {
		return cur.name + ' {' + prev + '}';
	}, '');

	var parent = match.parent;
	var insertIndex = parent.ref.cssRules ? parent.ref.cssRules.length : 0;
	if (match.node) {
		insertIndex = match.node.ix;
	}

	// console.log('Insert rule at index', insertIndex, match);
	try {
		var ix = parent.ref.insertRule(accumulated, insertIndex);
		if (!parent.ref.parentStyleSheet) {
			// inserted a top-level rule
			result.push({
				action: 'insert',
				index: ix,
				value: parent.ref.cssRules[ix].cssText
			});
		}
	} catch (e) {
		console.warn('LiveStyle:', e.message);
		return;
	}

	var ctx = parent.ref.cssRules[ix];
	var indexed = exports.createIndex(ctx);
	indexed.name = ruleName(ctx);
	indexed.ix = ix;
	parent.children.splice(match.index, 0, indexed);
	for (var i = match.index + 1, il = parent.children.length; i < il; i++) {
		parent.children[i].ix++;
	}

	while (ctx.cssRules && ctx.cssRules.length) {
		ctx = ctx.cssRules[0];
	}

	return ctx;
}

function deleteRuleFromMatch(match) {
	var result = null;
	try {
		parent(match.node.ref).deleteRule(match.node.ix);
	} catch (e) {
		console.warn('LiveStyle:', e);
		console.warn(match);
	}
	// console.log('Removed rule at index', match.node.ix);
	var ix = match.parent.children.indexOf(match.node);
	if (~ix) {
		match.parent.children.splice(ix, 1);
		for (var i = ix, il = match.parent.children.length, child; i < il; i++) {
			match.parent.children[i].ix--;
		}
	}
}

function normalizeHints(hints) {
	var comp = function(c) {
		return new NodePathComponent(c);
	};
	return hints.map(function(hint) {
		if (hint.before) {
			hint.before = hint.before.map(comp);
		}
		if (hint.after) {
			hint.after = hint.after.map(comp);
		}
		return hint;
	});
}
},{"./lib/split":2,"livestyle-pathfinder":3}],2:[function(require,module,exports){
'use strict';

/**
 * Splits given string by given separator with respect of
 * quoted substrings
 * @param  {String} str
 * @param  {String} sep
 * @return {Array}
 */
module.exports = function(str, sep) {
	var parts = [], start = 0, ch;
	for (var i = 0, il = str.length; i < il; i++) {
		ch = str[i];
		switch (ch) {
			case '\\': // skip escaped character
				i++;
				break;

			case '"': // skip quoted substring
			case "'":
				while (++i < il) {
					if (str[i] === '\\') {
						continue;
					}

					if (str[i] === ch) {
						break;
					}
				}
				break;

			case sep:
				parts.push(str.substring(start, i));
				start = i + 1;
				break;
		}
	}

	parts.push(str.substring(start));
	return parts;
};
},{}],3:[function(require,module,exports){
'use strict';

/**
 * Tries to find the best insertion point for absent
 * path nodes (or its components).
 * @param  {ResolvedNode} tree
 * @param  {NodePath} path
 * @param  {Object} hints
 * @return {Object} Object with `parent` and `index` properties
 * pointing to matched element. The `rest` property (if present)
 * means given path can’t be fully matched and `index` property
 * points to `parent` child index where the `rest` node path
 * components should be added
 */
var find = module.exports.find = function(tree, path, hints) {
	if (path.toString() === '') {
		// it’s a root node
		return new SearchResult(tree);
	}

	hints = (hints || []).slice(0);
	var ctx = [tree], found;
	var components = path.components.slice(0);
	var component, hint, result;

	while (component = components.shift()) {
		hint = hints.shift();
		found = flatten(ctx.map(function(node) {
			return locate(node, component, hint);
		})).sort(matchesSort);

		found = found.filter(function(item) {
			return item.score === found[0].score;
		}).map(function(item) {
			return item.node;
		});

		if (!found.length) {
			// Component wasn’t found, which means
			// we have to create it, as well as all other
			// descendants.
			// So let’s find best insertion position, 
			// according to given hints
			components.unshift(component);
			result = last(ctx);
			return new SearchResult(result, indexForHint(result, hint), components);
		} else {
			ctx = found;
		}
	}

	result = last(ctx);
	return new SearchResult(result.parent, result.parent.indexOf(result));
}

/**
 * Returns best insertion position inside `parent`
 * for given hint
 * @param  {ResolvedNode} parent
 * @param  {Object} hint
 * @return {Number}
 */
var indexForHint = module.exports.indexForHint = function(parent, hint) {
	var items = parent.children;
	if (!hint) {
		return parent.children.length;
	}

	// XXX matchingSet() returns staring index of matching subset
	// but for our purposes we actually need the ending index
	var before = matchingSet(items, hint.before).map(function(ix) {
		return ix + hint.before.length;
	});
	var after = matchingSet(items, hint.after);
	var possibleResults = [];
	if (hint.before.length && hint.after.length) {
		// we have both sets of hints, find index between them
		before.forEach(function(ix) {
			for (var i = 0, il = after.length; i < il; i++) {
				if (after[i] >= ix) {
					return possibleResults.push(after[i]);
				}
			}
		});
	} else if (hint.before.length) {
		possibleResults = before;
	} else if (hint.after.length) {
		possibleResults = after;
	}

	// insert nodes at the end by default
	return possibleResults.length ? possibleResults[0] : items.length;
}

function last(arr) {
	return arr[arr.length - 1];
}

function flatten(arr, ctx) {
	ctx = ctx || [];
	arr.forEach(function(item) {
		Array.isArray(item) ? flatten(item, ctx) : ctx.push(item);
	});
	return ctx;
}

function nodeName(node) {
	return node ? (node.normalName || node.name) : null;
}

class SearchResult {
	constructor(parent, index, rest) {
		this.parent = parent;
		this.index = index;
		this.partial = !!rest;
		this.rest = rest;
	}

	get node() {
		if (typeof this.index === 'undefined') {
			return this.parent;
		}
		return this.parent.children[this.index];
	}
}

/**
 * Locates child nodes inside `ctx` that matches given 
 * path `component`. 
 * @param  {ResolvedNode}      ctx       Node where to search
 * @param  {NodePathComponent} component Path component to match
 * @param  {Object} hint       Location hint
 * @return {Array}  List of matched nodes, ordered by matching score
 */
function locate(ctx, component, hint) {
	var items = ctx.children.filter(function(child) {
		return nodeName(child) === component.name;
	});

	return items.map(function(node, i) {
		var score = 0;
		if (hint) {
			score += matchesBeforeHints(node, hint.before) ? 0.5 : 0;
			score += matchesAfterHints(node, hint.after) ? 0.5 : 0;
		} else if (i === component.pos - 1) {
			score += 0.1;
		}

		return {
			node: node,
			index: i,
			score: score
		};
	});
}

function matchesSort(a, b) {
	return (b.score * 10000 + b.index) - (a.score * 10000 + a.index);
}

function matchesBeforeHints(node, hints) {
	var siblings = node.parent.children;
	var ix = siblings.indexOf(node);

	if (!hints || hints.length - 1 > ix) {
		// more hints than siblings
		return false;
	}

	if (hints.length === ix === 0) {
		// hint tells it’s a first node
		return true;
	}

	for (var i = hints.length - 1, sibling; i >= 0; i--) {
		sibling = siblings[--ix];
		if (!sibling || nodeName(sibling) !== hints[i].name) {
			return false;
		}
	}

	return true;
}

function matchesAfterHints(node, hints) {
	var siblings = node.parent.children;
	var ix = siblings.indexOf(node);

	if (!hints || ix + hints.length > siblings.length - 1) {
		 // more hints than siblings
		return false;
	}

	if (hints.length === 0 && ix === siblings.length - 1) {
		// hint tells it’s a last node
		return true;
	}

	for (var i = 0, il = hints.length, sibling; i < il; i++) {
		sibling = siblings[++ix];
		if (!sibling || nodeName(sibling) !== hints[i].name) {
			return false;
		}
	}

	return true;
}

function matchingSet(items, hints) {
	var result = [];
	if (!hints || !hints.length) {
		return result;
	}

	var hl = hints.length;
	items.forEach(function(item, i) {
		if (hints[0].name === nodeName(item)) {
			for (var j = 1; j < hl; j++) {
				if (!items[i + j] || nodeName(items[i +j]) !== hints[j].name) {
					return false;
				}
			}
			result.push(i);
		}
	});

	return result;
}
},{}],4:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _livestyleCssomPatcher = require('livestyle-cssom-patcher');

var cssom = _interopRequireWildcard(_livestyleCssomPatcher);

var _helpersShadowCss = require('./helpers/shadow-css');

var _helpersShadowCss2 = _interopRequireDefault(_helpersShadowCss);

var _helpersOrigin = require('./helpers/origin');

var _helpersOrigin2 = _interopRequireDefault(_helpersOrigin);

var pendingShadowCSSPatches = [];

function $$(sel, context) {
	var items = (context || document).querySelectorAll(sel);
	return Array.prototype.slice.call(items, 0);
}

function applyPatches(url, patches) {
	if (!url || !patches || !patches.length) {
		return;
	}

	var stylesheets = cssom.stylesheets();
	var originalCSS = stylesheets[url];
	if (!originalCSS) {
		// no such stylessheet, aborting
		return;
	}

	if (originalCSS.cssRules) {
		// console.log('apply patch %o on %o', patches, stylesheets[url]);
		cssom.patch(stylesheets[url], patches);
	} else {
		// Empty `cssRules` property means security restrictions applied
		// by Chrome. Try Shadow CSS
		var pending = !!pendingShadowCSSPatches.length;
		pendingShadowCSSPatches = pendingShadowCSSPatches.concat(patches);
		if (pending) {
			// there’s already a request for patching shadow, simply delegate
			// new patches to it
			return;
		}

		(0, _helpersShadowCss2['default'])(url).then(function (css) {
			// Empty pending patches as soon as possible so new patching request
			// can trigger new patching session even there was an error during
			// CSSOM syncing
			var patches = pendingShadowCSSPatches.slice(0);
			pendingShadowCSSPatches.length = 0;
			cssom.patch(css, patches).forEach(function (item) {
				if (item.action === 'delete') {
					originalCSS.deleteRule(item.index);
				} else if (item.action === 'insert') {
					originalCSS.insertRule(item.value, item.index);
				} else if (item.action === 'update') {
					originalCSS.deleteRule(item.index);
					originalCSS.insertRule(item.value, item.index);
				}
			});
		}, function (err) {
			return console.error(err);
		});
	}
}

function userStylesheets() {
	return $$('link[rel="stylesheet"]').filter(function (link) {
		return !!lsId(link);
	});
}

/**
 * Creates `amount` new stylesheets on current page
 * @param  {Number} amount How many stylesheets should be created
 * @returns {Array} Array of stylesheet URLs
 */
function generateUserStylesheets(url) {
	if (!Array.isArray(url)) {
		url = [url];
	}

	var result = {};
	url.forEach(function (internalUrl) {
		console.log('Creating stylesheet', internalUrl);
		var uss = createUserStylesheet();
		uss.dataset.livestyleId = internalUrl;
		document.head.appendChild(uss);
		result[internalUrl] = uss.href;
	});

	return result;
}

function createUserStylesheet(content) {
	var blob = new Blob([content || ''], { type: 'text/css' });
	var url = URL.createObjectURL(blob);
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = url;
	return link;
}

/**
 * Removes stylesheet with given URL (blob or internal LiveStyle ID)
 * @param  {String} url
 */
function removeUserStylesheet(url) {
	console.log('Removing stylesheet', url);
	userStylesheets().forEach(function (link) {
		if (link.href === url || lsId(link) == url) {
			removeLink(link);
		}
	});
}

function removeLink(link) {
	link.parentNode.removeChild(link);
	window.URL.revokeObjectURL(link.href);
}

/**
 * Validates given user stylesheets: adds missing and removes redundant ones
 * @param  {String} url Internal URL or array of URLs
 * @return {Object}     Hash where key is given URL and value if stylesheets’ 
 * blob URL
 */
function validateUserStylesheets(url) {
	var result = {};
	var cur = userStylesheets();
	if (!Array.isArray(url)) {
		url = [url];
	}

	// remove redundant
	var exists = {};
	cur.forEach(function (item) {
		var id = lsId(item);
		if (! ~url.indexOf(id)) {
			removeLink(item);
		} else {
			exists[id] = item.href;
		}
	});

	// create missing
	var missing = generateUserStylesheets(url.filter(function (item) {
		return !(item in exists);
	}));

	// re-create result hash with keys in right order
	var result = {};
	url.forEach(function (item) {
		result[item] = exists[item] || missing[item];
	});
	return result;
}

/**
 * Findes all stylesheets in given context, including
 * nested `@import`s
 * @param  {StyleSheetList} ctx List of stylesheets to scan
 * @return {Array} Array of stylesheet URLs
 */
function findStyleSheets(ctx, out) {
	out = out || [];
	for (var i = 0, il = ctx.length, url, item; i < il; i++) {
		item = ctx[i];
		url = item.href;
		if (~out.indexOf(url) || lsId(item.ownerNode)) {
			// stylesheet already added or it’s a user stylesheet
			continue;
		}

		if (url) {
			out.push(url);
		}

		// find @import rules
		if (item.cssRules) {
			for (var j = 0, jl = item.cssRules.length; j < jl; j++) {
				if (item.cssRules[j].type == 3) {
					findStyleSheets([item.cssRules[j].styleSheet], out);
				}
			}
		}
	}

	return out;
}

function lsId(node) {
	var dataset = node && node.dataset || {};
	return dataset.livestyleId;
}

// disable in-page LiveStyle extension
document.documentElement.setAttribute('data-livestyle-extension', 'available');

chrome.runtime.onMessage.addListener(function (message, sender, callback) {
	if (!message) {
		return;
	}

	var data = message.data;
	switch (message.name) {
		case 'apply-cssom-patch':
			return applyPatches(data.stylesheetUrl, data.patches);
		case 'create-user-stylesheet':
			callback(generateUserStylesheets(data.url));
			return true;
		case 'remove-user-stylesheet':
			return removeUserStylesheet(data.url);
		case 'validate-user-stylesheet':
			callback(validateUserStylesheets(data.url));
			return true;
		case 'get-stylesheets':
			callback(findStyleSheets(document.styleSheets));
			return true;
		case 'get-origin':
			callback((0, _helpersOrigin2['default'])());
			return true;
	}
});
},{"./helpers/origin":5,"./helpers/shadow-css":6,"livestyle-cssom-patcher":1}],5:[function(require,module,exports){
/**
 * A content script for extracting page’s URL origin. Mostly used for getting
 * origin of documents with `file:` protocol for Remote View.
 * By default it’s a filesystem root, so if RV will open a public HTTP server
 * pointing filesystem root, it’s gonna be a huge security breach. This module
 * will try to find a largest common dir prefix for resources from current
 * page.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var reIsFile = /^file:/;

exports['default'] = function () {
	var origin = location.origin;
	if (/^https?:/.test(origin)) {
		return origin;
	}

	if (reIsFile.test(origin)) {
		return findFileOrigin();
	}

	return null;
};

;

function $$(sel, context) {
	var items = (context || document).querySelectorAll(sel);
	return Array.prototype.slice.call(items, 0);
}

function findFileOrigin() {
	return $$('link, img, a, video, audio, script, iframe').concat([location]).map(function (elem) {
		return elem.currentSrc || elem.src || elem.href;
	}).filter(function (url) {
		return url && reIsFile.test(url);
	}).map(function (url) {
		// remove file from url and normalize it
		var parts = url.replace(/^file:\/\//, '').split('/');
		if (/\.[\w-]+$/.test(parts[parts.length - 1] || '')) {
			parts.pop();
		}
		return 'file://' + parts.join('/').replace(/\/+$/, '');
	}).reduce(function (prev, cur) {
		return cur.length < prev.length ? cur : prev;
	});
}
module.exports = exports['default'];
},{}],6:[function(require,module,exports){
/**
 * Shadow CSS is a concept used to bypass Chrome security restrictions for CSSOM:
 * if a stylesheet is loaded from different origin or 'file:' protocol, you cannot
 * access its `cssRules`. But `insertRule()` and `deleteRule()` works fine though.
 *
 * Here’s how Shadow CSS works:
 * 1. Loads contents of given (security restricted) stylesheet either from
 * DevTools resource (faster, contains most recent changes) or via XHR 
 * (extensions can bypass CORS restrictions).
 * 2. Creates inline style with this stylesheet contents in hidden iframe. This
 * stylesheets always allows access to `cssRules`.
 * 3. Use this inline stylesheet for CSSOM patching. The patching will return 
 * an update plan: a set of `insterRule()` and `deleteRule()` instructions that
 * must be applied to origin stylesheet to get the same result.
 * 4. Blindly apply this update plan to original stylesheet and hope everything
 * works as expected.
 * 5. Automatically keep track of all DevTools Resources updates and keep 
 * shadow CSS in sync.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var host = null;
var shadowCSS = {};

exports['default'] = function (url) {
	return new Promise(function (resolve, reject) {
		if (url in shadowCSS) {
			return resolve(shadowCSS[url].sheet);
		}

		// reject promise if no answer for too long
		var _timer = setTimeout(function () {
			reject(makeError('ESHADOWSTNORESPONSE', 'Unable to fetch ' + url + ': no response from background page'));
		}, 5000);

		// fetch stylesheet contents first
		chrome.runtime.sendMessage({ name: 'get-stylesheet-content', data: { url: url } }, function (resp) {
			if (_timer) {
				clearTimeout(_timer);
				_timer = null;
			}

			// A stylesheet may be already created with another request
			if (!shadowCSS[url]) {
				if (resp == null) {
					// `null` or `undefined` means error while fetching CSS contents,
					// try again later
					return reject(makeError('ESHADOWSTEMPTY', 'Content fetch request for ' + url + ' returned null'));
				}

				shadowCSS[url] = createShadowStylesheet(resp);
				shadowCSS[url].dataset.href = url;
			}

			resolve(shadowCSS[url].sheet);
		});
	});
};

;

function getHost() {
	if (!host) {
		var iframe = document.createElement('iframe');
		iframe.style.cssText = 'width:1px;height:1px;border:0;position:absolute;display:none';
		iframe.id = 'livestyle-shadow-css';
		var content = new Blob(['<html><head></head></html>'], { type: 'text/html' });
		iframe.src = URL.createObjectURL(content);
		document.body.appendChild(iframe);
		host = iframe.contentDocument;
	}
	return host;
}

function createShadowStylesheet(content) {
	var style = getHost().createElement('style');
	getHost().head.appendChild(style);
	if (style.sheet) {
		style.sheet.disabled = true;
	}
	style.textContent = content || '';
	return style;
}

function makeError(code, message) {
	var err = new Error(message || code);
	err.code = code;
	return err;
}

// listen to DevTools Resource updates
chrome.runtime.onMessage.addListener(function (message) {
	if (message && message.name === 'resource-updated' && shadowCSS[message.data.url]) {
		var data = message.data;
		shadowCSS[data.url].textContent = data.content;
	}
});
module.exports = exports['default'];
},{}]},{},[4])(4)
});
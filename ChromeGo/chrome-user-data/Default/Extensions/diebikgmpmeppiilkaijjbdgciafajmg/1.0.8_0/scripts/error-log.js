(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.errorLog = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function padNum(num) {
	return (num < 10 ? '0' : '') + num;
}

function toDOM(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	var df = document.createDocumentFragment();
	while (div.firstChild) {
		df.appendChild(div.firstChild);
	}
	return df;
}

function renderLogItem(item) {
	var date = new Date(item.date);
	var time = padNum(date.getHours()) + ':' + padNum(date.getMinutes());

	return toDOM('<li id="' + item.messageId + '" class="log__item" data-type="' + item.type + '">' + '<span class="time">[' + time + ']</span> ' + item.message.replace(/\t/g, ' ') + '</li>');
}

function updateLog(items) {
	// show log items in reverse order, e.g. newer on top
	items = items.reverse();

	var container = document.querySelector('.log');
	var currentItems = container.querySelectorAll('.log__item');
	var lookup = {};
	for (var i = 0, il = currentItems.length; i < il; i++) {
		lookup[currentItems[i].getAttribute('id')] = currentItems[i];
	}

	var df = document.createDocumentFragment();
	items.forEach(function (item) {
		var itemId = item.messageId + '';
		if (lookup[itemId]) {
			df.appendChild(lookup[itemId]);
			delete lookup[itemId];
		} else {
			df.appendChild(renderLogItem(item));
		}
	});

	// Remove old messages
	Object.keys(lookup).forEach(function (id) {
		container.removeChild(lookup[id]);
	});

	// Insert current messages
	container.appendChild(df);
}

// Listen to log updates
chrome.runtime.onMessage.addListener(function (message) {
	if (message.name === 'log-updated') {
		updateLog(message.data);
	}
});

// Request current log
chrome.runtime.sendMessage({ name: 'get-log' }, updateLog);
},{}]},{},[1])(1)
});
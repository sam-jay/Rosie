(function () {
	'use strict';

	var express = require('express'),
			config	= require('./config').auth;

	var before = function (req, callback) {

	};

	var after = function (res, callback) {

	};

	module.exports = {
		before: before,
		after: after
	};
})();
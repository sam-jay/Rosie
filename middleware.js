(function () {
	'use strict';

	var express = require('express'),
			http		= require('http'),
			url 		= require('url'),
			async		= require('async');

	var services = {
		'LOGGING': require('./logging'),
		'AUTH': require('./auth')
	};

	var execute = function(req, res) {
		var resource = req.resource,
				operations = [],
				apiResponse = null;

		/* Sort middleware by priority */
		var compareFunction = function(x, y) {
			return y.priority - x.priority;
		};
		var before = resource.middleware.before.sort(compareFunction),
				after = resource.middleware.after.sort(compareFunction);

		/* Register before handlers */
		before.forEach(function(middleware, index, array) {
			operations.push(function(callback) {
				services[middleware.name].before(req, function(err) {
					if (err) return callback(err);
					return callback(null);
				});
			});
		});

		/* Register api request handler */
		operations.push(function(callback) {
			var options = {
				hostname: resource.origin.hostname,
				port: resource.origin.port,
				path: resource.origin.path,
				method: req.method,
				headers: req.headers
			};
			http.request(options, function(response) {
				var body = '';
				if (String(response.statusCode).charAt(0) != '2') {
					return callback(response.statusCode);
				}
				apiResponse = response;
				response.on('data', function(data) {
					body += data;
				}).on('end', function() {
					apiResponse.body = body;
					return callback(null);
				});
			}).write(req.body).end();
		});

		/* Register after handlers */
		after.forEach(function(middleware, index, array) {
			operations.push(function(callback) {
				services[middleware.name].after(apiResponse, function(err) {
					if (err) return callback(err);
					return callback(null);
				});
			});
		});

		/* Execute all handlers in series */
		async.waterfall(operations, function(err, result) {
			if (err) return res.status(err).json(req.errorBody ? req.errorBody :
																						apiResponse.errorBody);
			return res.status(apiRespnse.statusCode).json(apiResponse.body);
		});
	};

	module.exports = {
		execute: execute
	};

})();
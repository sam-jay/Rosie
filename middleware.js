(function () {
	'use strict';

	var express = require('express'),
			http		= require('http'),
			url 		= require('url'),
			async		= require('async');

	var services = {};

	var execute = function(req, res) {
		var resource = req.resource,
				operations = [];

		/* Sort middleware by priority */
		var compareFunction = function(x, y) {
			return y.priority - x.priority;
		};
		var before = resource.middleware.before.sort(compareFunction),
				after = resource.middleware.after.sort(compareFunction);

		/* Register before handlers */
		before.forEach(function(middleware, index, array) {
			operations.push(function(callback) {
				services[middleware.name].before(req, res, callback);
			});
		});

		/* Register api request handler */
		operations.push(function(callback) {
			var options = {
				host: resource.origin.hostname,
				port: resource.origin.port,
				path: resource.origin.path + req.originalUrl.substring(resource.prefix.length + 1),
				method: req.method,
				headers: req.headers
			};
			delete options.headers['host'];
			delete options.headers['content-length'];
			var newReq = http.request(options, function(response) {
				req.apiResponse = response;
				var body = '';
				if (String(response.statusCode).charAt(0) !== '2') {
					return callback(null);
				}
				response.on('data', function(data) {
					body += data;
				}).on('end', function() {
					console.log('api response body: ' + body);
					req.apiResponse.body = body;
					return callback(null);
				});
			});
			if (req.body) {
				console.log(JSON.stringify(req.body));
				newReq.write(JSON.stringify(req.body));
			}
			newReq.end();
		});

		/* Register after handlers */
		after.forEach(function(middleware, index, array) {
			console.log('registering after ' + middleware.name);
			operations.push(function(callback) {
				console.log('executing after ' + middleware.name);
				services[middleware.name].after(req, res, callback);
			});
		});

		/* Execute all handlers in series */
		async.waterfall(operations, function(err, result) {
			if (err === 'finished')
				return;
			return res.status(req.apiResponse.statusCode).send(req.apiResponse.body);
		});
	};

	module.exports = function(client) {
		services['LOGGING'] = require('./logging');
		services['AUTH'] = require('./auth')(client);
		services['NONCE'] = require('./nonce')(client);
		services['ETAG'] = require('./etag')(client);
		return {
			execute: execute
		};
	}

})();
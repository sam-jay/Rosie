(function () {
	'use strict';

	var express = require('express'),
			http		= require('http'),
			url 		= require('url'),
			async		= require('async');

	var services = {};

	var execute = function(req, res) {
		var resource = req.resource,
				operations = [],
				apiResponse = {};

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
				host: 'jsonplaceholder.typicode.com',
				//host: resource.origin.hostname,
				//port: resource.origin.port,
				path: resource.origin.path + req.originalUrl.substring(resource.prefix.length + 1),
				method: req.method,
				headers: req.headers
			};
			delete options.headers['nonce'];
			console.log(options);
			var newReq = http.request(options, function(response) {
				//console.log(response);
				var body = '';
				if (String(response.statusCode).charAt(0) != '2') {
					return callback(response.statusCode);
				}
				apiResponse = response;
				response.on('data', function(data) {
					body += data;
				}).on('end', function() {
					console.log('api response body: ' + body);
					apiResponse.body = body;
					return callback(null);
				});
			});
			if (req.body) {
				newReq.write(JSON.stringify(req.body));
			}
			newReq.end();
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

	module.exports = function(client) {
		services['LOGGING'] = require('./logging');
		services['AUTH'] = require('./auth')(client);
		return {
			execute: execute
		};
	}

})();
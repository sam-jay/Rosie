(function () {
	'use strict';

	var express = require('express'),
			http 		= require('http'),
			config	= require('./config').logging;

	var before = function(req, callback) {
		var options = {
			hostname: config.hostname,
			port: config.port,
			path: config.path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		var body = {
			priority: 0,
			data: {
				request: {
					statusCode: req.statusCode,
					headers: {},
					params: req.params,
					body: req.body
				}
			}
		};
		for (var h in req.headers) {
		  if (req.headers.hasOwnProperty(h) && h !== 'Authorization') {
		    body.data.request.headers[h] = req.headers[h];
		  }
		}
		http.request(options, function(response) {
			if (String(response.statusCode) === String('400')) {
				response.errorBody = {
					message: 'Winston replied NOT OK'
				};
				return callback(400);
			} else if (String(response.statusCode) === String('200')) {
				return callback(null);
			}
		}).write(body).end();
	};

	var after = function(res, callback) {

	};

	module.exports = {
		before: before,
		after: after
	};
})();
(function () {
	'use strict';

	var express = require('express'),
			http 		= require('http'),
			config	= require('./config').logging;

	var log = function(body, res, callback) {
		var options = {
			hostname: config.hostname,
			port: config.port,
			path: config.path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		var newReq = http.request(options, function(response) {
			if (String(response.statusCode) === String('400')) {
				console.log('WINSTON REPLIED NOT OK');
				response.errorBody = {
					message: 'Winston replied NOT OK'
				};
				return callback(400);
			} else if (String(response.statusCode) === String('200')) {
				console.log('WINSTON REPLIED OK');
				return callback(null);
			}
		});
		newReq.write(JSON.stringify(body));
		newReq.end();
	};

	var before = function(req, res, callback) {
		var body = {
			priority: 0,
			data: {
				request: {
					statusCode: req.statusCode,
					headers: {},
					params: JSON.stringify(req.params),
					body: JSON.stringify(req.body)
				}
			}
		};
		for (var h in req.headers) {
		  if (req.headers.hasOwnProperty(h) && h !== 'Authorization') {
		    body.data.request.headers[h] = req.headers[h];
		  }
		}
		console.log('logging before');
		log(body, res, callback);
	};

	var after = function(req, res, callback) {
		var body = {
			priority: 0,
			data: {
				request: {
					statusCode: req.statusCode,
					headers: {},
					params: JSON.stringify(req.params),
					body: JSON.stringify(req.body)
				}
			}
		};
		for (var h in req.apiResponse.headers) {
		  if (req.apiResponse.headers.hasOwnProperty(h) && h !== 'Authorization') {
		    body.data.request.headers[h] = req.apiResponse.headers[h];
		  }
		}
		console.log('logging after');
		log(body, res, callback);
	};
	module.exports = {
		before: before,
		after: after
	};
})();
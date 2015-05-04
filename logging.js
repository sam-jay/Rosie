(function () {
	'use strict';

	var express = require('express'),
			http 		= require('http'),
			config	= require('./config').logging;

	var log = function(body, res) {
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
			if (String(response.statusCode).charAt(0) !== '2') {
				console.log('WINSTON REPLIED NOT OK');
				/*response.errorBody = {
					message: 'Winston replied NOT OK'
				};*/
				//return callback(400); // fix this
			} else {
				console.log('WINSTON REPLIED OK');
				//return callback(null);
			}
		});
		newReq.write(JSON.stringify(body));
		newReq.end();
	};

	var before = function(req, res, callback) {
		var body = {
			priority: 'low',
			data: {
				request: {
					url: req.originalUrl,
					method: req.method,
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
		return callback(null);
	};

	var after = function(req, res, callback) {
		var body = {
			priority: 'low',
			data: {
				response: {
					headers: {},
					statusCode: req.apiResponse.statusCode,
					body: JSON.stringify(req.apiResponse.body)
				}
			}
		};
		console.log('in after');
		console.log(String(req.apiResponse.statusCode) + ' ' + String(req.apiResponse.statusCode).indexOf('2'));
		if (String(req.apiResponse.statusCode).indexOf('2') !== 0) {
			body.priority = 'high';
		}
		for (var h in req.apiResponse.headers) {
		  if (req.apiResponse.headers.hasOwnProperty(h) && h !== 'Authorization') {
		    body.data.response.headers[h] = req.apiResponse.headers[h];
		  }
		}
		console.log('logging after');
		log(body, res, callback);
		return callback(null);
	};
	module.exports = {
		before: before,
		after: after
	};
})();
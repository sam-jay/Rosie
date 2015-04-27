(function () {
	'use strict';

	var express = require('express'),
			config	= require('./config').auth,
			http		= require('http'),
			async = require('async');

	var redis = {};

	var before = function(req, res, callback) {
		var options = {
			hostname: config.hostname,
			port: config.port,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		if (!req.headers['authorization']) {
			res.status(401).json({
				'message': 'No credentials provided in Authorization header'
			});
			return callback('finished');
		} else if (req.headers['authorization'].split(' ')[0] === 'Basic') {
			/* Get tokens from Stan */
			options.path = '/auth_service/tokens';
			options.headers['authorization'] = req.headers['authorization'];
			http.request(options, function(response) {
				var body = '';
				response.on('data', function(data) {
					body += data;
				}).on('end', function() {
					console.log('stan: '+response.statusCode);
					console.log('stan: '+body);
					if (String(response.statusCode).charAt(0) != '2') {
						res.status(401).json({
							'message': 'Could not retrieve access tokens from Auth server'
						});
						return callback('finished');
					}
					return authorize(JSON.parse(body).tokens.join('&&'));
				});
			}).end(); 
		} else if (req.headers['authorization'].split(' ')[0] === 'Bearer') {
			return authorize(req.headers['authorization'].split(' ')[1]);
		} else {
			req.errorBody = {
				'message': 'Invalid authorization header. Header must contain Basic or Bearer.'
			};
			return callback(401);
		}

		function authorize(tokens) {
			var tokenArray = tokens.split('&&');
			async.each(tokenArray, function(token, cb) {
				redis.client.get('token:' + token, function(err, reply) {
					if (!reply || req.resource.prefix !== reply) {
						return cb(null);
					} else {
						return cb(reply);
					}
				});
			}, function(reply) {
				if (reply) {
					// Grant access
					return callback(null);
				} else {
					res.status(401).json({
						'message': 'Access denied'
					});
					return callback('finished');
				}
			});
		}
	};

	var after = function(req, res, callback) {
		return callback(null);
	};

	module.exports = function(client) {
		redis.client = client;
		return {
			before: before,
			after: after
		};
	};

})();
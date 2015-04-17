(function () {
	'use strict';

	var express = require('express'),
			config	= require('./config').auth;

	var before = function(req, callback) {
		var options = {
			hostname: config.hostname,
			port: config.port,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		if (!req.headers['Authorization']) {
			req.errorBody = {
				'message': 'No credentials provided in Authorization header'
			};
			return callback(401);
		} else if (req.headers['authorization'].split(' ')[0].equals('Basic')) {
			/* Get tokens from Stan */
			options.path = '/auth_service/tokens'
			http.request(options, function(response) {
				var body = '';
				if (String(response.statusCode).charAt(0) != '2') {
					req.errorBody = {
						'message': 'Could not retrieve access tokens from Auth server'
					};
					return callback(401);
				}
				response.on('data', function(data) {
					body += data;
				}).on('end', function() {
					return authorized(body.tokens.join('&&')) ? callback() : callback(401);
				});
			}).end(); 
		} else if (req.headers['authorization'].split(' ')[0].equals('Bearer')) {
			return authorized(response.headers['authorization'].split(' ')[1]) ? callback() : callback(401);
		}

		function authorized(tokens) {
			tokenArray = tokens.split('&&');
			// TODO : AUTH STUFF
			req.errorBody = {
						'message': 'Access denied'
			};
		}
	};

	var after = function(res, callback) {

	};

	module.exports = {
		before: before,
		after: after
	};
})();
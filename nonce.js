(function() {
	'use strict';

	var redis = {};

	var before = function(req, res, callback) {
		if (!req.headers['nonce']) {
			return callback(null);
		}
		redis.client.get('nonce:' + req.headers['nonce'], function(err, reply) {
			if (!reply) {
				// no cached response
				var response = {
					statusCode: 200,
					headers: {},
					body: ''
				};
				var cache = function() {
					redis.client.set('nonce:' + req.headers['nonce'], JSON.stringify(response));
				};
				res.__status = res.status;
				res.__send = res.send;
				res.__json = res.json;
				res.__set = res.set;
				res.status = function(statusCode) {
					response.statusCode = statusCode;
					return res.__status(statusCode);
				};
				res.send = function(body) {
					response.body = body;
					cache();
					return res.__send(body);
				};
				res.json = function(body) {
					response.body = body;
					cache();
					return res.__json(body);
				};
				res.set = function(object) {
					for (var key in object) {
						if (object.hasOwnProperty(key)) {
							response.headers[key] = object[key];
						}
					}
					console.log('once');
					return res.__set(object);
				};
				return callback(null);
			} else {
				// have cached response
				var response = JSON.parse(reply);
				res.status(response.statusCode).send(response.body);
				return callback('finished');
			}
		});
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
(function() {
	'use strict';

	module.exports = function(client) {
		return function(req, res, next) {
			var response = {
				statusCode: 200,
				headers: {},
				body: ''
			};
			client.get('nonce:' + req.headers['nonce'], function(err, reply) {
				if (!reply) {
					var cacheResponse = function() {
						client.set('nonce:' + req.headers['nonce'], JSON.stringify(response));
					};
					res.__status = res.status;
					res.__send = res.send;
					res.__json = res.json;
					res.status = function(statusCode) {
						response.statusCode = statusCode;
						return res.__status(statusCode);
					};
					res.send = function(body) {
						response.body = body;
						cacheResponse();
						return res.__send(body);
					};
					res.json = function(body) {
						response.body = body;
						cacheResponse();
						return res.__json(body);
					};
					return next();
				} else {
					var jsonReply = JSON.parse(reply);
					return res.status(jsonReply.statusCode).send(jsonReply.body);
				}
			});
		};
	};

})();
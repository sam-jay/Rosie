(function () {
	'use strict';

	var express 		= require('express'),
			Resource 		= require('./resource.model'),
			router 			= express.Router();

	module.exports = function(client) {
		var Middleware = require('./middleware')(client);
		router.all('/', function(req, res) {
			/* Setup query to find resource */
			var query = {};
			query['$where'] = function() {
				return "url".indexOf(obj.prefix) === 0;
			}.toString().replace('url', req.originalUrl);

			/* Execute query */
			Resource.findOne(query, function(err, resource) {
				/* Handle errors */
				if (err) return res.status(500).send(err);
				if (!resource) return res.status(404).send();
				if (resource.verbs.indexOf(req.method) === -1)	// Method not allowed
					return res.set('Allow', resource.verbs.join(', ')).status(405).send();
				req.resource = resource;
				res.resource = resource;
				return Middleware.execute(req, res);
			});
		});
		return router;
	};
	
})();
(function () {
	'use strict';

	var _ 				= require('lodash'),
			express		= require('express'),
			Resource 	= require('./resource.model'),
			router		= express.Router(),
			async			= require('async');

	router.get('/resources', function(req, res) {
		Resource.find({}, function(err, resources) {
			if (err) return res.status(500).send(err);
			resources.url = '/api_manager/resources';
			return res.status(200).json(resources);
		});
	});

	router.get('/resources/:id', function(req, res) {
		Resource.findbyId(req.params.id, function(err, resource) {
			if (err) return res.status(500).send(err);
			if (!resource) return res.status(404).send();
			resource.url = '/api_manager/resources/' + req.params.id;
			return res.status(200).json(resource);
		});
	});

	router.post('/resources', function(req, res) {
		if (req.body.prefix[0] !== '/') {
			req.body.prefix = '/' + req.body.prefix;
		}
		Resource.create(req.body, function(err, resource) {
			if (err) return res.status(500).send(err);
			resource.url = '/api_manager/resources/' + resource._id;
			console.log('created new resource');
			return res.status(201).json(resource);
		});
	});

	router.put('/resources/:id', function(req, res) {
		if (req.body._id) delete req.body._id;
		Resource.findById(req.params.id, function(err, resource) {
			if (err) return res.status(500).send(err);
			if (!resource) return res.status(404).send();
			var updated = _.merge(resource, req.body);
			updated.save(function (err) {
				if (err) return res.status(500).send(err);
				updated.url = '/api_manager/resources/' + updated._id;
				return res.status(200).json(updated);
			});
		});
	});

	router.delete('/resources/:id', function(req, res) {
		Resource.findById(req.params.id, function(err, resource) {
			if (err) return res.status(500).send(err);
			if (!resource) return res.status(404).send();
			resource.remove(function (err) {
				if (err) return res.status(500).send(err);
				return res.status(204).send();
			});
		});
	});

	module.exports = function(client) {
		router.post('/updateResourceTokens', function(req, res) {
			console.log('here');
			if (req.body) {
				client.keys('token:*', function(err, rows) {
					if (err) return res.status(500).send();
					async.each(rows, function(row, callbackDelete) {
						client.del(row, callbackDelete);
					}, function() {
						async.each(req.body, function(item, callbackSet) {
							client.set('token:' + item.resource_token, item.resource_id, callbackSet);
						}, function() {
							client.keys('token:*', function(err, rows) {
								console.log(rows);
							});
							return res.status(200).send();
						});
					});
				});
			}
		});
		return router;
	}
})();
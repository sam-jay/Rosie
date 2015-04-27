(function () {
	'use strict';

	var express = require('express'),
		config	= require('./config').auth,
		etag = require('etag');

	var redis = {};

	module.exports = function(client) {
		redis.client = client;
		return {
			before: before,
			after: after
		};
	};

	var before = function(req, res, callback) {
		var provided_etag;
		if (req.headers['if-modified-since'] !== undefined) {
			provided_etag = req.headers['if-modified-since'];
		} else if (req.headers['if-none-match'] !== undefined) {
			provided_etag = req.headers['if-none-match'];
		} else {
			return callback(null);
		}
		redis.client.get('etag:' + req.originalUrl, function(err, reply) {
			// no etag for that entity (never before requested) or resource has changed and etag is different
			if (!reply || provided_etag !== reply) {
				return callback(null);
			} 
			// etag is the same - not modified reply
			else if (reply === provided_etag) {
				return callback(304);
			}
		});	
	};

	var after = function(req, res, callback) {
		var etag_to_write = etag(res.body);
		redis.client.set('etag:' + res.requestedUrl, etag_to_write);
		return callback(null);
	}

})();
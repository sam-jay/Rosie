(function () {
	'use strict';

	var bodyParser 		= require('body-parser'),
			cookieParser 	= require('cookie-parser');

	module.exports = {
		port: 3000,
  	// MongoDB connection options
	  mongo: {
	    uri: 'mongodb://localhost/rosie-dev'
	  },
	  express: function(app) {
	  	app.use(bodyParser.urlencoded({ extended: false }));
  		app.use(bodyParser.json());
  		app.use(cookieParser());
	  },
	  logging: {
	  	hostname:,
	  	port: 
	  	path: ''
	  },
	  auth: {

	  }
	};
})();
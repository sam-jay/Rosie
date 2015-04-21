(function () {
	'use strict';

	var bodyParser 		= require('body-parser'),
			cookieParser 	= require('cookie-parser');

	module.exports = {
		port: 3001,
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
	  	hostname: 'localhost',
	  	port: 4001,
	  	path: '/logger'
	  },
	  auth: {
	  	hostname: 'localhost',
	  	port: 4000,
	  	path: '/auth_service'
	  }
	};
})();

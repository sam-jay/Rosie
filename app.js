(function () {
  'use strict';

  var express 	= require('express'),
  		mongoose 	= require('mongoose'),
  		redis			= require('redis'),
  		config 		= require('./config');

  mongoose.connect(config.mongo.uri);

  var client = redis.createClient();
  client.on('connect', function() {
  	console.log('connected to redis');
  });

  var app = express();
  config.express(app);

  app.use('/api_manager/', require('./manager')(client));
  app.use('/*', require('./router')(client));

  app.listen(config.port, function() {
  	console.log('listening on port ' + config.port);
  });

})();
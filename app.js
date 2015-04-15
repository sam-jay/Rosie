(function () {
  'use strict';

  var express 	= require('express'),
  		mongoose 	= require('mongoose'),
  		config 		= require('./config');

  mongoose.connect(config.mongo.uri);

  var app = express();
  config.express(app);
  app.use('/api_manager/', require('./manager'));
  app.use('/*', require('./router'));
  app.listen(config.port);

})();
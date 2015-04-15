(function () {
	'use strict';

	var mongoose 	= require('mongoose'),
			Schema		= mongoose.Schema;

	var resourceSchema = new Schema({
		prefix: { type: String, required: '{PATH} is required!' },
		origin: {
			hostname: { type: String, required: '{PATH} is required!' },
			port: { type: Number, required: '{PATH} is required!' },
			path: { type: String, required: '{PATH} is required!' }
		},
		verbs: [{ 
			type: String,
			required: '{PATH} is required!',
			enum: ['GET', 'PUT', 'POST', 'DELETE']
		}],
		middleware: {
			before: [{
				name: {
					type: String,
					required: '{PATH} is required!',
					enum: ['LOGGING', 'AUTH']
				},
				priority: {
					type: Number,
					required: '{PATH} is required!',
					min: 0,
					max: 100
				}
			}],
			after: [{
				name: {
					type: String,
					required: '{PATH} is required!',
					enum: ['LOGGING', 'AUTH']
				},
				priority: {
					type: Number,
					required: '{PATH} is required!',
					min: 0,
					max: 100
				}
			}],
		}
	});

	module.exports = mongoose.model('Resource', resourceSchema);
})();
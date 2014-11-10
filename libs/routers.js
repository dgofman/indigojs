'use strict';

var debug = require('debug')('indigo:routers'),
	express = require('express'),
	fs = require('fs');

module.exports = {

	init: function(app, nconf, redirectListener) {

		// dynamically include routers
		var routers = nconf.get('routers');
		if (!routers && fs.lstatSync('routers').isDirectory()) {
			routers =  ['./routers'];
		}
		loadModule(routers, function(route, file) {
			var router = express.Router(),
				next = function() {},
				path, params;

			router.use(redirectListener);
			
			params = route(router, next) || {};
			if (typeof params === 'string') {
				path = params;
			} else {
				path = params.path;
			}

			if (!path) {
				throw new Error('Invalid the router path in: %s', file);
			}

			app.use(path, router);

			debug('router::path - %s, controllers: %s', path, params.controllers);

			// dynamically include controllers
			loadModule(params.controllers, function(controller) {
				controller(router, next);
			});
		});
	}
};

function loadModule(dirs, callback) { 
	for (var index in dirs) {
		var dir = __appDir + dirs[index];
		if (fs.lstatSync(dir).isDirectory()) {
			fs.readdirSync(dir).forEach(function (file) {
				if(file.substr(-3) === '.js') {
					callback(require(dir + '/' + file.split('.')[0]), dir + '/' + file);
				}
			});
		}
	}
}
'use strict';

var debug = require('debug')('indigo:routers'),
	express = require('express'),
	fs = require('fs');

module.exports = {

	init: function(app, appconf, reqModel, redirectListener) {

		// dynamically include routers
		var routers = appconf.get('routers');
		if (!routers) {
			routers =  ['routers'];
		}

		debug('router::routers', routers);

		loadModule(routers, function(route) {
			var router = express.Router(),
				base, params;

			router.use(function (req, res, next) {
				var header = req.headers || {};
				if (!header.accept || header.accept.indexOf('text/html') !== -1) {
					debug(req.method, req.url, req.originalUrl);
					req.model = JSON.parse(reqModel);
				}

				if (header['x-requested-with'] !== 'XMLHttpRequest') { //EJS include
					next();
				}
			});

			params = route(router) || {};
			if (typeof params === 'string') {
				base = params;
			} else {
				base = params.base || '/';
			}

			app.use(base, router);

			Object.defineProperty(router, 'base', {
				get: function() { return base; },
				enumerable: true
			});

			Object.defineProperty(router, 'app', {
				get: function() { return app; },
				enumerable: true
			});

			debug('router::base - %s, controllers: %s', base, params.controllers);

			// dynamically include controllers
			loadModule(params.controllers, function(controller) {
				if (typeof(controller) === 'function') {
					controller(router);
				}
			});

			router.use(redirectListener);
		});
	}
};

function loadModule(dirs, callback) { 
	for (var index in dirs) {
		var dir = __appDir + dirs[index];
		debug('router::dir - %s', dir);
		if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
			fs.readdirSync(dir).forEach(function (file) {
				if(file.substr(-3) === '.js') {
					callback(require(dir + '/' + file.split('.')[0]));
				}
			});
		}
	}
}
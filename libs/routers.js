'use strict';

var debug = require('debug')('indigo:routers'),
	express = require('express'),
	fs = require('fs');

module.exports = {

	init: function(app, appconf, reqModel) {

		// dynamically include routers
		var middleware = require('./middleware')(appconf),
			routers = appconf.get('routers');
		if (!routers) {
			routers =  ['routers'];
		}

		debug('router::routers', routers);

		loadModule(routers, function(route) {
			var router = express.Router(),
				conf = {};

			Object.defineProperty(router, 'conf', {
				get: function() { return conf; },
				enumerable: true
			});

			Object.defineProperty(router, 'app', {
				get: function() { return app; },
				enumerable: true
			});

			router.get = function(path, callback) {
				router.route(path)
					.all(function(req, res, next) {
						debug(req.method, req.url, req.originalUrl);
						req.model = JSON.parse(reqModel);
						if (conf.intercept) {
							conf.intercept(req, res, next);
						} else {
							next();
						}
					}).get(callback);
			};

			conf = routerConf(route(router), middleware);

			app.use(conf.base, router);

			debug('router::base - %s, controllers: %s', conf.base, conf.controllers);

			// dynamically include controllers
			loadModule(conf.controllers, function(controller) {
				if (typeof(controller) === 'function') {
					controller(router);
				}
			});

			router.use(conf.middleware);

			router.use(require(appconf.get('errors:path') || './errorHandler')(appconf));
		});
	}

};

	/**
		base
		middleware
		controllers
		intercept
	*/
function routerConf(opt, middleware) {
	if (typeof opt === 'string') {
		opt = {base: opt};
	} else {
		opt = opt || {};
		opt.base = opt.base || '/';
	}
	opt.middleware = opt.middleware || middleware;
	return opt;
}

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
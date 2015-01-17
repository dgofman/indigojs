'use strict';

var debug = require('debug')('indigo:routers'),
	express = require('express'),
	fs = require('fs');

/**
 * Router class handling any HTTP request starting from the route base name.
 * @mixin libs/routers
 */
var routers = {

	/**
	 * Description
	 * @method init
	 * @param {} app
	 * @param {} appconf
	 * @param {} reqModel
	 * @return 
	 */
	init: function(app, appconf, reqModel) {

		// dynamically include routers
		var middleware = require('./middleware')(appconf),
			routersDir = appconf.get('routers');
		if (!routersDir) {
			routersDir =  ['/routers'];
		}

		debug('router::routersDir', routersDir);

		routers.loadModule(routersDir, function(route) {
			var router = express.Router(),
				conf = {};

			Object.defineProperty(router, 'conf', {
				/**
				 * Description
				 * @method get
				 * @return conf
				 */
				get: function() { return conf; },
				enumerable: true
			});

			/**
			 * Description
			 * @method get
			 * @param {} path
			 * @param {} callback
			 * @return 
			 */
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

			conf = routers.routerConf(route(router, app), middleware);

			app.use(conf.base, router);

			debug('router::base - %s, controllers: %s', conf.base, conf.controllers);

			// dynamically include controllers
			routers.loadModule(conf.controllers, function(controller) {
				controller(router);
			});

			router.use(conf.middleware);

			router.use(require(appconf.get('errors:path') || './errorHandler')(appconf));
		});
	}
};

	/**
 * base
 * middleware
 * controllers
 * intercept
 *
 * @method routerConf
 * @param {} opt
 * @param {} middleware
 * @return opt
 */
routers.routerConf = function(opt, middleware) {
	if (typeof opt === 'string') {
		opt = {base: opt};
	} else {
		opt = opt || {};
		opt.base = opt.base || '/';
	}
	opt.middleware = opt.middleware || middleware;
	return opt;
};

/**
 * Description
 * @method loadModule
 * @param {} dirs
 * @param {} callback
 * @return 
 */
routers.loadModule = function(dirs, callback) { 
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
};

/**
 * @module libs/routers
 * @see {@link libs/routers}
 */
module.exports = routers;
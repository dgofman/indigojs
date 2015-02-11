'use strict';

var debug = require('debug')('indigo:routers'),
	express = require('express'),
	fs = require('fs');

/**
 * Router class handling any HTTP request starting from the route base path.
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/routers
 */
var routers = 
	/** @lends libs/routers.prototype */
	{
	/**
	 * Initializing location of routers directory defined in <code>app.json</code> configuration file.
	 *
	 * @example
	 * conf/app.json 
	 *{
	 *	...
	 *	"routers": [
	 *		"/src/routers"
	 *	]
	 *	...
	 *}
	 *
	 * @param {Object} appconf JSON object represents application configuration.
	 * @param {Object} [reqModel] Reference to {@link libs/reqmodel} object what will be assign to <code>req.model</code> for each router request.
	 * @param {express} [app] Instance of the application server.
	 */
	init: function(appconf, reqModel, app) {

		this.moduleDir = __appDir + (appconf.get('server:moduleDir') || '');
		this.moduleWebDir = this.moduleDir + appconf.get('server:webdir');

		var indigo = global.__indigo;

		if (!reqModel) {
			reqModel = JSON.stringify(indigo.libs('reqmodel')(appconf));
		}

		if (!app) {
			app = indigo.app;
		}

		// dynamically include routers
		var middleware = require('./middleware')(appconf),
			routersDir = appconf.get('routers'),
			/**
			 * @memberOf sourceloader
			 * @alias routers.js#errorHandler
			 */
			errorHandler = require(appconf.get('errors:path') || './errorHandler');

		if (!routersDir) {
			routersDir =  ['/routers'];
		}

		debug('router::routersDir', routersDir);

		routers.loadModule(appconf, routersDir, function(route) {
			var router = express.Router(),
				conf = {};

			Object.defineProperty(router, 'conf', {
				get: function() { return conf; },
				enumerable: true
			});

			var requestHook = function(method) {
				return function(path, callback) {
					router.route(path)
						.all(function(req, res, next) {
							debug(req.method, req.url, req.originalUrl);
							req.moduleWebDir =  function() {
								return routers.moduleWebDir;
							};
							if (conf.methods[method]) { //include default model into req.model
								req.model = JSON.parse(reqModel);
								req.model.routerBase = conf.base;
								if (conf.intercept) {
									conf.intercept(req, res, next);
								} else {
									next();
								}
							} else {
								next();
							}
						})[method](callback);
				};
			};

			router.get = requestHook('get');
			router.post = requestHook('post');
			router.put = requestHook('put');
			router.delete = requestHook('delete');
			router.patch = requestHook('patch');

			conf = routers.routerConf(middleware, route(router, app));

			app.use(conf.base, router);

			debug('router::base - %s, controllers: %s', conf.base, conf.controllers);

			// dynamically include controllers
			routers.loadModule(appconf, conf.controllers, function(controller) {
				controller(router);
			});

			router.use(conf.middleware);

			router.use(errorHandler(appconf));
		});
	}
};

/**
 * This function evaluates the router configuration and initializes routing rules.
 * A router isolates the requests from the client by a route path. The main parameter from the router 
 * instances is <code>base</code> name. For handling all routing requests in the same class we may return 
 * just name (Example 1).
 *
 * Each router path may extend implementation of the the business logic in the multiple controllers.
 * What helps to reduce numbers of lines in the same file. For this reason we need to specify the path into 
 * controllers directories (Example 2).
 *
 * IndigoJS routers process five sequential phases 
 * <code>derivation/interception/implementation/middleware/integration</code>. For the security reasons indogoJS 
 * protects access to <code>derivation</code> and <code>integration</code> phases. The router may handle and 
 * prevent propagation to the next phase starting from <code>interception</code> phase (Example 3).
 *
 * The next phase <code>implementation</code> resolves in router/controller (Example 4).
 *
 * The <code>middleware</code> phase usually handles all requests to the static resourses (Example 5).
 *
 * @example
 * Example 1
 *
 * module.exports = function(router) {
 *	return '/account';
 *};
 *
 * module.exports = function(router) {
 *	return {
 *		'base': '/account'
 *	};
 *};
 *
 * @example
 * Example 2
 *
 * module.exports = function(router) {
 *	return {
 *		'base': '/account',
 *		'controllers': [
 *			'/src/controllers',
 *			'/src/account/controllers'
 *		]
 *	};
 *};
 *
 * @example
 * Example 3
 *
 * module.exports = function() {
 * 	return {
 * 		'base' : '/account',
 * 		'intercept': function(req, res, next) {
 * 			//prevent router and controllers receiving POST requests
 * 			if (req.method !== 'POST') {
 * 				next();
 * 			}
 * 		}
 * 	}
 * };
 *
 * @example
 * Example 4
 *
 * module.exports = function() {
 * 	router.get('/login', function(req, res) {
 * 		indigo.render(req, res, '/login.html');
 * 	});
 * };
 *
 * @example
 * Example 5
 *
 * module.exports = function() {
 * 	return {
 * 		'base' : '/account',
 * 		'middleware': function(req, res, next) {
 * 			next();
 * 		}
 * 	}
 * };
 *
 * @see {@link http://expressjs.com/starter/basic-routing.html}
 * @see {@link http://expressjs.com/guide/using-middleware.html}
 *
 * @memberof libs/routers.prototype
 * @alias routerConf
 *
 * @param {Object} middleware Reference to {@link libs/middleware} module.
 * @param {Object|String} [opt] Return configuration parameters from the router class. 
 * In case of <code>opt</code> is undefined the default router pass will assign to root '/route' or you 
 * can override by returning base name as string or an object <code>{base:'/myroute'}</code>
 * @return {Object} conf New router configuration object.
 */
routers.routerConf = function(middleware, opt) {
	var conf = opt || {};
	if (typeof opt === 'string') {
		conf = {base: opt};
	} else {
		conf.base = conf.base || '/route';
	}
	conf.methods = conf.methods || {'get': true};
	conf.middleware = conf.middleware || middleware;
	return conf;
};

/**
 * This function verifying and loading routers and controllers.
 * @memberof libs/routers.prototype
 * @alias loadModule
 * @param {Object} appconf JSON object represents application configuration.
 * @param {Array} dirs List of directories with javascript files.
 * @param {Function} callback Returns loaded module to the function handler.
 */
routers.loadModule = function(appconf, dirs, callback) {
	for (var index in dirs) {
		var dir = this.moduleDir + dirs[index];
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
 * @module routers
 * @see {@link libs/routers}
 */
module.exports = routers;
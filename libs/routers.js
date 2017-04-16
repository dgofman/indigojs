'use strict';

const indigo = global.__indigo,
	debug = require('debug')('indigo:routers'),
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
const routers = 
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
	 * @param Object appconf JSON object represents application configuration.
	 * @param {Object} [locales] Reference to <code>/lib/locales</code>.
	 * @param {Object} [reqModel] Reference to {@link libs/reqmodel} object what will be assign to <code>req.model</code> for each router request.
	 */
	init(appconf, locales, reqModel) {
		const indigo = global.__indigo,
			app = indigo.app;
		locales = locales || indigo.locales;
		reqModel = reqModel || indigo.reqModel;

		this.moduleDir = __appDir + (appconf.get('server:moduleDir') || '');
		this.moduleWebDir = this.moduleDir + appconf.get('server:webdir');

		// dynamically include routers
		let routersDir = appconf.get('routers'),
			requestHook = (method, router) => (path, callback) => {
				router.route(path)
					.all((req, res, next) => {
						debug(req.method, req.url, req.originalUrl);
						req.moduleWebDir = router.moduleWebDir;
						reqModel(req, res, next);
					})[method](callback);
			};


		if (!routersDir) {
			routersDir =  ['/routers'];
		}

		debug('router::routersDir', routersDir);

		routers.loadModule(routersDir, route => {
			const router = express.Router();

			router.moduleWebDir = () =>  routers.moduleWebDir;

			Object.defineProperty(router, 'conf', {
				get() { return conf; },
				enumerable: true
			});

			router.get = requestHook('get', router);
			router.post = requestHook('post', router);
			router.put = requestHook('put', router);
			router.delete = requestHook('delete', router);
			router.patch = requestHook('patch', router);

			const conf = routers.routerConf(route(router, app, locales));

			app.use(conf.base, router);

			debug('router::base - %s, controllers: %s', conf.base, conf.controllers);

			// dynamically include controllers
			routers.loadModule(conf.controllers, controller => {
				controller(router, app, locales);
			});

			if (typeof conf.middleware === 'function') {
				router.use(conf.middleware);
			}

			router.use(indigo.errorHandler.render);
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
 * @param {Object|String} [opt] Return configuration parameters from the router class. 
 * In case of <code>opt</code> is undefined the default router pass will assign to root '/route' or you 
 * can override by returning base name as string or an object <code>{base:'/myroute'}</code>
 * @return {Object} conf New router configuration object.
 */
routers.routerConf = opt => {
	let conf = opt || {};
	if (typeof opt === 'string') {
		conf = {base: opt};
	} else {
		conf.base = conf.base || '';
	}
	return conf;
};

/**
 * This function verifying and loading routers and controllers.
 * @memberof libs/routers.prototype
 * @alias loadModule
 * @param {Array} list List of directories or files.
 * @param {Function} callback Returns loaded module to the function handler.
 */
routers.loadModule = function(list, callback) {
	for (let index in list) {
		const path = this.moduleDir + list[index];
		if (fs.existsSync(path)) {
			debug('router::dir - %s', path);
			if (fs.lstatSync(path).isDirectory()) {
				fs.readdirSync(path).forEach((file) => {
					if(file.substr(-3) === '.js') {
						loadModule(`${path}/`, file.split('.')[0], callback);
					}
				});
			} else {
				debug('router::file - %s', path);
				loadModule('', path, callback);
			}
		}
	}
};

/**
 * Loading JavaScript modules.
 * @param {String} dir Directory path.
 * @param {String} file File name.
 * @param {Function} callback Returns loaded module to the function handler.
 * @private
 */
const loadModule = (dir, file, callback) => {
	try {
		callback(require(dir + file));
	} catch (e) {
		indigo.logger.error('Cannot loading \'%s\' :', dir + file, e);
	}
};

/**
 * @module routers
 * @see {@link libs/routers}
 */
module.exports = routers;

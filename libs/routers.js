'use strict';

const indigo = global.__indigo,
	debug = require('debug')('indigo:routers'),
	express = require('express'),
	fs = require('fs');

/**
 * Router class handling HTTP requests from the root path.
 *
 * @version 1.0
 *
 * @see https://www.npmjs.com/package/express
 *
 * @module
 * @mixin libs/routers
 */
const routers = 
	/** @lends libs/routers.prototype */
	{
	/**
	 * Initializing location of the routers directory defined in the <code>app.json</code> configuration file.
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
	 * @param {Object} [reqModel] Reference to {@link libs/reqmodel} object that will be assigned to <code>req.model</code> for each router request.
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

			// dynamically include the controllers
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
 * The router isolates requests from the client by using a route path. The main parameter from the router 
 * instances is the <code>base</code> name. To handle all routing requests in the same class we can return 
 * just the name (Example 1).
 *
 * Each router path may extend implementation of the business logic via multiple controllers.
 * What helps to reduce numbers of lines in the same file. For this reason we need to specify the path into 
 * controllers directories (Example 2).
 *
 * IndigoJS routers process five sequential phases :
   1. <code>derivation</code>
   2. <code>interception</code>
   3. <code>implementation</code>
   4. <code>middleware</code>
   5. <code>integration</code> 

   For security reasons indigoJS protects access to the <code>derivation</code> and <code>integration</code> phases. The router may handle and 
 * prevent propagation to the following phases (Example 3).
 *
 * The <code>implementation</code> phases is resolved in the router/controller (Example 4).
 *
 * The <code>middleware</code> phase typically handles all requests to the static resourses (Example 5).
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
 * In the case that <code>opt</code> is undefined, the default router pass will be assigned to root '/route' or 
 * can be overridden by returning the base name as a string or object <code>{base:'/myroute'}</code>
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
 * This function verifies and loads routers and controllers.
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
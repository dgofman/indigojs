'use strict';

const debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs');

var reqModel, http,
	routers, errorHandler,
	webdir, logger, locales;

/**
 * indigoJS is the simplest localization and templating framework running on node platform.
 *
 * indigoJS is a flexible library, allowing multiple configurations from 
 * the JSON file. By default indigoJS assigns a server port number from a system environment
 * <code>process.env.INDIGO_PORT</code> if this varible is not defined on the host server, indigoJS reads
 * the server properties from the JSON file. 
 *
 * The <code>cache</code> property sets the header cache value for static files (in the seconds). 
 * By assigning it to zero it will prevent browser from caching.
 *
 * The property <code>webdir</code> specifies path to the all web static resources.
 *
 * By defining the <code>environment</code> variable as <code>prod</code> indigo including a minifying version of
 * the static resources (*.min.js, *.min.css, compressed less) that simulates file output in deployed server, by
 * default the value set's to <code>dev</code>.
 *
 * @example
 * conf/app.json 
 *{
 *	"server": {
 *		"port": 8585,
 *		"cache": 86400,
 *		"webdir": "/examples/account/web",
 *		...
 *	},
 *	"environment": "dev"
 *	...
 *}
 *
 * @version 1.0
 *
 * @module
 * @mixin indigo
 */
const indigo = 
	/** @lends indigo.prototype */
	{

	/**
	 * Creating <code>appconf</code> object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Return reference to the configuration object.
	 */
	getAppConf(appconf) {
		if (typeof(appconf) === 'string') { //path to app.json
			debug('indigo.init appconf - %s', appconf);
			if (appconf.indexOf('.json') === -1) {
				const env = (process.env.CONFIG_ENV || '').toLowerCase().trim();
				if (fs.existsSync(appconf + '-' + env + '.json')) {
					appconf += '-' + env + '.json';
				} else {
					appconf += '.json';
				}
			}

			appconf = require('cjson').load(appconf);
		}

		appconf.environment = appconf.environment  || 'dev';

		appconf.get = function(path) {
			let value = this,
				keys = path.split(':');
			for (let i = 0; i < keys.length; i++) {
				if (value) {
					value = value[keys[i]];
				}
			}
			return value;
		};

		return appconf;
	},

	/**
	 * Initialization of module members by using JSON configuration object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Return reference to the  configuration object.
	 */
	init(appconf) {
		/**
		 * JSON object represents application configuration.
		 * @memberof indigo
		 * @alias appconf
		 * @type {Object}
		 */
		this.appconf = appconf = this.getAppConf(appconf);

		webdir = __appDir + appconf.get('server:webdir');

		this.app = express();

		/**
		 * Reference to <code>libs/locales</code>.
		 * @memberof indigo
		 * @alias locales
		 * @type {Object}
		 */
		this.locales = locales = require('./libs/locales')();

		/**
		 * Reference to logging API's.
		 * @memberof indigo
		 * @alias logger
		 * @type {Object}
		 */
		this.logger = logger = require(this.appconfPath('logger:path') || './libs/logger')(appconf);
		
		this.reqModel = reqModel = require(this.appconfPath('server:reqmodel:path') || './libs/reqmodel')(appconf, this.app);

		this.errorHandler = errorHandler = require(this.appconfPath('errors:path') || './libs/errorHandler')();

		routers = require('./libs/routers');

		const service = require(this.appconfPath('service:path') || './libs/rest')();

		/**
		 * Reference to REST-based api.
		 * @memberof indigo
		 * @alias service
		 * @type {Object}
		 */
		if (!this.service) {
			Object.defineProperty(this, 'service', {
				get() { return Object.create(service).init(appconf.get('service')); },
				enumerable: true
			});
		}

		this.portNumber = Number(process.env.INDIGO_PORT || appconf.get('server:port'));

		locales.config(appconf); //initialize locales
		locales.monitor(appconf); //check file changes

		return appconf;
	},

	/**
	 * Starting a server. It is called after the init method.
	 * @example
	 * require('indigojs').start(__dirname + '/config/app.json', 
	 *	function(http, app) { //before
	 *	},
	 *	function(http, app) { //after
	 *	}
	 * });
	 *
	 * @example
	 * require('indigojs').start({server:80, webdir:"/web"});
	 *
	 * @param {JSON|String} appconf Path to the app.json file or application configuration object.
	 * @param {Function} [before] Callback function before starting http server.
	 * @param {Function} [after] Callback function after server started.
	 */
	start(appconf, before, after) {

		if (typeof appconf === 'string' || !this.app) { 
			appconf = this.init(appconf);
		}

		const app = this.app;

		this.static('/', webdir);

		this.static(this.getStaticDir(), webdir + '/static');

		this.addRoute(appconf, locales, reqModel);

		this.getModuleWebDir = getModuleWebDir;

		require('./libs/component')(app);

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsInject
		 */
		app.locals.inject = (req, url) => {
			debug(req.method, url);
			const newUrl = indigo.getNewURL(req, null, `/${req.session.locale}/${url}`, `/${url}`);
			debug('inject: %s -> %s', url, newUrl);
			try {
				req.model.filename = getModuleWebDir(req) + newUrl;
				req.model.locale = app.locals.locale; //deprecated v2.x
				req.model.inject = app.locals.inject; //deprecated v2.x
				return ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model);
			} catch(err) {
				indigo.logger.error(`Invalid file name: ${newUrl}`);
				indigo.logger.error(err);
				return errorHandler.injectErrorHandler(err, req, url).message;
			}
		};

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsLocale
		 */
		app.locals.locale = function(req, localeKey, ...args) {
			let locales = indigo.getLocale(req),
				rest = [];
			localeKey.split('.').forEach((name) => {
				locales = locales[name];
			});
			return indigo.substitute(locales, args);
		};

		errorHandler.notFound(app);

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', ejs.__express);

		// Set the folder where the pages are kept
		app.set('views', webdir);

		/**
		 * Reference to HTTP server.
		 * @memberof indigo
		 * @alias logger
		 * @type {Object}
		 */
		indigo.http = http = require('http').createServer(app);

		const modules = appconf.get('modules');
		for (let index in modules) {
			try {
				require(modules[index]).init();
			} catch (e) {}
		}

		if (before) {
			before(http, app);
		}

		http.listen(indigo.portNumber, () => {
			logger.info('Server is running on port %s', indigo.portNumber);
			if (after) {
				after(http, app);
			}
		});
	},

	/**
	 * Register application routes
	 * @param {Object} appconf JSON object represents application configuration.
	 * @param {Object} [locales] Reference to <code>/lib/locales</code>.
	 * @param {Object} [reqModel] Reference to {@link libs/reqmodel} object what will be assign to <code>req.model</code> for each router request.
	 */
	addRoute(appconf, locales, reqModel) {
		routers.init(appconf, locales, reqModel);
	},

	/**
	 * Substitutes "{n}" tokens within the specified string with the respective arguments passed in.
	 * @param {String} str The string to make substitutions in. This string can contain special tokens of the form {n}, where n is a zero based index, that will be replaced with the additional parameters found at that index if specified.
	 * @param {String} rest — Additional parameters that can be substituted in the str parameter at each {n} location, where n is an integer (zero based) index value into the array of values specified.
	 */
	substitute(str, rest) {
		if (str) {
			rest.forEach((value, index) => {
				str = str.replace(new RegExp('\\{' + index + '\\}', 'g'), value);
			});
		}
		return str || '';
	},

	/**
	 * Explicitly closing http server by using unittests.
	 * @param {Function} done Callback function executing after services are terminated.
	 */
	close(done) {
		http.close(done);
	},

	/**
	 * Rendering HTML templates.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} fileName Name of HTML file under application web directory.
	 * @param {Object} [locales] Reference to the object with localization values.
	 */
	render(req, res, fileName, locales) {
		const next = () => {
			req.model.locales = locales || indigo.getLocale(req);
			req.model.req = req;

			if (fileName.indexOf('.') === -1) {
				fileName += '.html'; //attach default HTML extension
			}

			const newUrl = indigo.getNewURL(req, res, '/' + req.session.locale + fileName,  fileName);
			debug('render: %s -> %s', req.url, newUrl);

			fileName = getModuleWebDir(req) + newUrl;
			res.setHeader && res.setHeader('lang', req.model.locality.langugage);
			if (!fs.existsSync(fileName)) {
				res.status(404);
				res.setHeader && res.setHeader('path', fileName);
			}

			res.render(fileName, req.model, (err, result) => {
				if (err) {
					indigo.error(err, req, res);
				} else {
					res.send(result);
				}
			});
		};

		if (!req.model || !req.model.__initialized__) {
			req.model = reqModel(null, req, res, next);
		} else {
			next();
		}
	},

	/**
	 * Return path to the custom module.
	 * @param {String} key The property name/path defined in configuration file.
	 * @return {String} path Absolute path to the file from the current project directory.
	 */
	appconfPath(key) {
		const path = this.appconf.get(key);
		return path ? __appDir + path : null;
	},

	/**
	 * Return object with key/value pair when values will be localized base on client locale request.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {String} [keyName='locale'] Customize <code>req.params</code> key name refering to locale code.
	 * @return {Object} locale Collection of localization messages.
	 */
	getLocale(req, keyName) {
		req.params = req.params || {};
		return locales.init(req, req.params[keyName || 'locale']);
	},

	/**
	 * Return path to application webroot directory.
	 * @return {String} webdir Absolute path to webroot directory.
	 */
	getWebDir() {
		return webdir;
	},

	/**
	 * Return path to web/static directory defined in app.conf file.
	 * @return {String} Web path to static directory.
	 */
	getStaticDir() {
		return this.appconf.get('server:staticDir') || '/static';
	},

	/**
	 * Return base path to component assets.
	 * @return {String} Web path to component less and js files.
	 */
	getComponentURL() {
		return this.appconf.get('server:componentUri') || '/components';
	},

	/**
	 * Return HTML component tag.
	 * @return {String} HTML component tag.
	 */
	getComponentTag() {
		return this.appconf.get('server:componentTag') || 'c';
	},

	/**
	 * Return value from system environment or package.json
	 * @param {String} key Pair key.
	 * @return {String} Pair value.
	 */
	getEnv(key) {
		return process.env[key] || process.env['npm_package_config_' + key];
	},

	/**
	 * Return command line arguments
	 * @return {Object} Pair key and value.
	 */
	getArgs() {
		const args = {};
		for (let i in process.argv) {
			const pair = process.argv[i].split('=');
			if (pair.length === 2) {
				args[pair[0]] = pair[1];
			}
		}
		return args;
	},

	/**
	 * Verify path to existing file in application web directory based of locale rule in <code>libs/locales/accept-rules.json</code>.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} url Client request to the locale file. 
	 * @param {String} [redirectURL] Redirect URL in case <code>url</code> could not verify.
	 * @return {String} url New URL base on web appllication directory defined in locale dependencies.
	 */
	getNewURL(req, res, url, redirectURL) {
		const dir = getModuleWebDir(req);

		if (!req.session.locale) {
			indigo.getLocale(req);
		}

		if (!fs.existsSync(dir + url) && 
			url.indexOf('/' + req.session.locale +'/') !== -1) { //try to get file from another locale directory
			debug('getNewURL=%s locale=%s lookup=%s', url, req.session.locale, req.session.localeLookup);
			for (let index in req.session.localeLookup) {
				const newUrl = url.replace('/' + req.session.locale + '/', '/' + req.session.localeLookup[index] + '/');
				if (fs.existsSync(dir + newUrl)) {
					res && res.setHeader && res.setHeader('Referer', newUrl);
					return newUrl;
				}
			}
		}
		if (!fs.existsSync(dir + url)) {
			url = redirectURL || req.url || url;
		}
		return url;
	},

	/**
	 * Reference to debugging utility.
	 * @memberof indigo
	 * @alias debug
	 * @type {Function}
	 */
	debug: require('debug'),

	/**
	 * Import a module under <code>libs</code> directory.
	 * @param {String} module File name.
	 * @return {Object} module.
	 */
	libs(module) {
		return require('./libs/' + module);
	},

	/**
	 * Include Express directory handler.
	 * @param {String} path URI path.
	 * @param {String} webdir Absolute path to the web directory.
	 */
	static(path, webdir) {
		this.app.use(path, express.static(webdir));
	},

	/**
	 * Render an error template.
	 * @param {Object} err Contains information about errors.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 */
	error(err, req, res) {
		try {
			errorHandler.render(err, req, res, () => {
				res.status(400).json(null); //no errors
			});
		} catch (e) {
			indigo.logger.error(e);
		}
	}
};

/**
 * Return path of the current plugin/module webroot directory.
 * @param {express.Request} req Defines an object to provide client request information.
 * @return {String} webdir Absolute path to module webroot directory.
 */
function getModuleWebDir(req) {
	return req && req.moduleWebDir ? req.moduleWebDir() : indigo.getWebDir();
}

/**
 * Global variable defined absolute path to application directory.
 * @global
 * @alias __appDir
 * @type {String}
 */
global.__appDir = process.cwd();

/**
 * Global instance to the <code>indigo</code> module.
 * @global
 * @alias __indigo
 * @type {Object}
 */
/* istanbul ignore next */
if (!global.__indigo) {
	global.__indigo = indigo;
}

debug('__appDir: %s', __appDir);

/**
 * @module indigo
 * @see {@link indigo}
 *
 * @author David Gofman <dgofman@gmail.com>
 * @license MIT License {@link http://opensource.org/licenses/mit-license.php}
 */
module.exports = indigo;
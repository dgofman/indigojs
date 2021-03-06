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
 * the JSON file. By default, indigoJS assigns a server port number from a system environment
 * <code>process.env.INDIGO_PORT</code>. If this varible is not defined on the host server, indigoJS reads
 * the server properties from the JSON file. 
 *
 * The <code>cache</code> property sets the header cache value for static files (in seconds). 
 * Assigning it to zero it will prevent the browser from caching.
 *
 * The <code>webdir</code> property specifies the path to all web resources.
 *
 * When defining the <code>environment</code> variable as <code>prod</code>, indigoJS includes a minified version of
 * the static resources (*.min.js, *.min.css, compressed less) that simulates file output in the deployed server. The value is set to <code>dev</code> by default.
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
	 * Determines minimum supported version.
	 * @param {String} version Minimum supported version.
	 * @return {Class} this Returns class instance.
	 */
	min_version(version) {
		let current_version = require('./package.json').version,
			cv = 0, uv = 0;
			current_version.split('.').map((n, i) => {
				cv += Number(n) * Math.pow(10, 9 - (i * 3));
			});
			version.split('.').map((n, i) => {
				uv += Number(n) * Math.pow(10, 9 - (i * 3));
			});
		if (cv < uv) {
			throw new Error(`IndigoJS unsupported minor version ${current_version}. Please run "npm install" command.`);
		}
		return this;
	},

	/**
	 * Creates <code>appconf</code> object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Returns reference to the configuration object.
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
	 * Initializes module members by using the JSON configuration object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Returns reference to the configuration object.
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

		this.getModuleWebDir = getModuleWebDir;

		routers = require('./libs/routers');

		const service = require(this.appconfPath('service:path') || './libs/rest')();

		/**
		 * Reference to REST-based API.
		 * @memberof indigo
		 * @alias service
		 * @type {Object}
		 */
		Object.defineProperty(this, 'service', {
			get() { return Object.create(service).init(appconf.get('service')); },
			configurable: true,
			enumerable: true
		});

		this.portNumber = Number(process.env.INDIGO_PORT || appconf.get('server:port'));

		locales.config(appconf); //initializes locales
		locales.monitor(appconf); //checks for file changes

		return appconf;
	},

	/**
	 * Starts a server. This method is called after the init method has been executed.
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
	 * @param {Function} [before] Callback function which is executed prior before starting http server.
	 * @param {Function} [after] Callback function which is executed after the server has been started.
	 */
	start(appconf, before, after) {

		if (typeof appconf === 'string' || !this.app) { 
			appconf = this.init(appconf);
		}

		const app = this.app;

		this.static('/', webdir);

		this.static(this.getStaticDir(), webdir + '/static');

		this.addRoute(appconf, locales, reqModel);

		require('./libs/component')(app);

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsInject
		 */
		app.locals.inject = (req, url) => {
			debug(req.method, url);
			const newUrl = indigo.getNewURL(req, null, url);
			debug('inject: %s -> %s', url, newUrl);
			try {
				req.model.req = req;
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
		app.locals.locale = (req, localeKey, ...rest) => {
			let locales = indigo.getLocale(req);
			localeKey.split('.').forEach((name) => {
				locales = locales[name];
			});
			return indigo.substitute(locales, rest);
		};

		errorHandler.notFound(app);

		// Uses the .html extension instead of
		// naming the views as *.ejs
		app.engine('.html', ejs.__express);

		// Sets the folder where view pages are kept
		app.set('views', webdir);

		/**
		 * Reference to HTTP server.
		 * @memberof indigo
		 * @alias http
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
	 * @param {Object} appconf JSON object which represents the application configuration.
	 * @param {Module} [locales] Reference to <code>/lib/locales</code>.
	 * @param {Module} [reqModel] Reference to {@link libs/reqmodel} object which will be assigned to <code>req.model</code> for each router request.
	 */
	addRoute(appconf, locales, reqModel) {
		routers.init(appconf, locales, reqModel);
	},

	/**
	 * Substitutes "{n}" tokens within the specified string with the respective arguments passed in.
	 * @param {String} str The string to make substitutions in. This string can contain special tokens of the form {n}, where n is a zero based index, that will be replaced with the additional parameters found at that index if specified.
	 * @param {Array} rest Additional parameters that can be substituted in the str parameter at each {n} location, where n is an integer (zero based) index value in the array of values specified.
	 * @return {String} str New string with all of the {n} tokens replaced with the respective arguments specified.
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
	 * Explicitly closes http server by using unit tests.
	 * @param {Function} done Callback function which executes after services are terminated.
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
	render(req, res, fileName) {
		if (fileName.indexOf('.') === -1) {
			fileName += '.html'; //attaches default HTML extension
		}

		const newUrl = indigo.getNewURL(req, res, fileName);
		debug('render: %s -> %s', fileName, newUrl);

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
	},

	/**
	 * Returns path to the custom module.
	 * @param {String} key The property name/path defined in configuration file.
	 * @return {String} path Absolute path to the file from the current project directory.
	 */
	appconfPath(key) {
		const path = this.appconf.get(key);
		return path ? __appDir + path : null;
	},

	/**
	 * Returns object with key/value pair when values will be localized based on client locale request.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {String} [keyName='locale'] Customizes <code>req.params</code> key name referring to locale code.
	 * @return {Object} locale Collection of localization messages.
	 */
	getLocale(req, keyName) {
		req.params = req.params || {};
		return locales.routeLocale(req, req.params[keyName || 'locale']);
	},

	/**
	 * Returns the path to the application webroot directory.
	 * @return {String} webdir Absolute path to webroot directory.
	 */
	getWebDir() {
		return webdir;
	},

	/**
	 * Returns path to the web/static directory defined in app.conf file.
	 * @return {String} path Web path to static directory.
	 */
	getStaticDir() {
		return this.appconf.get('server:staticDir') || '/static';
	},

	/**
	 * Returns the absolute path to the grunt-compiled directory.
	 * @return {String} path The target directory name.
	 */
	getBuildPath() {
		return __appDir + (this.appconf.get('server:buildPath') || '/build');
	},

	/**
	 * Returns base path to the component assets.
	 * @return {String} path Web path to component less and js files.
	 */
	getComponentPath() {
		return this.appconf.get('server:componentPath') || '/components';
	},

	/**
	 * Returns HTML component tag.
	 * @return {String} HTML component tag.
	 */
	getComponentTag() {
		return this.appconf.get('server:componentTag') || 'c';
	},

	/**
	 * Returns value from the system environment or package.json
	 * @param {String} key Pair key.
	 * @return {String} value Environment name.
	 */
	getEnv(key) {
		return process.env[key] || process.env['npm_package_config_' + key];
	},

	/**
	 * Returns command line arguments
	 * @return {Object} Pair key and value pair.
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
	 * Verifies the path to the existing file in the web application's directory based on locale rules in <code>libs/locales/accept-rules.json</code>.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} url Client request to the locale file. 
	 * @return {String} url New URL based on web appllication directory defined in locale dependencies.
	 */
	getNewURL(req, res, url) {
		if (url.charAt(0) !== '/') {
			url = `/${url}`;
		}

		indigo.getLocale(req);

		let dir = getModuleWebDir(req),
			newURL = `/${req.model.locality.locale}${url}`;

		debug('getNewURL=%s locale=%s lookup=%s', url, req.model.locality.locale, req.model.locality.localeLookup);

		if (fs.existsSync(dir + newURL)) {
			return newURL;
		}

		for (let index in req.model.locality.localeLookup) {
			newURL = `/${req.model.locality.localeLookup[index]}${url}`;
			if (fs.existsSync(dir + newURL)) {
				res && res.setHeader && res.setHeader('Referer', newURL);
				return newURL;
			}
		}

		if (!fs.existsSync(dir + url) && req.url) {
			return req.url;
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
	 * Imports a module under <code>libs</code> directory.
	 * @param {String} module File name.
	 * @return {Module} module. The module definition under <code>libs</code> directory.
	 */
	libs(module) {
		return require(`./libs/${module}`);
	},

	/**
	 * Includes Express directory handler.
	 * @param {String} path URI path.
	 * @param {String} webdir Absolute path to the web directory.
	 */
	static(path, webdir) {
		this.app.use(path, express.static(webdir));
	},

	/**
	 * Renders an error template.
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
 * Returns path of the current plugin/module webroot directory.
 *
 * @memberof indigo
 *
 * @param {express.Request} req Defines an object to provide client request information.
 * @return {String} webdir Absolute path to module webroot directory.
 */
const getModuleWebDir = (req) => {
	return req && req.moduleWebDir ? req.moduleWebDir() : indigo.getWebDir();
};

/**
 * Global variable which defines an absolute path to the application directory.
 * @global
 * @alias __appDir
 * @type {String}
 *
 * @example
 * require(\`${__appDir}/indigojs\`);
 */
global.__appDir = process.cwd();

/**
 * Global instance of the <code>indigo</code> module.
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
'use strict';

var debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	routers = require('./libs/routers'),
	errorHandler = require('./libs/errorHandler');

var reqModel, http,
	webdir, portNumber,
	logger, locales;

/**
 * Global variable defined absolute path to application directory.
 * @global
 * @alias __appDir
 * @type {String}
 */
global.__appDir = process.cwd(); 

debug('__appDir: %s', __appDir);

/**
 * indigoJS is the simplest localization and templating framework running on node platform.
 *
 * indigoJS is a flexible library, allowing multiple configurations from 
 * the JSON file. By default indigoJS assigns a server port number from a system environment
 * <code>process.env.PORT</code> if this varible is not defined on the host server, indigoJS reads
 * the server properties from the JSON file. In case we would like to force, always start server on the port
 * defined in the <code>app.json</code> we should assign true value to the <code>force</code> property, by
 * default this field is ommited. 
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
 *		"force": true,
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
var indigo = 
	/** @lends indigo.prototype */
	{

	/**
	 * Creating <code>appconf</code> object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Return reference to the configuration object.
	 */
	getAppConf: function(appconf) {
		if (typeof(appconf) === 'string') { //path to app.json
			debug('indigo.init appconf - %s', appconf);
			appconf = require('cjson').load(appconf);
		}

		appconf.environment = appconf.environment  || 'dev';

		appconf.get = function(path) {
			var value = this,
				keys = path.split(':');
			for (var i = 0; i < keys.length; i++) {
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
	init: function(appconf) {
		/**
		 * JSON object represents application configuration.
		 * @memberof indigo
		 * @alias appconf
		 * @type {Object}
		 */
		this.appconf = appconf = this.getAppConf(appconf);

		webdir = __appDir + appconf.get('server:webdir');

		locales = require('./libs/locales');

		/**
		 * Reference to logging API's.
		 * @memberof indigo
		 * @alias logger
		 * @type {Object}
		 */
		this.logger = logger = require(appconf.get('logger:path') || './libs/logger')(appconf);
		/**
		 * Reference to debugging utility.
		 * @memberof indigo
		 * @alias debug
		 * @type {Function}
		 */
		this.debug = require('debug');

		var service = require(appconf.get('service:path') || './libs/rest')();

		/**
		 * Reference to REST-based api.
		 * @memberof indigo
		 * @alias service
		 * @type {Object}
		 */
		if (!this.service) {
			Object.defineProperty(this, 'service', {
				get: function() { return Object.create(service).init(); },
				enumerable: true
			});
		}

		reqModel = JSON.stringify(
				require(appconf.get('server:reqmodel:path') || './libs/reqmodel')(appconf));

		portNumber = process.env.PORT || appconf.get('server:port');
		if (appconf.get('server:force')) {
			portNumber = appconf.get('server:port');
		}

		locales.config(appconf); //initialize locales

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
	start: function(appconf, before, after) {

		appconf = this.init(appconf);

		var app = this.app = express();

		app.use(require(appconf.get('server:parser:path') || './libs/parser')(appconf)); //enabled req.body

		app.use(require(appconf.get('server:session:path') || './libs/session')(appconf)); //enabled req.session

		app.use('/', express.static(webdir));

		//http://localhost:8585/indigo/account/en/templates/login
		app.use('/indigo/:routerPath/:locale/templates/:pageId', function(req, res) {
			req.model = JSON.parse(reqModel);
			locales.init(req, req.params.locale);

			var url = '/' + req.session.locale + '/templates/' + req.params.routerPath + '/' + req.params.pageId + '.html',
				newUrl = indigo.getNewURL(req, res, url);
			debug('template: %s -> %s', url, newUrl);
			res.sendFile(webdir + newUrl);
		});

		routers.init(app, appconf, reqModel);

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsInject
		 */
		app.locals.inject = function(req, url) {
			debug(req.method, url);
			var newUrl = indigo.getNewURL(req, null, '/' + req.session.locale + '/' + url, '/' + url);
			debug('inject: %s -> %s', url, newUrl);
			try {
				req.model.filename = webdir + newUrl;
				return ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model);
			} catch(err) {
				return errorHandler.injectErrorHandler(err).message;
			}
		};

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

		if (before) {
			before(http, app);
		}

		http.listen(Number(portNumber), function() {
			logger.info('Server is running on port %s', portNumber);
			if (after) {
				after(http, app);
			}
		});
	},

	/**
	 * Explicitly closing http server by using unittests.
	 * @param {Function} done Callback function executing after services are terminated.
	 */
	close: function(done) {
		http.close(done);
	},

	/**
	 * Rendering HTML templates.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} fileName Name of HTML file under application web directory.
	 * @param {Object} [locales] Reference to the object with localization values.
	 */
	render: function(req, res, fileName, locales) {
		if (!req.model) {
			req.model = JSON.parse(reqModel);
		}

		req.model.locales = locales || indigo.getLocale(req);
		req.model.req = req;

		if (fileName.indexOf('.') === -1) {
			fileName += '.html'; //attach default HTML extension
		}
		var newUrl = indigo.getNewURL(req, res, '/' + req.session.locale + '/' + fileName, '/' + fileName);
		debug('render: %s -> %s', req.url, newUrl);

		fileName = webdir + newUrl;
		res.setHeader && res.setHeader('lang', req.model.locality.langugage);
		if (!fs.existsSync(fileName)) {
			res.status(404);
			res.setHeader && res.setHeader('path', fileName);
		}
		res.render(fileName, req.model);
	},

	/**
	 * Return object with key/value pair when values will be localized base on client locale request.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {String} [keyName='locale'] Customize <code>req.params</code> key name refering to locale code.
	 * @return {Object} locale Collection of localization messages.
	 */
	getLocale: function(req, keyName) {
		req.params = req.params || {};
		return locales.init(req, req.params[keyName || 'locale']);
	},

	/**
	 * Return path to application webroot directory.
	 * @return {String} webdir Absolute path to webroot directory.
	 */
	getWebDir: function() {
		return webdir;
	},

	/**
	 * Verify path to existing file in application web directory based of locale rule in <code>libs/locales/accept-rules.json</code>.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} url Client request to the locale file. 
	 * @param {String} [redirectURL] Redirect URL in case <code>url</code> could not verify.
	 * @return {String} url New URL base on web appllication directory defined in locale dependencies.
	 */
	getNewURL: function(req, res, url, redirectURL) {
		if (!req.session.locale) {
			indigo.getLocale(req);
		}

		if ( !fs.existsSync(webdir + url) && 
			url.indexOf('/' + req.session.locale +'/') !== -1) { //try to get file from another locale directory
			debug('getNewURL=%s locale=%s lookup=%s', url, req.session.locale, req.session.localeLookup);
			for (var index in req.session.localeLookup) {
				var newUrl = url.replace('/' + req.session.locale + '/', '/' + req.session.localeLookup[index] + '/');
				if (fs.existsSync(webdir + newUrl)) {
					res && res.setHeader && res.setHeader('Referer', newUrl);
					return newUrl;
				}
			}
		}
		if (!fs.existsSync(webdir + url)) {
			url = redirectURL || req.url || url;
		}
		return url;
	},

	/**
	 * Import a module under <code>libs</code> directory.
	 * @param {String} module File name.
	 * @return {Object} module.
	 */
	libs: function(module) {
		return require('./libs/' + module);
	}
};

/**
 * @module indigo
 * @see {@link indigo}
 *
 * @author David Gofman <dgofman@gmail.com>
 * @license MIT License {@link http://opensource.org/licenses/mit-license.php}
 */
module.exports = indigo;
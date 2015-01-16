'use strict';

var debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	routers = require('./libs/routers'),
	errorHandler = require('./libs/errorHandler');

var reqModel, http,
	appdir, portNumber,
	logger, locales;

/**
 * Absolute path to application directory.
 * @alias __appDir
 * @type {String}
 */
global.__appDir = process.cwd(); 

debug('__appDir: %s', __appDir);

/**
 * Main module.
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
	 * Initialization of module members by using JSON configuration object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf
	 */
	init: function(appconf) {
		if (typeof(appconf) === 'string') { //path to app.json
			debug('indigo.init appconf - %s', appconf);
			appconf = require('cjson').load(appconf);
		}

		/**
		 * JSON object represents application configuration.
		 * @memberof indigo
		 * @alias appconf
		 * @type {Object}
		 */
		this.appconf = appconf;

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

		appdir = __appDir + appconf.get('server:appdir');

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
		 * @alias logger
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

		portNumber = Number(process.env.PORT || appconf.get('server:port'));

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
	 * require('indigojs').start({server:80, appdir:"/web"});
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

		app.use('/', express.static(appdir));

		//http://localhost:8585/indigo/account/en/templates/login
		app.use('/indigo/:routerPath/:locale/templates/:pageId', function(req, res) {
			req.model = JSON.parse(reqModel);
			locales.init(req, req.params.locale);

			var url = '/' + req.session.locale + '/templates/' + req.params.routerPath + '/' + req.params.pageId + '.html',
				newUrl = indigo.getNewURL(req, res, url);
			debug('template: %s -> %s', url, newUrl);
			res.sendfile(appdir + newUrl);
		});

		routers.init(app, appconf, reqModel);

		app.locals.inject = function(req, url) {
			debug(req.method, url);
			var newUrl = indigo.getNewURL(req, null, '/' + req.session.locale + '/' + url, '/' + url);
			debug('inject: %s -> %s', url, newUrl);
			try {
				req.model.filename = appdir + newUrl;
				return ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model);
			} catch(err) {
				return errorHandler.injectErrorHandler(err).message;
			}
		};

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', ejs.__express);

		// Set the folder where the pages are kept
		app.set('views', appdir);

		// Start the server
		http = require('http').createServer(app);

		if (before) {
			before(http, app);
		}

		http.listen(portNumber, function() {
			logger.info('Server is running on port %s', portNumber);
			if (after) {
				after(http, app);
			}
		});
	},

	/**
	 * Explicitly closing http server using by unittests.
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

		req.model.locales = locales || indigo.getLocales(req);
		req.model.req = req;

		if (fileName.indexOf('.') === -1) {
			fileName += '.html'; //attach default HTML extension
		}
		var newUrl = indigo.getNewURL(req, res, '/' + req.session.locale + '/' + fileName, '/' + fileName);
		debug('render: %s -> %s', req.url, newUrl);

		fileName = appdir + newUrl;
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
	 * @param {String} [keyName] Customize <code>req.params</code> key name refering to locale code (default is 'locale').
	 * @return Object
	 */
	getLocales: function(req, keyName) {
		req.params = req.params || {};
		return locales.init(req, req.params[keyName || 'locale']);
	},

	/**
	 * Verify path to existing file in application web directory based of locale rule in <code>libs/locales/accept-rules.json</code>.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} url Client request to the locale file. 
	 * @param {String} [redirectURL] Redirect URL in case <code>url</code> could not verify.
	 * @return String
	 */
	getNewURL: function(req, res, url, redirectURL) {
		if (!req.session.locale) {
			indigo.getLocales(req);
		}

		if ( !fs.existsSync(appdir + url) && 
			url.indexOf('/' + req.session.locale +'/') !== -1) { //try to get file from another locale directory
			debug('getNewURL=%s locale=%s lookup=%s', url, req.session.locale, req.session.localeLookup);
			for (var index in req.session.localeLookup) {
				var newUrl = url.replace('/' + req.session.locale + '/', '/' + req.session.localeLookup[index] + '/');
				if (fs.existsSync(appdir + newUrl)) {
					res && res.setHeader && res.setHeader('Referer', newUrl);
					return newUrl;
				}
			}
		}
		if (!fs.existsSync(appdir + url)) {
			url = redirectURL || req.url || url;
		}
		return url;
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
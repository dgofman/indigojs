'use strict';

var debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	routers = require('./libs/routers'),
	errorHandler = require('./libs/errorHandler');

var reqModel, http,
	appdir, portNumber,
	logger, locales, indigo;

global.__appDir = process.cwd(); 

debug('__appDir: %s', __appDir);

module.exports = indigo = {

	init: function(appconf) {
		if (typeof(appconf) === 'string') { //path to app.json
			debug('indigo::init appconf - %s', appconf);
			appconf = require('cjson').load(appconf);
		}
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

		this.locales = locales = require('./libs/locales');
		this.logger = logger = require(appconf.get('logger:path') || './libs/logger')(appconf);
		this.debug = require('debug');

		var service = require(appconf.get('service:path') || './libs/rest')();

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

	start: function(appconf, before, after) {

		appconf = this.init(appconf);

		var app = this.app = express();

		app.use(require(appconf.get('server:parser:path') || './libs/parser')(appconf)); //enabled req.body

		app.use(require(appconf.get('server:session:path') || './libs/session')(appconf)); //enabled req.session

		app.use('/', express.static(appdir));

		//http://localhost:8585/indigo/account/ru/templates/login
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

	close: function(done) {
		http.close(done);
	},

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

	error: function(req, res, errorKey, errorCode) {
		var locales = indigo.getLocales(req);
		res.json(errorCode || 400, { error: locales.errors[errorKey] });
	},

	getLocales: function(req, paramName) {
		req.params = req.params || {};
		return locales.init(req, req.params[paramName || 'locale']);
	},

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
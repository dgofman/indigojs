'use strict';

var debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	routers = require('./libs/routers');

var reqModel, http,
	appdir, portNumber,
	logger, locales, indigo;

global.__appDir = process.cwd() + '/'; 

debug('__appDir: %s', __appDir);

module.exports = indigo = {

	init: function(nconf) {
		if (typeof(nconf) === 'string') { //path to app.json
			debug('indigo::init nconf - %s', nconf);
			nconf = require('nconf').
					use('file', { file: nconf });
		}

		appdir = __appDir + nconf.get('server:appdir');

		this.locales = locales = require('./libs/locales');
		this.logger = logger = require(nconf.get('logger:path') || './libs/logger')(nconf);
		this.debug = require('debug');

		var service = require(nconf.get('service:path') || './libs/rest')(nconf);

		if (!this.service) {
			Object.defineProperty(this, 'service', {
				get: function() { return Object.create(service); },
				enumerable: true
			});
		}

		reqModel = JSON.stringify(
				require(nconf.get('server:reqmodel:path') || './libs/reqmodel')(nconf));

		portNumber = Number(process.env.PORT || nconf.get('server:port'));

		locales.config(nconf); //initialize locales

		return nconf;
	},

	start: function(nconf, before, after) {

		this.nconf = nconf = this.init(nconf);

		var app = this.app = express();

		app.use(require(nconf.get('server:parser:path') || './libs/parser')(nconf)); //enabled req.body

		app.use(require(nconf.get('server:session:path') || './libs/session')(nconf)); //enabled req.session

		app.use('/', express.static(appdir));

		//http://localhost:8585/indigo/account/ru/templates/login
		app.use('/indigo/:routerPath/:locale/templates/:pageId', function(req, res) {
			req.model = JSON.parse(reqModel);
			locales.init(req, req.params.locale);

			var url = '/' + req.session.locale + '/templates/' + req.params.routerPath + '/' + req.params.pageId + '.html',
				newUrl = getNewURL(req, url);
			debug('url=%s redirect=%s', url, newUrl);
			res.redirect(newUrl);
		});

		routers.init(app, nconf, routerRedirectListener);

		app.locals.url = function(req, url) {
			var newUrl = getNewURL(req, '/' + req.session.locale + '/' + url, '/' + url);
			debug('%s -> %s', url, newUrl);
			try {
				return ejs.render(fs.readFileSync(appdir + newUrl, 'utf-8'), req.model);
			} catch(e) {
				var code = new Date().getTime();
				logger.error('Code: ', code, '\n', e.toString());
				return '<h3>Internal error. Please contact your system administrator</h3><br/>Code: ' + code;
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
		req.model.locales = locales || indigo.getLocales(req);
		req.model.req = req;
		if (fileName.indexOf('.') === -1) {
			fileName += '.html'; //attach default HTML extension
		}
		res.render(appdir + getNewURL(req, '/' + req.session.locale + '/' + fileName, '/' + fileName), req.model);
	},

	error: function(req, res, errorKey, errorCode) {
		var locales = indigo.getLocales(req);
		res.json(errorCode || 400, { error: locales.errors[errorKey] });
	},

	getLocales: function(req, paramName) {
		req.params = req.params || {};
		return locales.init(req, req.params[paramName || 'locale']);
	}
};

function getNewURL(req, url, redirectURL) {
	if (req.session.locale && !fs.existsSync(appdir + url) && 
		url.indexOf(req.session.locale) === 1) { //try to get file from another locale directory
		debug('url=%s locale=%s lookup=%s', url, req.session.locale, req.session.localeLookup);
		for (var index in req.session.localeLookup) {
			var newUrl = url.replace(req.session.locale, req.session.localeLookup[index]);
			if (fs.existsSync(appdir + newUrl)) {
				debug('getNewURL %s', newUrl);
				return newUrl;
			}
		}
	}
	if (!fs.existsSync(appdir + url)) {
		url = redirectURL || req.url || url;
	}
	return url;
}

function routerRedirectListener(req, res, next) {
	debug(req.method, req.url, req.originalUrl);

	req.model = JSON.parse(reqModel);

	if (!req.session.locale || req.params.locale !== req.session.locale) {
		locales.init(req, req.params.locale);
	}

	if (req.method === 'GET') {
		var newUrl = getNewURL(req, req.url);
		if (req.originalUrl.indexOf(newUrl) === -1) {
			debug('redirect: %s', newUrl);
			res.redirect(newUrl);
			return;
		}
	}

	next();
}
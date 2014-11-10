'use strict';

var express = require('express'),
	debug = require('debug')('indigo:main'),
	ejs = require('ejs'),
	fs = require('fs');

var reqModel,
	appdir, portNumber,
	logger, locales, indigo;

global.__appDir = __dirname + '/'; 

module.exports = indigo = {

	init: function(nconf) {
		this.locales = locales = require('./libs/locales');
		this.logger = logger = require(nconf.get('logger:path') || './libs/logger')(nconf);

		reqModel = JSON.stringify(
				require(nconf.get('server:reqmodel:path') || './libs/reqmodel')(nconf));

		appdir = __dirname + nconf.get('server:appdir');
		portNumber = Number(process.env.PORT || nconf.get('server:port'));

		locales.config(nconf); //initialize locales
	},

	start: function(nconf, next) {

		this.init(nconf);

		var app = express();

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

		// dynamically include routers
		loadModule('routers', nconf, function(route) {
			var router = express.Router(),
				next = function() {},
				path = null;

			router.use(routerRedirectListener);
			path = route(router, next);
			app.use(path, router);

			debug('router::path - %s', path);

			// dynamically include controllers
			loadModule('controllers', nconf, function(controller) {
				controller(router, next);
			});
		});

		app.locals.url = function(req, url) {
			var newUrl = getNewURL(req, '/' + req.session.locale + '/' + url);
			debug('%s -> %s', url, newUrl);
			return ejs.render(fs.readFileSync(appdir + newUrl, 'utf-8'), req.model);
		};

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', ejs.__express);

		// Set the folder where the pages are kept
		app.set('views', appdir);

		// Start the server
		app.listen(portNumber);
		logger.info('Server is running on port %s', portNumber);

		if (next) {
			next();
		}
	},

	render: function(req, res, url, locales) {
		req.model.locales = locales || indigo.getLocales(req);
		req.model.req = req;
		if (url.indexOf('.') === -1) {
			url += '.html'; //attach default HTML extension
		}
		res.render(appdir + getNewURL(req, '/' + req.session.locale + '/' + url), req.model);
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

function getNewURL(req, url) {
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

function loadModule(name, nconf, callback) {
	var dirs = nconf.get(name) || (fs.lstatSync('./' + name).isDirectory() ? ['./' + name] : []);
	for (var index in dirs) {
		var dir = __dirname + '/'+ dirs[index];
		fs.readdirSync(dir).forEach(function (file) {
			if(file.substr(-3) === '.js') {
				callback(require(dir + '/' + file.split('.')[0]));
			}
		});
	}
}
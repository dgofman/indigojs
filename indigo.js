'use strict';

var debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	less = require('less'),
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
				newUrl = getNewURL(req, res, url);
			debug('template=%s redirect=%s', url, newUrl);
			res.redirect(newUrl);
		});

		routers.init(app, nconf, reqModel, routerRedirectListener);

		app.locals.inject = function(req, url) {
			var newUrl = getNewURL(req, null, '/' + req.session.locale + '/' + url, '/' + url);
			debug('inject: %s -> %s', url, newUrl);
			req.model.filename = appdir + newUrl;
			try {
				return ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model);
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
		res.setHeader('lang', req.model.locality.langugage);

		if (fileName.indexOf('.') === -1) {
			fileName += '.html'; //attach default HTML extension
		}
		fileName = appdir + getNewURL(req, res, '/' + req.session.locale + fileName, '/' + fileName);
		if (!fs.existsSync(fileName)) {
			debug('FILE_NOT_FOUND %s', fileName);
			if (this.nconf.get('errors:404')) {
				res.setHeader('url', req.url);
				res.setHeader('path', fileName);
				return res.redirect(this.nconf.get('errors:404'));
			} else {
				return res.status(404).end();
			}
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
	}
};

function getNewURL(req, res, url, redirectURL) {
	if (req.session.locale && !fs.existsSync(appdir + url) && 
		url.indexOf('/' + req.session.locale +'/') !== -1) { //try to get file from another locale directory
		debug('url=%s locale=%s lookup=%s', url, req.session.locale, req.session.localeLookup);
		for (var index in req.session.localeLookup) {
			var newUrl = url.replace('/' + req.session.locale + '/', '/' + req.session.localeLookup[index] + '/');
			if (fs.existsSync(appdir + newUrl)) {
				debug('getNewURL %s', newUrl);
				res && res.setHeader('url', newUrl);
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

	if (req.method === 'GET' && req.session.locale) {
		var newUrl = getNewURL(req, res, req.url);
		if (req.originalUrl.indexOf(newUrl) === -1) {
			debug('redirect: %s', newUrl);
			if (newUrl.lastIndexOf('.less') !== -1) {
				fs.readFile(appdir + newUrl, function(error, data) {
					if (!error) {
						data = data.toString();
						less.render(data, {
								filename: appdir + newUrl,
								compress: indigo.nconf.get('environment') !== 'dev'
							}, function (error, result) {
							if (!error) {
								res.statusCode = 302;
								res.set('Content-Type', 'text/css');
								res.write(result.css);
								res.end();
							} else {
								indigo.logger.error('ERROR_LESS: ' + newUrl + ' - ' + error);
								res.send(data);
							}
						});
					} else {
						res.redirect(newUrl);
					}
				});
			} else {
				res.redirect(newUrl);
			}
			return;
		}
	}

	next();
}
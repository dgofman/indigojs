'use strict';

var express = require('express'),
	debug = require('debug')('indigo:main'),
	ejs = require('ejs'),
	fs = require('fs'),
	templateMap = {},
	uri, appdir, portNumber,
	logger, locales, indigo;

global.__appDir = __dirname + '/'; 

module.exports = indigo = {

	init: function(nconf) {
		this.locales = locales = require('./libs/locales');
		this.logger = logger = require(nconf.get('logger:path') || './libs/logger')(nconf);

		uri = nconf.get('server:uri'),
		appdir = __dirname + nconf.get('server:appdir'),
		portNumber = Number(process.env.PORT || nconf.get('server:port'));

		locales.config(nconf); //initialize locales

		//Localize /templates/**.*html
		var templates = nconf.get('templates') || (fs.lstatSync('./templates').isDirectory() ? ['./templates'] : []);
		for (var index in templates) {
			fs.readdirSync(__dirname + '/'+ templates[index]).forEach(function (file) {
				if(file.substr(-5) === '.json') {
					var templateId = file.split('.')[0];
					templateMap[templateId] = require(__dirname + '/'+ templates[index] + '/' + file);
				}
			});
		}
	},

	start: function(nconf) {

		this.init(nconf);

		var app = express(),
			reqModel = JSON.stringify(
				require(nconf.get('server:reqmodel:path') || './libs/reqmodel')(nconf));

		app.use(require(nconf.get('server:parser:path') || './libs/parser')(nconf)); //enabled req.body

		app.use(require(nconf.get('server:session:path') || './libs/session')(nconf)); //enabled req.session

		app.use(function(req, res, next) {
			debug(req.method, req.url);

			req.model = JSON.parse(reqModel);

			if (req.query.locale && req.query.locale !== req.session.locale) {
				locales.init(req, req.query.locale);
			}

			if (req.method === 'GET' && req._parsedUrl.pathname.indexOf(uri) === 0) {
				req.url = uri + getNewURL(req, req._parsedUrl.pathname.split(uri)[1]);
			}

			next();
		});

		app.locals.url = function(req, url) {
			var newUrl = getNewURL(req, '/' + req.session.locale + '/' + url);
			debug('%s -> %s', url, newUrl);
			return ejs.render(fs.readFileSync(appdir + newUrl, 'utf-8'), req.model);
		};

		app.get('/templates/:templateId/:pageId', function(req, res) { //Template url: 'text!/templates/account/login' 
			indigo.render(req, res, req.params.templateId, 
				req.params.pageId.split('.')[0], req.query.locale);
		});

		// dynamically include routes (Controller)
		var next = function(){},
		controllers = nconf.get('controllers') || (fs.lstatSync('./controllers').isDirectory() ? ['./controllers'] : []);
		for (var index in controllers) {
			fs.readdirSync(__dirname + '/'+ controllers[index]).forEach(function (file) {
				if(file.substr(-3) === '.js') {
					require(__dirname + '/'+ controllers[index] + '/' + file.split('.')[0])(app, uri, next);
				}
			});
		}

		app.use(uri, express.static(appdir));

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', ejs.__express);

		// Set the folder where the pages are kept
		app.set('views', appdir);

		// Start the server
		app.listen(portNumber);
		logger.info('Server is running on port %s', portNumber);
		logger.info('Default URL: http://localhost:%s%s/login', portNumber, uri);
	},

	render: function(req, res, templateId, pageId, locale) {
		var template = templateMap[templateId] || {};
		template = template[pageId];
		if (template) {
			locales.init(req, locale);
			for (var index in template.locales) {
				var properties = locales.apply(req, template.locales[index]);
				if (properties.pageTitle) {
					req.model.pageTitle = properties.pageTitle;
				}
			}
			req.model.req = req;
			res.render(appdir + getNewURL(req, '/' + req.session.locale + '/' + template.url), req.model);
		}
	},

	error: function(req, res, errorKey, errorCode, localeFile) {
		res.json(errorCode || 400, { error: locales.apply(req, localeFile || 'errors')[errorKey] });
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
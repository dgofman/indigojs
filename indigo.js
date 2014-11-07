'use strict';

var express = require('express'),
	expressSession = require('express-session'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	templateMap = {},
	uri, appdir, portNumber,

	logger, locales, indigo;

global.__appDir = __dirname + '/'; 

module.exports = indigo = {

	start: function(nconf) {

		this.appConfig = nconf;
		this.logger = logger = require('./libs/logger');
		this.locales = locales = require('./libs/locales');

		uri = nconf.get('server:uri'),
		appdir = __dirname + nconf.get('server:appdir'),
		portNumber = Number(process.env.PORT || nconf.get('server:port'));

		var app = express();

		locales.config(nconf);

		app.use(bodyParser.json()); //enabled req.body

		app.use(expressSession({  //enabled req.session
			secret: nconf.get('server:session-key'),
			resave: true,
			saveUninitialized: true
		}));

		app.use(function(req, res, next) {
			console.log('%s %s', req.method, req.url);
			if (req.method === 'GET' && req.url.indexOf(uri) === 0) {
				req.url = uri + getNewURL(req, req.url.split(uri)[1]);
			}

			req.model = {
				environment: nconf.get('environment'),
				locality: {},
				locales: {}
			};

			next();
		});

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

		app.get('/templates/:templateId/:pageId', function(req, res) { //Template url: 'text!/templates/account/login' 
			indigo.render(req, res, req.params.templateId, 
				req.params.pageId.split('.')[0]);
		});

		// dynamically include routes (Controller)
		var next = function(){},
		controllers = nconf.get('controllers') || (fs.lstatSync('./controllers').isDirectory() ? ['./controllers'] : []);;
		for (index in controllers) {
			fs.readdirSync(__dirname + '/'+ controllers[index]).forEach(function (file) {
				if(file.substr(-3) === '.js') {
					require(__dirname + '/'+ controllers[index] + '/' + file.split('.')[0])(app, uri + '/:locale', next);
				}
			});
		}

		app.use(uri, express.static(appdir));

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', require('ejs').__express);

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
			locales.init(req, locale)
			for (var index in template.locales) {
				var properties = locales.apply(req, template.locales[index]);
				if (properties.pageTitle) {
					req.model.pageTitle = properties.pageTitle;
				}
			}
			res.render(appdir + getNewURL(req, '/' + req.session.locale + '/' + template.url), req.model);
		}
	},

	error: function(req, res, errorKey, errorCode, model) {
		res.json(errorCode || 400, { error: (model || locales.apply(req, 'errors'))[errorKey] });
	}
};

function getNewURL(req, url) {
	console.log("<<<<", url, req.session.locale, req.session.templateLocales)
	if (req.session.locale && !fs.existsSync(appdir + url) && 
	    url.indexOf(req.session.locale) === 1) { //try to get file from another locale directory
		for (var index in req.session.templateLocales) {
			var newUrl = url.replace(req.session.locale, req.session.templateLocales[index]);
			console.log(">>", appdir + newUrl)
			if (fs.existsSync(appdir + newUrl)) {
				console.log("HERE", newUrl)
				return newUrl;
			}
		}
	}
	return url;
}
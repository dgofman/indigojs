'use strict';

var express = require('express'),
	expressSession = require('express-session'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	templateMap = {},
	logger, locales, indigo;

global.__appDir = __dirname + '/'; 

module.exports = indigo = {

	start: function(nconf) {

		this.appConfig = nconf;
		this.logger = logger = require('./libs/logger');
		this.locales = locales = require('./libs/locales');

		var app = express(),
			uri = nconf.get('server:uri'),
			appdir = __dirname + nconf.get('server:appdir'),
			portNumber = Number(process.env.PORT || nconf.get('server:port'));

		locales.config(nconf);

		app.use(bodyParser.json()); //enabled req.body

		app.use(expressSession({  //enabled req.session
			secret: nconf.get('server:session-key'),
			resave: true,
			saveUninitialized: true
		}));

		app.use(function(req, res, next) {
			//console.log('%s %s', req.method, req.url);
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
					require(__dirname + '/'+ controllers[index] + '/' + file.split('.')[0])(app, uri, next);
				}
			});
		}

		app.use(uri, express.static(appdir));

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', require('ejs').__express);

		// Set the folder where the pages are kept
		app.set('views', appdir);

		// This avoids having to provide the 
		// extension to res.render()
		app.set('view engine', 'html');	 

		// Start the server
		app.listen(portNumber);
		logger.info('Server is running on port %s', portNumber);
		logger.info('Default URL: http://localhost:%s%s/login', portNumber, uri);
	},

	render: function(req, res, templateId, pageId) {
		var template = templateMap[templateId] || {};
		template = template[pageId];
		if (template) {
			if (locales.init(req)) {
				for (var index in template.locales) {
					var locale = locales.apply(req, template.locales[index]);
					if (locale.pageTitle) {
						req.model.pageTitle = locale.pageTitle;
					}
				}
			}
			res.render(template.url, req.model);
		}
	},

	error: function(req, res, errorKey, errorCode, model) {
		res.json(errorCode || 400, { error: (model || locales.apply(req, 'errors'))[errorKey] });
	}
};
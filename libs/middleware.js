'use strict';

var debug = require('debug')('indigo:middleware'),
	fs = require('fs'),
	less = require('less'),
	errorHandler = require('./errorHandler');

module.exports = function middleware(appconf) {

	var isDev = appconf.get('environment') === 'dev',
		appdir = __appDir + appconf.get('server:appdir'),
		indigo = require('../indigo');

	return function(req, res, next) {
		if (!res._headerSent && req.method === 'GET') {
			debug(req.method, req.url, req.originalUrl);

			var newUrl = indigo.getNewURL(req, res, req.url),
				cache = parseInt(appconf.get('server:cache'));

			if (fs.existsSync(appdir + newUrl) && 
				req.originalUrl.indexOf(newUrl) === -1) {
				res.setHeader && res.setHeader('Cache-Control', 'public, max-age=' + 
						(!isNaN(cache) ? cache : 3600)); //or one hour

				debug('redirect: %s -> %s', req.url, newUrl);
				if (newUrl.lastIndexOf('.less') !== -1) {
					fs.readFile(appdir + newUrl, function(error, data) {
						data = data.toString();
						less.render(data, {
								filename: appdir + newUrl,
								compress: !isDev
							}, function (error, result) {
								res.set('Content-Type', 'text/css');
								if (!error) {
									res.write(result.css);
									res.end();
								} else {
									errorHandler.lessErrorHandler(error);
									res.send(data);
								}
							});
					});
				} else {
					res.sendfile(appdir + newUrl);
				}
			} else {
				res.status(404);
				res.setHeader && res.setHeader('path', appdir + newUrl);
				next('middleware');
			}
			return;
		}

		next();
	};
};
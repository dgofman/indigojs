'use strict';

var debug = require('debug')('indigo:middleware'),
	fs = require('fs'),
	less = require('less');

module.exports = function middleware(appconf) {

	var isDev = appconf.get('environment') === 'dev',
		cache = appconf.get('server:cache'),
		appdir = __appDir + appconf.get('server:appdir'),
		indigo = require('../indigo');

	return function(req, res, next) {
		if (!res._headerSent && req.method === 'GET') {
			debug(req.method, req.url, req.originalUrl);

			var newUrl = indigo.getNewURL(req, res, req.url);

			if (req.originalUrl.indexOf(newUrl) === -1) {
				if (res && res.setHeader) {
					res.setHeader('Cache-Control', 'public, max-age=' + 
						(cache !== undefined ? parseInt(cache) : 3600)); //or one hour
				}

				debug('redirect: %s -> %s', req.url, newUrl);
				if (newUrl.lastIndexOf('.less') !== -1) {
					fs.readFile(appdir + newUrl, function(error, data) {
						if (!error) {
							data = data.toString();
							less.render(data, {
									filename: appdir + newUrl,
									compress: !isDev
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
							res.sendfile(appdir + newUrl);
						}
					});
				} else {
					res.sendfile(appdir + newUrl);
				}
				return;
			}
		}

		next();
	};
};
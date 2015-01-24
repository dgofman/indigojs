'use strict';

var debug = require('debug')('indigo:middleware'),
	fs = require('fs'),
	less = require('less'),
	errorHandler = require('./errorHandler');

/**
 * Middleware function is handling any router requests. 
 * IndigoJS middleware provides redirection to locale files under application web directory
 * based on locale rules defined in <code>libs/locales/accept-rules.json</code>. In case a
 * file extension is <code>LESS</code> Indigo middleware will compile to <code>CSS</code>.
 *
 * @see {@link libs/routers#routerConf}
 * @see {@link libs/middleware.js libs/middleware}
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/middleware
 * @param {Object} appconf JSON object represents application configuration.
 */
function middleware(appconf) {

	var isDev = appconf.get('environment') === 'dev',
		indigo = require('../indigo'),
		webdir = indigo.getWebDir();

	/**
	 * @memberOf sourceloader
	 * @alias middleware.js#handler
	 */
	return function(req, res, next) {
		if (!res._headerSent && req.method === 'GET') {
			debug(req.method, req.url, req.originalUrl);

			var newUrl = indigo.getNewURL(req, res, req.url),
				cache = parseInt(appconf.get('server:cache'));

			if (fs.existsSync(webdir + newUrl) && 
				req.originalUrl.indexOf(newUrl) === -1) {
				res.setHeader && res.setHeader('Cache-Control', 'public, max-age=' + 
						(!isNaN(cache) ? cache : 3600)); //or one hour

				debug('redirect: %s -> %s', req.url, newUrl);
				if (newUrl.lastIndexOf('.less') !== -1) {
					fs.readFile(webdir + newUrl, function(error, data) {
						data = data.toString();
						less.render(data, {
								filename: webdir + newUrl,
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
					res.sendFile(webdir + newUrl);
				}
			} else {
				res.status(404);
				res.setHeader && res.setHeader('path', webdir + newUrl);
				next('middleware');
			}
			return;
		}

		next();
	};
}

/**
 * @module middleware
 * @see {@link libs/middleware}
 */
module.exports = middleware;
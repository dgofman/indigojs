'use strict';

var indigo = global.__indigo,
	debug = require('debug')('indigo:rest'),
	querystring = require('querystring'),
	http = require('http'),
	https = require('https');

/**
 * indigoJS <code>rest</code> module is a simple yet powerful representation of your RESTful API.
 * By specifying <code>service:path</code> in <code>app.conf</code> you can link to custom version to your
 * REST API's or another service manager module.
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/rest
 *
 * @requires http
 * @requires https
 *
 * @example
 * conf/app.json 
 *{
 * ...
 *	"service": 
 *	{
 *		"path": null,
 *		"host": "localhost",
 *		"port": 443,
 *		"secure": true
 *	}
 *...
 *}
 */
function rest() {

	return /** @lends libs/rest.prototype */ {
		/**
		 * Specified default header values in JSON responce object.
		 * @alias headers
		 * @type {Object}
		 */
		headers: {
			'Accept-Encoding': 'gzip, deflate',
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/plain;charset=UTF-8'
		},
		/**
		 * Initializing server settings.
		 * @param {Object} opts Defined default server configuration where <code>host</code> is IP Address or
		 * domain name,  <code>port</code> server port number and <code>secure</code> communications protocol
		 * HTTP or HTTPS.
		 * 
		 * @return {Object} rest Scope to the current instance.
		 *
		 * @example
		 * require('indigojs').service.init();
		 *
		 * @example
		 * require('indigojs').service.init({
		 *		host:'localhost',
		 *		port: 80
		 *	});
		 */
		init: function(opts) {
			opts = opts || indigo.appconf.get('service') || {};
			this.host = opts.host;
			this.port = opts.port;
			this.secure = opts.secure;
			return this;
		},
		/**
		 * This function used to request a LIST of entities or to SHOW details for one entity.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} data An object that is sent to the server with the request.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 *
		 * @example
		 * require('indigojs').service.get('/routerBase/getPath', null, function(err, result, req, res) {
		 * 	...
		 * });
		 */
		get: function(path, data, callback) {
			this.request('GET', path, data, callback);
		},
		/**
		 * Executing HTTP POST requests contain their data in the body of the request. 
		 * @param {String} path Canonical path of the router.
		 * @param {Object} data An object that is sent to the server with the request.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 *
		 * @example
		 * require('indigojs').service.post('/routerBase/postPath', {'key':'value'}, function(err, result, req, res) {
		 * 	...
		 * });
		 */
		post: function(path, data, callback) {
			this.request('POST', path, data, callback);
		},
		/**
		 * The function sending request and translated as UPDATE or REPLACE an entity. 
		 * @param {String} path Canonical path of the router.
		 * @param {Object} data An object that is sent to the server with the request.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 *
		 * @example
		 * require('indigojs').service.put('/routerBase/putPath', {'id':123, 'key':'value'}, function(err, result, req, res) {
		 * 	...
		 * });
		 */
		put: function(path, data, callback) {
			this.request('PUT', path, data, callback);
		},
		/**
		 * The function requests are used to delete an entity.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} data An object that is sent to the server with the request.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 *
		 * @example
		 * require('indigojs').service.put('/routerBase/deletePath', {'id':123}, function(err, result, req, res) {
		 * 	...
		 * });
		 */
		delete: function(path, data, callback) {
			this.request('DELETE', path, data, callback);
		},
		/**
		 * The function perform a partial update of an entity.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} data An object that is sent to the server with the request.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 *
		 * @example
		 * require('indigojs').service.patch('/routerBase/patchPath', {'id':123, 'key':'value'}, function(err, result, req, res) {
		 * 	...
		 * });
		 */
		patch: function(path, data, callback) {
			this.request('PATCH', path, data, callback);
		},
		/**
		 * The inner function for building REST requests and executing from <code>get/post/put/delete/patch</code> functions.
		 * @param {String} method HTTP method <code>GET/POST/PUT/DELETE/PATCH</code>.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} data An object that is sent to the server with the request.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 */
		request: function(method, path, data, callback) {

			var content = data ? JSON.stringify(data) : '';

			this.headers['Content-Length'] = content.length;

			if (method === 'GET') {
				path += '?' + querystring.stringify(data);
			}

			var server, req,
				options = {
					host: this.host,
					port: this.port,
					headers: this.headers,
					method: method,
					path: path
				};

			if (this.secure !== undefined) {
				server = this.secure ? https : http;
			} else {
				server = options.port !== 80 ? https : http;
			}

			debug('options -> %s', JSON.stringify(options, null, 2));
			debug('is HTTPS -> %s', server === https);

			req = server.request(options, function(res) {
				var responseString = '';
				res.setEncoding('utf-8');

				res.on('data', function(data) {
					responseString += data;
				});

				res.on('end', function() {
					try {
						callback(null, JSON.parse(responseString), req, res);
					} catch (e) {
						debug('error - %s', e.message);
						debug('result - %s', responseString);
						callback(e, responseString, req, res);
					}
				});
			});

			req.on('error', function(err) {
				debug('error - %s', err);
				callback(err, null, req, {statusCode: 500, message: 'Internal Server Error', err: err});
			});

			if (method !== 'GET') {
				req.write(content);
			}

			req.end();
		}
	};
}

/**
 * @module rest
 * @see {@link libs/rest}
 */
module.exports = rest;
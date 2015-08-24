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
		 * @memberof libs/rest.prototype 
		 * @alias headers
		 * @type {Object}
		 */
		headers: {
			'Accept-Encoding': 'gzip, deflate',
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/json;charset=UTF-8'
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
			this.timeout = opts.timeout;
			return this;
		},
		/**
		 * This function used to request a LIST of entities or to SHOW details for one entity.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.get(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/getPath', null, {'framework': 'indigojs'});
		 */
		get: function(callback, path, data, query) {
			this.request(callback, 'GET', path, data, query);
		},
		/**
		 * Executing HTTP POST requests contain their data in the body of the request. 
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.post(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/postPath', {'key':'value'});
		 */
		post: function(callback, path, data, query) {
			this.request(callback, 'POST', path, data, query);
		},
		/**
		 * The function sending request and translated as UPDATE or REPLACE an entity. 
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.put(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/putPath', {'id':123, 'key':'value'});
		 */
		put: function(callback, path, data, query) {
			this.request(callback, 'PUT', path, data, query);
		},
		/**
		 * The function requests are used to delete an entity.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.put(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/deletePath', {'id':123});
		 */
		delete: function(callback, path, data, query) {
			this.request(callback, 'DELETE', path, data, query);
		},
		/**
		 * The function perform a partial update of an entity.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.patch(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/patchPath', {'id':123, 'key':'value'});
		 */
		patch: function(callback, path, data, query) {
			this.request(callback, 'PATCH', path, data, query);
		},
		/**
		 * The inner function for building REST requests and executing from <code>get/post/put/delete/patch</code> functions.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} method HTTP method <code>GET/POST/PUT/DELETE/PATCH</code>.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 */
		request: function(callback, method, path, data, query) {

			if (query && Object.keys(query).length) {
				path += (path.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(query);
			}

			if (method === 'GET' && data && Object.keys(data).length) {
				path += (path.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(data);
			}

			var server, content, req,
				self = this,
				options = {
					host: this.host,
					port: this.port,
					headers: this.headers,
					method: method,
					path: path
				};

			if (method !== 'GET') {
				content = typeof(data) === 'string' ? data : JSON.stringify(data) || '';
				options.headers['Content-Length'] = content.length;
			}

			if (this.secure !== undefined) {
				server = this.secure ? https : http;
			} else {
				server = options.port !== 80 ? https : http;
			}

			options.scheme = (server === https  ? 'HTTPS' : 'HTTP');

			debug('options -> %s', JSON.stringify(options, null, 2));

			req = server.request(options, function(res) {
				var data, responseString = '';
				res.setEncoding('utf-8');

				res.on('data', function(data) {
					responseString += data;
				});

				res.on('end', function() {
					try {
						data = JSON.parse(responseString);
					} catch (e) {
						data = responseString;
					}

					if (res.statusCode >= 200 && res.statusCode <= 226) {
						callback(null, data, req, res);
					} else {
						callback({statusCode: res.statusCode, data: data}, null, req, res);
					}
				});
			});

			req.on('error', function(err) {
				debug('error - %s', err);
				callback(err, null, req, {statusCode: 500, message: 'Internal Server Error', err: err});
			});

			req.on('socket', function (socket) {
				if (self.timeout !== undefined) {
					socket.setTimeout(self.timeout);
					socket.on('timeout', function() {
						req.abort();
					});
				}
			});
			
			delete this.headers['Content-Length'];

			req.end(content);
		}
	};
}

/**
 * @module rest
 * @see {@link libs/rest}
 */
module.exports = rest;

'use strict';

var debug = require('debug')('indigo:rest'),
	indigo = require('../indigo'),
	querystring = require('querystring'),
	http = require('http'),
	https = require('https');

/**
 * Description
 * @method exports
 * @return ObjectExpression
 */
module.exports = function rest() {

	return {
		headers: {
			'Accept-Encoding': 'gzip, deflate',
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/plain;charset=UTF-8'
		},
		/**
		 * Description
		 * @method init
		 * @param {} opts
		 * @return ThisExpression
		 */
		init: function(opts) {
			opts = opts || indigo.appconf.get('service') || {};
			this.host = opts.host;
			this.port = opts.port;
			this.secure = opts.secure;
			return this;
		},
		/**
		 * Description
		 * @method get
		 * @param {} path
		 * @param {} data
		 * @param {} callback
		 * @return 
		 */
		get: function(path, data, callback) {
			this.request('GET', path, data, callback);
		},
		/**
		 * Description
		 * @method post
		 * @param {} path
		 * @param {} data
		 * @param {} callback
		 * @return 
		 */
		post: function(path, data, callback) {
			this.request('POST', path, data, callback);
		},
		/**
		 * Description
		 * @method put
		 * @param {} path
		 * @param {} data
		 * @param {} callback
		 * @return 
		 */
		put: function(path, data, callback) {
			this.request('PUT', path, data, callback);
		},
		/**
		 * Description
		 * @method delete
		 * @param {} path
		 * @param {} data
		 * @param {} callback
		 * @return 
		 */
		delete: function(path, data, callback) {
			this.request('DELETE', path, data, callback);
		},
		/**
		 * Description
		 * @method patch
		 * @param {} path
		 * @param {} data
		 * @param {} callback
		 * @return 
		 */
		patch: function(path, data, callback) {
			this.request('PATCH', path, data, callback);
		},
		/**
		 * Description
		 * @method request
		 * @param {} method
		 * @param {} path
		 * @param {} data
		 * @param {} callback
		 * @return 
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
};
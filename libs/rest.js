'use strict';

var debug = require('debug')('indigo:rest'),
	querystring = require('querystring'),
	http = require('http'),
	https = require('https');

module.exports = function service(nconf) {

	return {
		headers: {
			'Accept-Encoding': 'gzip, deflate',
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/plain;charset=UTF-8'
		},
		init: function(host, port, secure) {
			this.host = host;
			this.port = port;
			this.secure = secure;
			return this;
		},
		getHost: function() {
			return this.host || nconf.get('service:host');
		},
		getPort: function() {
			return this.port || nconf.get('service:port');
		},
		get: function(path, data, callback) {
			this.request('GET', path, data, callback);
		},
		post: function(path, data, callback) {
			this.request('POST', path, data, callback);
		},
		put: function(path, data, callback) {
			this.request('PUT', path, data, callback);
		},
		delete: function(path, data, callback) {
			this.request('DELETE', path, data, callback);
		},
		patch: function(path, data, callback) {
			this.request('PATCH', path, data, callback);
		},
		request: function(method, path, data, callback) {

			var content = data ? JSON.stringify(data) || '' : '';

			this.headers['Content-Length'] = content.length;

			if (method === 'GET') {
				path += '?' + querystring.stringify(data);
			}

			var server, req,
				secure = nconf.get('service:secure'),
				options = {
					host: this.getHost(),
					port: this.getPort(),
					method: method,
					path: path,
					headers: this.headers
				};

			if (this.secure !== undefined) {
				server = this.secure ? https : http;
			} else if (secure !== undefined) {
				server = secure ? https : http;
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
						debug('parse error - %s', e.message);
						debug('parse content - %s', responseString);
						callback(null, responseString, req, res);
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
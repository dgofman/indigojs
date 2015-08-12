'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing libs/static.js', function () {

	var port;

	before(function (done) {
		indigo.start(__appDir +  '/examples/helloworld/config/app.json');
		port = indigo.appconf.get('server:port');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should test redirect CSS to LESS', function(done) {
		superagent.get('http://localhost:' + port + '/static/css/helloworld.css')
			.end(function(err, res) {
				assert.equal(res.type, 'text/css');
				assert.equal(res.redirects.toString(), 'http://localhost:' + port + '/static/css/helloworld.less');
				assert.equal(res.header['cache-control'], 'public, max-age=86400');
				done();
		});
	});

	it('should test default cache header value', function(done) {
		indigo.appconf.server.cache = null;
		superagent.get('http://localhost:' + port + '/static/css/common.less')
			.end(function(err, res) {
				assert.equal(res.type, 'text/css');
				assert.ok(res.text.indexOf('.footer .powered {') !== -1);
				assert.equal(res.header['cache-control'], 'public, max-age=3600');
				done();
		});
	});

	it('should test invalid path to static CSS', function(done) {
		superagent.get('http://localhost:' + port + '/static/invalid.css')
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test invalid path to static LESS', function(done) {
		superagent.get('http://localhost:' + port + '/static/css/invalid.less')
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});
});

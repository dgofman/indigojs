'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing libs/static.js', function () {

	before(function (done) {
		indigo.start(__appDir +  '/examples/account/config/app.json');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should test redirect CSS to LESS', function(done) {
		superagent.get('http://localhost:8585/static/css/custom.css')
			.end(function(err, res) {
				assert.equal(res.type, 'text/css');
				assert.equal(res.redirects.toString(), 'http://localhost:8585/static/css/custom.less');
				done();
		});
	});

	it('should test invalid path to static CSS', function(done) {
		superagent.get('http://localhost:8585/static/invalid_custom.css')
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test LESS to CSS response', function(done) {
		indigo.appconf.server.cache = null;
		superagent.get('http://localhost:8585/static/css/custom.less')
			.end(function(err, res) {
				assert.equal(res.type, 'text/css');
				assert.ok(res.text.indexOf('html{background-color') !== -1);
				done();
		});
	});

	it('should test invalid path to static LESS', function(done) {
		superagent.get('http://localhost:8585/static/css/invalid_custom.less')
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});
});

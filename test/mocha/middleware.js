'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	fs = require('fs'),
	indigo = require('../../indigo'),
	acceptLanguage = 'en, en-us';

describe('Testing libs/middleware', function () {

	before(function (done) {
		indigo.start(__appDir +  '/examples/account/config/app.json');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should restrict using POST middleware', function(done) {
		superagent.post('http://localhost:8585/account/en/js/vendor/jquery-2.1.1.js')
			.set('Accept-Language', acceptLanguage)
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should get javascript', function(done) {
		superagent.get('http://localhost:8585/account/en/js/vendor/jquery-2.1.1.js')
			.set('Accept-Language', acceptLanguage)
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'application/javascript');
				assert.equal(res.headers['cache-control'], 'public, max-age=86400');
				done();
		});
	});

	it('should get javascript 404', function(done) {
		superagent.get('http://localhost:8585/account/en/js/vendor/angular.js')
			.set('Accept-Language', acceptLanguage)
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test default cache value', function(done) {
		indigo.appconf.server.cache = null;
		superagent.get('http://localhost:8585/account/en/js/vendor/jquery-2.1.1.js')
			.set('Accept-Language', acceptLanguage)
			.end(function(err, res) {
				assert.equal(res.headers['cache-control'], 'public, max-age=3600');
				done();
		});
	});

	it('should get less/css', function(done) {
		superagent.get('http://localhost:8585/account/en/css/custom.less')
			.set('Accept-Language', acceptLanguage)
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/css; charset=utf-8');
				assert.equal(res.headers['referer'], '/default/css/custom.less');
				done();
		});
	});

	it('should fail parse less/css', function(done) {
		var lessFile = __appDir + '/examples/account/web/default/css/temp.less';
		fs.writeFileSync(lessFile, 'HELLO WORLD');
		superagent.get('http://localhost:8585/account/en/css/temp.less')
			.set('Accept-Language', acceptLanguage)
			.end(function(err, res) {
				fs.unlinkSync(lessFile);
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/css; charset=utf-8');
				assert.equal(res.headers['referer'], '/default/css/temp.less');
				done();
		});
	});
});
'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing Account Routers', function () {

	before(function (done) {
		var nconf = require('nconf').
				use('file', { file: __appDir +  '/examples/account/config/app.json' });
		indigo.start(nconf);
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should request to US login page', function(done){
		superagent.get('http://localhost:8585/account/us/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should load RU login template', function(done){
		superagent.get('http://localhost:8585/account/ru/templates/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test redirect to default/common resources', function(done){
		superagent.get('http://localhost:8585/account/en-us/js/account/models/userModel.js')
			.redirects(0)
			.end(function(err, res) {
				assert.equal(res.statusCode, 302);
				assert.equal(res.headers['location'], '/default/js/account/models/userModel.js');
				done();
		});
	});

	it('should test template redirect', function(done){
		superagent.get('http://localhost:8585/indigo/account/ru/templates/login')
			.redirects(0)
			.end(function(err, res) {
				assert.equal(res.statusCode, 302);
				assert.equal(res.headers['location'], '/default/templates/account/login.html');
				done();
		});
	});

});

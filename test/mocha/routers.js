'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing Account Routers', function () {

	var port;

	before(function (done) {
		indigo.start(__appDir +  '/examples/account/config/app.json');
		port = indigo.appconf.get('server:port');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should request to US login page', function(done){
		superagent.get('http://localhost:' + port + '/account/us/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should load RU login template', function(done){
		superagent.get('http://localhost:' + port + '/account/ru/templates/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test Referer header value', function(done){
		superagent.get('http://localhost:' + port + '/account/us/templates/reset')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['referer'], '/default/templates/account/reset.html');
				done();
		});
	});

	it('should test template Referer', function(done){
		superagent.get('http://localhost:' + port + '/indigo/account/ru/templates/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['referer'], '/default/templates/account/login.html');
				done();
		});
	});
});
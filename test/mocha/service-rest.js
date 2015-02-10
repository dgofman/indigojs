'use strict';

var assert = require('assert'),
	indigo = require('../../indigo'),
	rest = require('../../libs/rest'),
	params = {'param1':1, 'param2': 2};

describe('Testing REST API\'s', function () {

	before(function (done) {
		indigo.start(__appDir + '/examples/firststep/config/app.json');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should verify rest properties', function(done) {
		assert.equal(indigo.service.host, 'localhost');
		assert.equal(indigo.service.port, '8787');
		done();
	});

	it('should test GET', function(done) {
		indigo.service.get('/firststep/REST', null, function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			done();
		});
	});

	it('should test POST', function(done) {
		indigo.service.post('/firststep/REST', params, function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'POST');
			done();
		});
	});

	it('should test PUT', function(done) {
		indigo.service.put('/firststep/REST', params, function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'PUT');
			done();
		});
	});

	it('should test DELETE', function(done) {
		indigo.service.delete('/firststep/REST', params, function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'DELETE');
			done();
		});
	});

	it('should test PATCH', function(done) {
		indigo.service.patch('/firststep/REST', params, function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'PATCH');
			done();
		});
	});

	it('should test error 404', function(done) {
		indigo.service.init({
				host:'localhost',
				port:80
			}).get('/firststep/REST', params, function(err, result, req, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test ECONNRESET error', function(done) {
		indigo.service.init({
				host:'localhost',
				port:8787,
				secure:true
			}).get('/firststep/REST', params, function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNRESET');
				done();
		});
	});

	it('should get ECONNREFUSED error', function(done) {
		indigo.service.init({
				host:'localhost',
				port: 8765,
				secure: true
			}).get('/firststep/REST', params, function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNREFUSED');
				done();
		});
	});

	it('should get ECONNREFUSED calling request function', function(done) {
		rest().init({
				host:'localhost',
				port: 8123
			}).request('GET', '/firststep/REST', null, function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNREFUSED');
				done();
		});
	});

	it('should get ECONNRESET calling request function', function(done) {
		rest().init({
				host:'localhost',
				port: 8787
			}).request('GET', '/firststep/REST', null, function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNRESET');
				done();
		});
	});

	it('should test parsing error', function(done) {
		indigo.service.get('/firststep/TEST', params, function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err.message, 'Unexpected token H');
			assert.equal(result, 'HELLO WORLD!');
			done();
		});
	});
});
 
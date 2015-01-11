'use strict';

var assert = require('assert'),
	indigo = require('../../indigo'),
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
		indigo.service.get('/firststep/REST', params, function(err, result, req, res) {
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

	it('should get ECONNRESET error', function(done) {
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
				port: 12345,
				secure: true
			}).get('/firststep/REST', params, function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNREFUSED');
				done();
		});
	});
});
 
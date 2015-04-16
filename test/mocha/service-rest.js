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
		assert.equal(indigo.service.port, 8787);
		done();
	});

	it('should test GET', function(done) {
		indigo.service.get(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			assert(req._header, 'GET /firststep/REST?user=dgofman HTTP/1.1');
			done();
		}, '/firststep/REST', null, {'user': 'dgofman'});
	});

	it('should test GET with query param', function(done) {
		indigo.service.get(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			assert(req._header, 'GET /firststep/REST?v1&user=dgofman HTTP/1.1');
			done();
		}, '/firststep/REST?v1', null, {'user': 'dgofman'});
	});

	it('should test GET with query param and body', function(done) {
		indigo.service.get(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			assert(req._header, 'GET /firststep/REST?user=dgofman&dob=01%2F25%2F1975 HTTP/1.1');
			done();
		}, '/firststep/REST', {'dob': '01/25/1975'}, {'user': 'dgofman'});
	});

	it('should test POST', function(done) {
		indigo.service.post(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'POST');
			done();
		}, '/firststep/REST', params);
	});

	it('should test PUT', function(done) {
		indigo.service.put(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'PUT');
			done();
		}, '/firststep/REST', params);
	});

	it('should test DELETE', function(done) {
		indigo.service.delete(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'DELETE');
			done();
		}, '/firststep/REST', params);
	});

	it('should test PATCH', function(done) {
		indigo.service.patch(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'PATCH');
			done();
		}, '/firststep/REST', params);
	});

	it('should test error', function(done) {
		indigo.service.init({
				host:'localhost',
				port:80
			}).get(function(err, result, req, res) {
				assert.notEqual(res.statusCode, 200);
				done();
		}, '/firststep/REST', params);
	});

	it('should test ECONNRESET error', function(done) {
		indigo.service.init({
				host:'localhost',
				port:8787,
				secure:true
			}).get(function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNRESET');
				done();
		}, '/firststep/REST', params);
	});

	it('should get ECONNREFUSED error', function(done) {
		indigo.service.init({
				host:'localhost',
				port: 8765,
				secure: true
			}).get(function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNREFUSED');
				done();
		}, '/firststep/REST', params);
	});

	it('should get ECONNREFUSED calling request function', function(done) {
		rest().init({
				host:'localhost',
				port: 8123
			}).request(function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNREFUSED');
				done();
		}, 'GET', '/firststep/REST');
	});

	it('should get ECONNRESET calling request function', function(done) {
		rest().init({
				host:'localhost',
				port: 8787
			}).request(function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNRESET');
				done();
		}, 'POST', '/firststep/REST');
	});

	it('should test request timeout/abort', function(done) {
		rest().init({
				host:'www.yahoo.com',
				port:80,
				timeout: 1
			}).request(function(err, result, req, res) {
				assert.equal(res.statusCode, 500);
				assert.equal(err.code, 'ECONNRESET');
				done();
		}, 'POST', '/index.html', 'YAHOO!!!');
	});

	it('should test parsing error', function(done) {
		var service = indigo.service;
		service.headers['Content-Type'] = 'text/plain;charset=UTF-8';
		service.get(function(err, result, req, res) {
			assert.equal(res.statusCode, 200);
			assert.equal(result, 'HELLO WORLD!');
			done();
		}, '/firststep/TEST', params);
	});
});
 
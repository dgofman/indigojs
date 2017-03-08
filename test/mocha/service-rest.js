'use strict';

const assert = require('assert'),
	indigo = require('../../indigo'),
	rest = require('../../libs/rest'),
	params = {'param1':1, 'param2': 2};

describe('Testing REST API\'s', () => {

	before(done => {
		indigo.start(`${__appDir}/examples/firststep/config/app.json`);
		done();
	});

	after(done => {
		indigo.close(done);
	});

	it('should verify rest properties', done => {
		assert.equal(indigo.service.opts.host, 'localhost');
		assert.equal(indigo.service.opts.port, 8787);
		done();
	});

	it('should test GET', done => {
		indigo.service.get((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			assert(req._header, 'GET /firststep/REST?user=dgofman HTTP/1.1');
			done();
		}, '/firststep/REST', null, {'user': 'dgofman'});
	});

	it('should test GET with query param', done => {
		indigo.service.get((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			assert(req._header, 'GET /firststep/REST?v1&user=dgofman HTTP/1.1');
			done();
		}, '/firststep/REST?v1', null, {'user': 'dgofman'});
	});

	it('should test GET with query param and body', done => {
		indigo.service.get((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'GET');
			assert(req._header, 'GET /firststep/REST?user=dgofman&dob=01%2F25%2F1975 HTTP/1.1');
			done();
		}, '/firststep/REST', {'dob': '01/25/1975'}, {'user': 'dgofman'});
	});

	it('should test POST', done => {
		indigo.service.post((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'POST');
			done();
		}, '/firststep/REST', params);
	});

	it('should test PUT', done => {
		indigo.service.put((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'PUT');
			done();
		}, '/firststep/REST', params);
	});

	it('should test DELETE', done => {
		indigo.service.delete((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'DELETE');
			done();
		}, '/firststep/REST', params);
	});

	it('should test PATCH', done => {
		indigo.service.patch((err, result, req, res) => {
			assert.equal(res.statusCode, 200);
			assert.equal(err, null, 'no errors');
			assert.equal(result.method, 'PATCH');
			done();
		}, '/firststep/REST', params);
	});


	it('should test request timeout/abort', done => {
		rest().init({
				host:'www.yahoo.com',
				port:80,
				timeout: 1
			}).request((err, result, req, res) => {
				assert.equal(res.statusCode, 500);
				assert.equal(err.error.code, 'ECONNRESET');
				done();
		}, 'POST', '/index.html', 'YAHOO!!!');
	});
});
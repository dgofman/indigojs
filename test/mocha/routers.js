'use strict';

const superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing Account Routers', () => {

	let port;

	before(done => {
		indigo.start(`${__appDir}/examples/account/config/app.json`);
		indigo.logger.error = () => {};
		port = indigo.appconf.get('server:port');
		done();
	});

	after(done => {
		indigo.close(done);
	});

	it('should request to US login page', done => {
		superagent.get(`http://localhost:${port}/account/us/login`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should load RU login template', done => {
		superagent.get(`http://localhost:${port}/account/ru/templates/login`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test Referer header value', done => {
		superagent.get(`http://localhost:${port}/account/us/templates/reset`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['referer'], '/default/templates/account/reset.html');
				done();
		});
	});

	it('should test router use on error', done => {
		superagent.get(`http://localhost:${port}/account?ROUTER_ERROR=true`)
			.end((err, res) => {
				assert.equal(res.statusCode, 503);
				assert.equal(err.status, 503);
				done();
		});
	});
});
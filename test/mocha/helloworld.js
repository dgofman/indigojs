'use strict';

const superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing HelloWorld example', () => {

	let port;

	before(done => {
		indigo.start(`${__appDir}/examples/helloworld/config/app.json`);
		indigo.logger.error = () => {};
		port = indigo.appconf.get('server:port');
		done();
	});

	after(done => {
		indigo.close(done);
	});

	it('should test app redirect', done => {
		superagent.get(`http://localhost:${port}`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				done();
		});
	});

	it('should test GET', done => {
		superagent.get(`http://localhost:${port}/helloworld/us/index`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test GET default 404 error', done => {
		superagent.get(`http://localhost:${port}/helloworld/us/NoIndex`)
			.end((err, res) => {
				assert.equal(res.statusCode, 404);
				done();
		});
	});
});
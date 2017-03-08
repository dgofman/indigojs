'use strict';

const superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing FirstStep example', () => {

	let port;

	before(done => {
		indigo.start(`${__appDir}/examples/firststep/config/app.json`);
		indigo.logger.error = () => {};
		port = indigo.appconf.get('server:port');
		done();
	});

	after(done => {
		indigo.close(done);
	});

	it('should test GET', done => {
		superagent.get(`http://localhost:${port}/firststep/index`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test GET', done => {
		superagent.get(`http://localhost:${port}/firststep/index`)
			.end((err, res) => {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});
});
'use strict';

const superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing libs/static.js', () => {

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

	it('should test redirect CSS to LESS', done => {
		superagent.get(`http://localhost:${port}/static/css/helloworld.css`)
			.end((err, res) => {
				assert.equal(res.type, 'text/css');
				assert.equal(res.redirects.toString(), `http://localhost:${port}/static/css/helloworld.less`);
				assert.equal(res.header['cache-control'], 'public, max-age=86400');
				done();
		});
	});

	it('should test default cache header value', done => {
		indigo.appconf.server.cache = null;
		superagent.get(`http://localhost:${port}/static/css/common.less`)
			.end((err, res) => {
				assert.equal(res.type, 'text/css');
				assert.ok(res.text.includes('.footer .powered {'));
				assert.equal(res.header['cache-control'], 'public, max-age=3600');
				done();
		});
	});

	it('should test invalid path to static CSS', done => {
		superagent.get(`http://localhost:${port}/static/invalid.css`)
			.end((err, res) => {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test invalid path to static LESS', done => {
		superagent.get(`http://localhost:${port}/static/css/invalid.less`)
			.end((err, res) => {
				assert.equal(res.statusCode, 404);
				done();
		});
	});
});
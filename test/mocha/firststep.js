'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing FirstStep example', function () {

	var port;

	before(function (done) {
		indigo.start(__appDir +  '/examples/firststep/config/app.json');
		port = indigo.appconf.get('server:port');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should test GET', function(done) {
		superagent.get('http://localhost:' + port + '/firststep/index')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test GET', function(done) {
		superagent.get('http://localhost:' + port + '/firststep/index')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});
});

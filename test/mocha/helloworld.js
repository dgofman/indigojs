'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing HelloWorld example', function () {

	before(function (done) {
		var nconf = require('nconf').
				use('file', { file: __appDir +  '/examples/helloworld/config/app.json' });
		indigo.start(nconf);
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should test GET', function(done){
		superagent.get('http://localhost:8686/helloworld/us/index')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});
});

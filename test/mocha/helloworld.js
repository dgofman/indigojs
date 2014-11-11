'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo'),
	nconf = require('nconf').
				use('file', { file: __appDir + '/examples/helloworld/config/app.json' });

describe('Testing HelloWorld example', function () {

	it('should test GET', function(done){
		indigo.start(nconf, function() {
			superagent.get('http://localhost:8686/helloworld/us/index')
				.end(function(err, res) {
					assert.equal(res.statusCode, 200);
					assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
					done();
			});
		});
	});
});

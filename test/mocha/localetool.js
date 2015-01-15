'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing Localization tool', function () {

	before(function (done) {
		indigo.start(__appDir +  '/tools/localization/config/app.json');
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should test GET', function(done){
		superagent.get('http://localhost:8888/localization/en/index')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				done();
		});
	});
});

'use strict';

var indigo = require('../../indigo'),
	assert = require('assert');

describe('Testing indigo.js', function () {

	it('should verify __appDir', function (done) {
		assert.equal(__appDir + 'test/unittest', __dirname);
		done();
	});

	it('should execute error', function (done) {
		indigo.error();
		done();
	});
});
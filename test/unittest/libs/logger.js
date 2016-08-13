'use strict';

var logger = require('../../../libs/logger'),
	assert = require('assert');

describe('libs/logger', function () {

	it('should get default logger level', function (done) {
		var log = logger({get: function() {
			return null;
		}});
		assert.equal(log.getLevel(), 'debug');
		done();
	});

	it('should get info logger lever', function (done) {
		var log = logger({get: function() {
			return 'info';
		}});
		assert.equal(log.getLevel(), 'info');
		done();
	});

	it('should change logger lever', function (done) {
		var log = logger({get: function() {
			return 'info';
		}});
		log.setLevel('error');
		assert.equal(log.getLevel(), 'error');
		done();
	});
});

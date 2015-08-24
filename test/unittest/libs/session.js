'use strict';

var session = require('../../../libs/session');

describe('libs/session', function () {

	it('should generate default session key', function (done) {
		session({ use: function() {} }, //app
				{ get: function() { //appconf
			return null;
		}});
		done();
	});
});

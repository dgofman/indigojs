'use strict';

var routers = require('../../../libs/routers');

describe('libs/routers', function () {

	it('should test directory with non JS files', function (done) {
		routers.loadModule(['/examples/account/config']);
		done();
	});

	it('should test invalid directory', function (done) {
		routers.loadModule(['/examples/account/foo']);
		done();
	});
});

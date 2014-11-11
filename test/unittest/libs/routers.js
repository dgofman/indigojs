'use strict';

var routers = require('../../../libs/routers');

describe('libs/routers', function () {

	it('should validate default router path', function (done) {
		routers.init({
				use: function() {}
			}, {
				get:function() {
					return null;
			}
		});
		done();
	});
});

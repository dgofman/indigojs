'use strict';

var indigo = require(__appDir + '/indigo');

/**
 * @module reqmodel
 * @see {@link libs/reqmodel}
 */
module.exports = function(appconf) {
	var reqmodel = indigo.libs('reqmodel')(appconf);

	return function(req) {
		var model = reqmodel(req);
		model.baseStaticUrl = '/static';
		model.imageBaseUrl = model.baseStaticUrl + '/images';
		return model;
	};
};
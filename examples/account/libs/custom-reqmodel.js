'use strict';

var indigo = require(__appDir + '/indigo');

/**
 * @module reqmodel
 * @see {@link libs/reqmodel}
 */
module.exports = function(appconf) {
	var reqmodel = indigo.libs('reqmodel')(appconf);

	return function(req, contextPath, next) {
		reqmodel(req, contextPath, function() {
			req.model.baseStaticUrl =  '/static';
			req.model.imageBaseUrl = contextPath + req.model.baseStaticUrl + '/images';
			next();
		});
	};
};
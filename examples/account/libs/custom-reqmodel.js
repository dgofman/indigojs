'use strict';

var indigo = require(__appDir + '/indigo');

/**
 * @module reqmodel
 * @see {@link libs/reqmodel}
 */
module.exports = function(appconf, app) {
	var reqmodel = indigo.libs('reqmodel')(appconf, app);

	return function(req, res, next) {
		reqmodel(req, res, function() {
			req.model.baseStaticUrl =  '/static';
			req.model.imageBaseUrl = req.model.contextPath + req.model.baseStaticUrl + '/images';
			next();
		});
	};
};
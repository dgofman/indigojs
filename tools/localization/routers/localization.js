'use strict';

module.exports = function(router, next) {

	return {
		'path': '/localization',
		'controllers': [
			'tools/localization/controllers'
		]
	};
};
'use strict';

module.exports = function(router, next) {

	return {
		'base': '/localization',
		'controllers': [
			'tools/localization/controllers'
		]
	};
};
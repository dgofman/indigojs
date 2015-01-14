'use strict';

module.exports = function() {
	return {
		'base': '{{uri}}',
		'controllers': [
			'{{routers}}/controllers'
		]
	};
};
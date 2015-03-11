'use strict';

require.config({
	baseUrl: '/static/js',

	paths: {
		jquery: 'vendor/jquery-2.1.1'
	}
});

require([
	'views/view'
], function(view){
	view.initialize();
});
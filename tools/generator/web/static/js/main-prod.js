'use strict';

require.config({
	baseUrl: window.__baseStaticPath__ + '/js',

	paths: {
		jquery: 'vendor/jquery-2.1.1.min',
		bootstrap: 'vendor/bootstrap-3.3.2.min'
	},

	shim: {
		bootstrap: {
			deps: ['jquery']
		}
	}
});

require([
	'views/view.min',
	'bootstrap'
], function(view){
	view.initialize();
});
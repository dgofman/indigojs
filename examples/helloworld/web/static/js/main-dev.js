'use strict';

require.config({
	baseUrl: '/static/js',

	paths: {
		jquery: 'vendor/jquery-2.1.1',
		bootstrap: 'vendor/bootstrap-3.3.2'
	},

	shim: {
		bootstrap: {
			deps: ['jquery']
		}
	}
});

require([
	'views/HelloWorldView'
], function(HelloWorldView) {
	HelloWorldView.initialize();
});
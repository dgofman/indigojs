'use strict';

require.config({
	baseUrl: window.top.__baseStaticPath__ + '/js',

	paths: {
		jquery: 'vendor/jquery-3.1.0',
		bootstrap: 'vendor/bootstrap-3.3.2'
	},

	shim: {
		bootstrap: {
			deps: ['jquery']
		}
	},

	callback: function() {
		require([
			'views/view',
			'bootstrap'
		], function(view){
			view.initialize();
		});
	}
});
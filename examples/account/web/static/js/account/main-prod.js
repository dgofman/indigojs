'use strict';

require.config({
	baseUrl: '/static/js',

	paths: {
		jquery: 'vendor/jquery-2.1.1.min',
		bootstrap: 'vendor/bootstrap-3.2.0.min',
		underscore: 'vendor/underscore-1.7.0.min',
		backbone: 'vendor/backbone-1.1.2.min',
		
		userModel: 'account/models/UserModel'
	},
	
	shim: {
		'bootstrap': {
			deps: ['jquery']
		}
	}
});

require.config({
	context: 'templates',
	baseUrl: './templates',
	paths: {
		// Require.js plugins for loading templates
		text: '/static/js/vendor/require-text-2.0.12'
	}
})(['text!login', 'text!reset'], function(login, reset) {
	require([
		'account/router/AccountRouter',
		'bootstrap'
	], function(AccountRouter){
		AccountRouter.initialize(login, reset);
	});
});
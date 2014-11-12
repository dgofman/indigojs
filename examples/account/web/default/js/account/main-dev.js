'use strict';

require.config({
	paths: {
		jquery: '../vendor/jquery-2.1.1',
		bootstrap: '../vendor/bootstrap-3.2.0',
		underscore: '../vendor/underscore-1.7.0',
		backbone: '../vendor/backbone-1.1.2',

		// Require.js plugins for loading templates
		text: '../vendor/require-text-2.0.12',

		//Templates
		login: '../../templates/login',
		reset: '../../templates/reset'
	},

	shim: {
		'bootstrap': {
			deps: ['jquery']
		}
	}
});

// Let's kick off the application
require([
	'router/AccountRouter',
	'bootstrap'
], function(AccountRouter){
	AccountRouter.initialize();
});
'use strict';

require.config({
	paths: {
		jquery: '../vendor/jquery-2.1.1.min',
		bootstrap: '../vendor/bootstrap-3.2.0.min',
		underscore: '../vendor/underscore-1.7.0.min',
		backbone: '../vendor/backbone-1.1.2.min',

		// Require.js plugins for loading templates
	    text: '../vendor/require-text-2.0.12',

	    //Templates
	    login: '/templates/account/login',
	    reset: '/templates/account/reset',
	    forgot: '/templates/account/forgot'
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
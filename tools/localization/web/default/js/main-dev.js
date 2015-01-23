'use strict';

require.config({
	paths: {
		jquery: 'vendor/jquery-2.1.1',
		bootstrap: 'vendor/bootstrap-3.0.2',
		angular: 'vendor/angular-1.3.8',
		jqGrid: 'vendor/jquery.jqGrid-4.7.0',

		gridController: 'controllers/GridController'
	},

	shim: {
		'angular': {
			exports : 'angular'
		},
		'bootstrap': {
			deps: ['jquery']
		},
		'jqGrid': {
			deps: ['jquery']
		}
	}
});

// Let's kick off the application
require([
	'Localization',
	'jqGrid',
	'bootstrap'
], function(Localization) {
	new Localization({el:'.wrapper'});
});
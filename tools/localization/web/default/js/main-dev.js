'use strict';

require.config({
	paths: {
		jquery: 'vendor/jquery-2.1.1',
		angular: 'vendor/angular-1.3.8',
		jqGrid: 'vendor/jquery.jqGrid-4.7.0',

		gridController: 'controllers/GridController',

		socketio: '../../../socket.io/socket.io'
	},

	shim: {
		'socketio': {
			exports: 'io'
		},
		'angular': {
			exports : 'angular'
		},
		'jqGrid': {
			deps: ['jquery']
		}
	}
});

// Let's kick off the application
require([
	'Localization',
	'jqGrid'
], function(Localization) {
	new Localization({el:'.wrapper'});
});
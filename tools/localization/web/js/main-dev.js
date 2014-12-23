'use strict';

require.config({
	paths: {
		jquery: '/js/vendor/jquery-2.1.1',
		angular: '/js/vendor/angular-1.3.8',
		jqGrid: '/js/vendor/jquery.jqGrid-4.7.0',

		gridController: '/js/controllers/GridController',

		socketio: '/socket.io/socket.io'
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
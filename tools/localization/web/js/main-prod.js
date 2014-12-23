'use strict';

require.config({
	paths: {
		jquery: '/js/vendor/jquery-2.1.1.min',
		angular: '/js/vendor/angular-1.3.8.min',
		jqGrid: '/js/vendor/jquery.jqGrid-4.7.0.min',

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
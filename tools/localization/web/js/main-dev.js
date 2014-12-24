'use strict';

require.config({
	paths: {
		jquery: '/js/vendor/jquery-2.1.1',
		underscore: '/js/vendor/underscore-1.7.0',
		backbone: '/js/vendor/backbone-1.1.2',

		socketio: '/socket.io/socket.io.js'
	},

	shim: {
		'socketio': {
			exports: 'io'
		}
	}
});

// Let's kick off the application
require([
	'Localization'
], function(Localization) {
	new Localization({el:'.wrapper'});
});
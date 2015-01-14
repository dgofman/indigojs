'use strict';

require.config({
	paths: {
		jquery: 'vendor/jquery-2.1.1.min',
	}
});

require([
	'views/view'
], function(view){
	view.initialize();
});
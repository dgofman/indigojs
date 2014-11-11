'use strict';

require.config({
	paths: {
		jquery: 'vendor/jquery-2.1.1'
	}
});

// Let's kick off the application
require([
'views/HelloWorldView'
], function(HelloWorldView){
	HelloWorldView.initialize();
});
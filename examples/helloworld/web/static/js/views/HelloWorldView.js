'use strict';

define([
	'jquery'
], function($){
	return {
		initialize: function() {
			$('h1').html(window.HelloWorld.text).css({'color':'red', 'text-align': 'center'});
		}
	};
});
'use strict';

define([
	'jquery'
], function($){
	return {
		initialize: function() {
			$('h1').animate({opacity: 1}, 'slow');
		}
	};
});
'use strict';

define([
	'jquery',
	'utils/tooltip',
	'bootstrap'
], function($, tooltip) {
	var container, view;
	return view = {
		initialize: function() {
			tooltip.initialize();

			container = $('.helloworld');

			container.find('h1').html(window.HelloWorld.text).css({'color':'red', 'text-align': 'center'});

			var dropdown = container.find('.dropdown div');
			container.find('.dropdown-menu li').click(function(e) {
				dropdown.contents()[0].nodeValue = $(e.currentTarget).text();
			});

			container.find('.ellipsis2 .ellipsis').click(function(e) {
				if (e.target.tagName !== 'SPAN') {
					alert(e.currentTarget.textContent);
				}
			});
		}
	};
});
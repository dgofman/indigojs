/*jshint unused:false*/
function Accordion($, indigo) {
	'use strict';
	indigo.debug('Init Accordion');

	return {
		register: function(el) {
			var inputs = $('>div>div[template]', el);
			for (var i = 0; i < inputs.length; i++) {
				var input = inputs.eq(i);
				input.html($('script' + input.attr('template')).html() || '');
			}
		}
	};
}
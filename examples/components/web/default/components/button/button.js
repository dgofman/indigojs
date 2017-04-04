/*jshint unused:false*/
function Button($, indigo) {
	'use strict';
	indigo.debug('Init Button');

	return {
		init: function(el) {
			this.$button = $('>button', el);
			this.onEvent('click', this.$button);
		},

		label: {
			get: function() {
				return this.$button.html();
			},
			set: function(value) {
				this.$button.html(value);
			}
		}
	};
}
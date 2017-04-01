/*jshint unused:false*/
function Input($, indigo) {
	'use strict';
	indigo.debug('Init Input');

	return {
		init: function(el, self) {
			self.$input = $('>input', el).event('change', function() {
				self.value = self.$input.val();
			});
		},

		value: {
			get: function() {
				return this.$input.val();
			},
			set: function(value) {
				this.$input.val(value);
			}
		}
	};
}
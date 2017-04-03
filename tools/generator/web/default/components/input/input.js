/*jshint unused:false*/
function Input($, indigo) {
	'use strict';
	indigo.debug('Init Input');

	return {
		register: function(el) {
			$('>div', el).event('focus', function(e) {
				setTimeout(function() {
					$('>input', e.currentTarget).focus();
				}, 500);
			});
		},

		init: function(el, self) {
			self.$input = $('>div>input', el).event('change', function() {
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
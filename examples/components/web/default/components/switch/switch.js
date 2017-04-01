/*jshint unused:false*/
function Switch($, indigo) {
	'use strict';
	indigo.debug('Init Switch');

	return {
		init: function(el, self) {
			self.$input = $('>label>input', el).event('change', function() {
				self.checked = self.$input.is(':checked');
			});
		},

		checked: {
			get: function() {
				return this.$input.prop('checked');
			},
			set: function(value) {
				this.$input.prop('checked', value);
			}
		}
	};
}
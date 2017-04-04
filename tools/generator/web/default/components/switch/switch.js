/*jshint unused:false*/
function Switch($, indigo) {
	'use strict';
	indigo.debug('Init Switch');

	return {
		init: function(el, self) {
			self.$input = $('>label>input', el).event('change.check', function() {
				self.checked = self.$input.is(':checked');
			});
			this.onEvent('change', self.$input);
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
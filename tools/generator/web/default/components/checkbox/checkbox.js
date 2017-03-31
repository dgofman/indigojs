function($, indigo) {
	indigo.debug('Init Checkbox');

	return {
		init: function(el, self) {
			self.$input = $('>label>input', el).event('change', function() {
				self.checked = self.$input.is(':checked');
			});
			self.$label = $('>label>u', el);
		},

		checked: {
			get: function() {
				return this.$input.prop('checked');
			},
			set: function(value) {
				this.$input.prop('checked', value);
			}
		},

		label: {
			get: function() {
				return this.$label.html();
			},
			set: function(value) {
				this.$label.html(value);
			}
		}
	};
}
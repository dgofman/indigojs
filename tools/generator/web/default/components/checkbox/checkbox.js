function($, indigo) {
	indigo.debug('Init Checkbox');

	return {
		init: function(self, el) {
			var input = $('>label>input', el).event('change', function() {
				self.checked = input.is(':checked');
			});
		},

		checked: {
			get: function() {
				return $('>label>input', this.el).prop('checked');
			},
			set: function(value) {
				$('>label>input', this.el).prop('checked', value);
			}
		},

		label: {
			get: function() {
				return $('>label>u', this.el).html();
			},
			set: function(value) {
				$('>label>u', this.el).html(value);
			}
		}
	};
}
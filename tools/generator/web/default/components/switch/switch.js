function($, indigo) {
	indigo.debug('Init Switch');

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
		}
	};
}
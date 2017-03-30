function($, indigo) {
	indigo.debug('Init Input');

	return {
		init: function(self, el) {
			var input = $('>input', el).event('change', function() {
				self.value = input.val();
			});
		},

		value: {
			get: function() {
				return $('>input', this.el).val();
			},
			set: function(value) {
				$('>input', this.el).val(value);
			}
		}
	};
}
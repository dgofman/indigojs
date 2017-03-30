function($, indigo) {
	indigo.debug('Init Button');

	return {
		label: {
			get: function() {
				return $('>button', this.el).html();
			},
			set: function(value) {
				$('>button', this.el).html(value);
			}
		},

		disabled: {
			get: function() {
				return !!$('>button', this.el).attr('disabled');
			},
			set: function(value) {
				indigo.attr($('>button', this.el), 'disabled', value);
			}
		},
	};
}
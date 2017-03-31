function($, indigo) {
	indigo.debug('Init Button');

	return {
		init: function(el, self) {
			self.$button = $('>button', el);
			Object.defineProperty(self, 'click', {
				set: function(hanlder) {
					self.$button.event('click', hanlder);
				}
			});
		},

		label: {
			get: function() {
				return this.$button.html();
			},
			set: function(value) {
				this.$button.html(value);
			}
		},

		disabled: {
			get: function() {
				return !!this.$button.attr('disabled');
			},
			set: function(value) {
				indigo.attr(this.$button, 'disabled', value);
			}
		}
	};
}
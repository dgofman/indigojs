/*jshint unused:false*/
function Input($, indigo) {
	'use strict';
	indigo.debug('Init Input');

	return {
		register: function(el) {
			$('>div', el).event('focus.input', function(e) {
				setTimeout(function() {
					$('>input', e.currentTarget).focus();
				}, 10);
			});
		},

		init: function(el, self) {
			self.$input = $('>div>input', el).event('change.val', function() {
				self.value = self.$input.val();
			});
			this.onEvent('change', self.$input);
			this.onEvent('enter', self.$input, function(handler, uid) {
				self.$input.event('keyup.' + uid, function (e) {
					if (e.which === 13) {
						handler.call(self, e);
					}
				});
			});
		},

		value: {
			get: function() {
				return this.$input.val();
			},
			set: function(value) {
				this.$input.val(value);
			}
		},

		focus: function() {
			this.$input.focus();
		}
	};
}
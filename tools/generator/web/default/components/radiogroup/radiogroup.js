/*jshint unused:false*/
function RadioGroup($, indigo) {
	'use strict';
	indigo.debug('Init RadioGroup');

	return {
		init: function(el, self) {
			this.$radios = $('[cid=radio]>label>input[name="' + el.attr('id') + '"]');
			this.$labels = this.$radios.parent();
			this.$radios.event('change.value', function (e) {
				self.value = $(e.currentTarget).val();
			});
		},

		value: {
			get: function() {
				return this.$radios.filter(':checked').val();
			},
			set: function(value) {
				this.$radios.filter('[value="' + value + '"]').prop('checked', true);
			}
		},

		label: {
			get: function() {
				return this.$radios.filter(':checked').parent().text();
			},
			set: function(value) {
				this.$radios.filter(':checked').parent().text(value);
			}
		},

		class: function(name, isAdd) {
			return isAdd ? this.$labels.addClass(name) : this.$labels.removeClass(name);
		}
	};
}
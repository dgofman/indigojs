/*jshint unused:false*/
function Dropdown($, indigo, selector) {
	'use strict';
	indigo.debug('Init Dropdown');

	$(window).on('click.dropdown', function() {
		$(selector + '>ul').removeClass('open');
	});

	return {
		register: function(el) {
			var menu = $('>ul', el);
			var div = $('>div', el).event('click.open', function(e) {
				e.stopPropagation();
				var isOpen = menu.hasClass('open');
				$(selector + '>ul').removeClass('open');
				menu.toggleClass('open', !isOpen);
			});

			$(el).event('keypress.enter', function (e) {
				if (!el.attr('disabled') && e.which === 13) {
					div.trigger('click');
				}
			});
		},

		init: function(el) {
			this.initItems(el, this);
			this.onEvent('change', this.$el);
			this.$box = $('>div', el);
			this.$prompt = this.$box.find('>div');
			this.$popup = $('>ul', el);
		},

		initItems: function(el, self) {
			self.$items = $('>ul>li', el).event('click.li', function(e) {
				self.index = $(e.currentTarget).index();
				el.trigger('change', self);
			});
		},

		indexByText: function(label) {
			var index = 0;
			this.$items.each(function(i, li) {
				if ($(li).text() === label) {
					index = i;
					return false;
				}
			});
			return this.index = index;
		},

		index: {
			get: function() {
				return Number(this.$box.attr('selectedIndex')) || 0;
			},
			set: function(value) {
				this.$box.attr('selectedIndex', value);
				this.option = this.$items.eq(value);
			}
		},

		option: {
			get: function() {
				return this.$items.eq(this.index);
			},
			set: function(value) {
				this.index = value.index();
				this.prompt = value.html();
			}
		},

		prompt: {
			get: function() {
				return this.$prompt.html();
			},
			set: function(value) {
				this.$prompt.html(value);
			}
		},

		disabled: {
			get: function() {
				return !!this.$el.attr('disabled');
			},
			set: function(value) {
				this.$popup.removeClass('open');
				indigo.attr(this.$el, 'disabled', value);
			}
		},

		open: {
			get: function() {
				return this.$popup.hasClass('open');
			},
			set: function(value) {
				indigo.class(this.$popup, 'open', value);
			}
		}
	};
}
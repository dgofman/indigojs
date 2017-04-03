/*jshint unused:false*/
function Dropdown($, indigo, selector) {
	'use strict';
	indigo.debug('Init Dropdown');

	$(window).on('click.dropdown', function() {
		$(selector + '>ul').removeClass('open');
	});

	return {
		register: function(el) {
			var menu = $('>ul', el),
				dropdown = $('>div', el),
				initMenu = function(isOpen) {
					if (isOpen) {
						menu.event('click', function(e) {
							var li = $(e.target).closest('li');
							dropdown.attr('selectedIndex', li.index());
							dropdown.find('>div').html(li.html());
							el.trigger('change', [li.index(), li, dropdown]);
						});
					}
				};
			initMenu(menu.hasClass('open'));

			var div = $('>div', el).event('click', function(e) {
				e.stopPropagation();
				var isOpen = menu.hasClass('open');
				$(selector + '>ul').removeClass('open');
				menu.toggleClass('open', !isOpen);
				initMenu(!isOpen);
			});

			$(el).event('keypress', function (e) {
				if (!el.attr('disabled') && e.which === 13) {
					div.trigger('click');
				}
			});
		},

		init: function(el, self) {
			this.initItems(el, this);
			this.$box = $('>div', el);
			this.$prompt = this.$box.find('>div');
			this.$popup = $('>ul', el);

			Object.defineProperty(this, 'change', {
				set: function(hanlder) {
					self.el.event('change', hanlder);
				}
			});
		},

		initItems: function(el, self) {
			self.$items = $('>ul>li', el).event('click', function(e) {
				self.index = $(e.currentTarget).index();
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
				return !!this.el.attr('disabled');
			},
			set: function(value) {
				this.$popup.removeClass('open');
				indigo.attr(this.el, 'disabled', value);
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
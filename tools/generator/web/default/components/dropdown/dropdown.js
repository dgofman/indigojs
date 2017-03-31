function($, indigo, selector) {
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
							dropdown.find('>div').text(li.text());
							el.trigger('change', [li.index(), li, dropdown]);
						});
					}
				};
			initMenu(menu.hasClass('open'));

			var span = $('>div>span', el).event('click', function(e) {
				e.stopPropagation();
				var isOpen = menu.hasClass('open');
				$(selector + '>ul').removeClass('open');
				menu.toggleClass('open', !isOpen);
				initMenu(!isOpen);
			});

			$('>div', el).keypress(function (e) {
				if (e.which === 13) {
					span.trigger('click');
				}
			});
		},

		init: function(el) {
			this.initItems(el, this);
			this.$box = $('>div', el);
			this.$prompt = this.$box.find('>div');
			this.$popup = $('>ul', el);
		},

		initItems: function(el, self) {
			self.$items = $('>ul>li', el).event('click', function(e) {
				self.option = $(e.currentTarget);
			});
		},

		indexByText: function(label) {
			var index = -1;
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
				return Number(this.$box.attr('selectedIndex')) || -1;
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
				this.prompt = value.text();
			}
		},

		prompt: {
			get: function() {
				return this.$prompt.text();
			},
			set: function(value) {
				this.$prompt.text(value);
			}
		},

		disabled: {
			get: function() {
				return !!this.$box.attr('disabled');
			},
			set: function(value) {
				this.$popup.removeClass('open');
				indigo.attr(this.$box, 'disabled', value);
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
	}
}
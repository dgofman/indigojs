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

			$('>div>span', el).event('click', function(e) {
				e.stopPropagation();
				var isOpen = menu.hasClass('open');
				$(selector + '>ul').removeClass('open');
				menu.toggleClass('open', !isOpen);
				initMenu(!isOpen);
			});
		},

		init: function(self, el) {
			$('>ul>li', el).event('click', function(e) {
				self.option = $(e.currentTarget);
			});
		},

		index: {
			get: function() {
				return Number($('>div', this.el).attr('selectedIndex')) || -1;
			},
			set: function(value) {
				$('>div', this.el).attr('selectedIndex', value);
				this.option = $('>ul>li', this.el).eq(value);
			}
		},

		option: {
			get: function() {
				return $('>ul>li', this.el).eq(this.index);
			},
			set: function(value) {
				this.index = value.index();
				this.label = value.text();
			}
		},

		label: {
			get: function() {
				return $('>div', this.el).find('>div').text();
			},
			set: function(value) {
				$('>div', this.el).find('>div').text(value);
			}
		},

		disabled: {
			get: function() {
				return !!$('>div', this.el).attr('disabled');
			},
			set: function(value) {
				$('>ul', this.el).removeClass('open');
				indigo.attr($('>div', this.el), 'disabled', value);
			}
		},

		open: {
			get: function() {
				return $('>ul', this.el).hasClass('open');
			},
			set: function(value) {
				indigo.class($('>ul', this.el), 'open', value);
			}
		},

		indexByLabel: function(label) {
			var index = -1;
			$('>ul>li', this.el).each(function(i, li) {
				if ($(li).text() === label) {
					index = i;
					return false;
				}
			});
			return this.index = index;
		}
	}
}
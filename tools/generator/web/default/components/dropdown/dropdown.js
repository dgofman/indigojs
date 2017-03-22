function($, indigo, selector) {
	indigo.debug('Init Dropdown');

	$(window).on('click.dropdown', function(e) {
		$(selector + '>.dropdown-menu').removeClass('open');
	});

	return {
		register: function(el, model) {
			var menu = $('.dropdown-menu', el),
				dropdown = $('.dropdown-toggle', el),
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

			$('.dropdown-toggle>span', el).event('click', function(e) {
				e.stopPropagation();
				var isOpen = menu.hasClass('open');
				$(selector + '>.dropdown-menu').removeClass('open');
				menu.toggleClass('open', !isOpen);
				initMenu(!isOpen);
			});
		},

		selectedIndex: function(index) {
			if (index === undefined) {
				return Number($('.dropdown-toggle', this.el).attr('selectedIndex'));
			} else {
				var li = $('.dropdown-menu>li', this.el).eq(index);
				$('.dropdown-toggle', this.el).attr('selectedIndex', index).find('>div').text(li.text());
				return this;
			}
		},

		val: function(index) {
			if (index === undefined) {
				index = this.selectedIndex();
			}
			return $('.dropdown-menu>li', this.el).eq(index);
		}
	}
}
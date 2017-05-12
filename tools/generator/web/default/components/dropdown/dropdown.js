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
			}),
			prompt = div.find('>div');

			$(el).event('keypress.enter', function (e) {
				if (!el.attr('disabled') && e.which === 13) {
					div.trigger('click');
				}
			});

			if (!prompt.html()) {
				prompt.html(prompt.attr('prompt'));
			}
		},

		init: function(el) {
			this.initItems(el, this);
			this.onEvent('change', el);
			this._data = [];
			this.$box = $('>div', el);
			this.$prompt = this.$box.find('>div');
			this.$popup = $('>ul', el);
			this.dataField = this.$box.attr('df');
			this.labelField = this.$box.attr('lf') || 'label';
			this.itemRenderer = $('script[rel=ir]', el).html() || '<li>%LABEL%</li>';
			this.labelRenderer = $('script[rel=lr]', el).html() || '%LABEL%';
			this.selectedValue = null;

			if (this.index !== -1 && this.$items.length) {
				this.option = this.$items.eq(0);
			}

			this.define('selectedItem', function() {
				return this.data[this.index] || {};
			});
			this.define('selectedLabel', function() {
				return this.selectedItem[this.labelField];
			});
			this.define('selectedData', function() {
				return this.selectedItem[this.dataField];
			});
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

		createItem: function(row) {
			return this.itemRenderer.replace('%LABEL%', row[this.labelField] || row).replace('%DATA%', row[this.dataField]);
		},

		createLabel: function(label) {
			return this.labelRenderer.replace('%LABEL%', label);
		},

		findOption: function(value) {
			this.option = this.$popup.find('li:contains("' + value + '")');
		},

		data: {
			get: function() {
				return this._data;
			},
			set: function(value) {
				var self = this;
				this._data = value || [];
				this.$popup.empty();
				this._data.forEach(function(row) {
					self.$popup.append(self.createItem(row));
				});
				if (this._data.length) {
					this.value = this.selectedValue;
				} else {
					this.index = -1;
				}
				if (this.index === -1) {
					this.value = null;
				}
				this.initItems(this.$el, this);
			}
		},

		index: {
			get: function() {
				var val = Number(this.$box.attr('selectedIndex'));
				return isNaN(val) ? -1 : val;
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
				this.value = value.text();
				this.label = value.html();
			}
		},

		value: {
			get: function() {
				return this.selectedValue;
			},
			set: function(value) {
				this.selectedValue = value;
				this.findOption(value);
			}
		},

		label: {
			get: function() {
				return this.$prompt.html();
			},
			set: function(value) {
				this.$prompt.html(this.createLabel(value || this.prompt || ''));
			}
		},

		prompt: {
			get: function() {
				return this.$prompt.attr('prompt');
			},
			set: function(value) {
				this.$prompt.attr('prompt', value);
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
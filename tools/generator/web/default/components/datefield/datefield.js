/*jshint unused:false*/
function DateField($, indigo, selector) {
	'use strict';
	indigo.debug('Init DateField');

	var locales = window.indigoLocales || {},
		datefield = locales.datefield || {
			days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
			],
			months: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			]
		};

	$(window).on('click.dropdown', function() {
		$(selector + '>.calendar').removeClass('open');
	});

	var getSelectedDate = function(ts) {
			return ts ? new Date(ts) : null;
		};

	return {
		register: function(el) {
			var self = this,
				calendar = $('>.calendar', el),
				prompt = $('>div>div', el);
			$('>div>span', el).event('click.open', function(e) {
				e.stopPropagation();
				var isOpen = calendar.hasClass('open');
				$(selector + '>.calendar').removeClass('open');
				calendar.toggleClass('open', !isOpen);
			});
			calendar.event('click.prevent', function(e) {
				e.stopPropagation();
			});
			this.timeStamp = Number($('>div, el').attr('ts'));
			this.initItems(el, calendar, this.timeStamp);

			el.event('change.register', function(e, ts) {
				prompt.html(self.formatDate(self.timeStamp = ts));
			});
		},

		init: function(el, self) {
			this.onEvent('change', el);
			this.$box = $('>div', el);
			this.$prompt = this.$box.find('>div');
			this.$calendar = $('>.calendar', el);
			el.event('change.register', function(e, ts) {
				self.value = ts;
			});
		},

		initItems: function(el, calendar, ts) {
			var self = this,
				table = $('<table></table>'),
				now = new Date(),
				sd = getSelectedDate(this.timeStamp),
				d = ts ? new Date(ts) : new Date(),
				y = d.getFullYear(), m = d.getMonth(),
				daysInMonth = 32 - new Date(y, m, 32).getDate(),
				firstDate = new Date(y, m, 1).getDay(),
				tds = [], trs = [], date = '';
			d.setHours(0, 0, 0, 0);
			for (var c = 0; c < 7; c++) {
				tds.push('<th>' + datefield.days[c] + '</th>');
			}
			trs.push('<tr>' + tds.join('') + '</tr>');
			loop:
			while(true) {
				tds = [];
				for (c = 0; c < 7; c++) {
					if (c >= firstDate || date !== '') {
						date = date || 0;
						date++;
					}
					if (sd && y === sd.getFullYear() && m === sd.getMonth() && date === sd.getDate()) {
						tds.push('<td class="selected">' + date + '</td>');
					} else if (y === now.getFullYear() && m === now.getMonth() && date === now.getDate()) {
						tds.push('<td class="now">' + date + '</td>');
					} else {
						tds.push('<td>' + date + '</td>');
					}
					if (date >= daysInMonth) {
						break loop;
					}
				}
				trs.push('<tr>' + tds.join('') + '</tr>');
			}
			for (c = c + 1; c < 7; c++) {
				tds.push('');
			}
			trs.push('<tr>' + tds.join('') + '</tr>');
			table.html(trs.join('\n'));

			calendar.empty()
				.append('<h1 unselectable="on"><i/>' + datefield.months[m] + ' ' + y + '<u/></h1>')
				.append(table);

			calendar.find('i').click(function() {
				self.initItems(el, calendar, d.setMonth(m - 1));
			});

			calendar.find('u').click(function() {
				self.initItems(el, calendar, d.setMonth(m + 1));
			});

			tds = calendar.find('td').click(function(e) {
				tds.removeClass('selected');
				calendar.removeClass('open');
				el.trigger('change', d.setDate(Number($(e.currentTarget).addClass('selected').text())));
			});

			return d;
		},

		formatDate: function(ts) {
			var d = getSelectedDate(ts);
			return d ? (d.toLocaleDateString || d.toDateString).call(d) : '';
		},

		value: {
			get: function() {
				return this.timeStamp;
			},
			set: function(value) {
				this.timeStamp = value;
				this.$prompt.html(this.formatDate(value) || this.prompt || '');
				this.initItems(this.$el, this.$calendar, value);
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
				this.$calendar.removeClass('open');
				indigo.attr(this.$el, 'disabled', value);
			}
		},

		selectedDate: {
			get: function() {
				return getSelectedDate(this.value);
			},
			set: function(value) {
				this.value = value ? value.getTime() : NaN;
			}
		},

		open: {
			get: function() {
				return this.$calendar.hasClass('open');
			},
			set: function(value) {
				indigo.class(this.$calendar, 'open', value);
			}
		}
	};
}
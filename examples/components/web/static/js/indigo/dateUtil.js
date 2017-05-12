'use strict';

define([
], function() {

	return {
		inFormats: {
			'YYYY_MM_DD_HH_MM_SS': /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/ /*YYYY-MM-DD HH:MM:SS*/
		},

		parseDate: function(str, inFormat) {
			var regexp = this.inFormats[inFormat] || this.inFormats[inFormat = 'YYYY_MM_DD_HH_MM_SS'],
				match = str.match(regexp);
			if (inFormat === 'YYYY_MM_DD_HH_MM_SS' && match && match.length === 7) {
				return new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
			} else {
				return null;
			}
		},

		formatDate: function(locale, date, outFormat, inFormat) {
			if (!isNaN(parseInt(date))) {
				date = new Date(parseInt(date));
			} else if (typeof(date) === 'string') {
				date = this.parseDate(date, inFormat);
			}
			if (date instanceof Date) {
				return this.dateToString(locale, date, outFormat || locale.dateFormat);
			} else {
				return '';
			}
		},

		dateOrToday: function(locale, date, dateFormat, timeFormat) {
			if (!isNaN(parseInt(date))) {
				date = new Date(parseInt(date));
			} else if (typeof(date) === 'string') {
				date = this.parseDate(date);
			}
			if (date instanceof Date) {
				var oneDay = this.toMilliSeconds(1);
				if (Math.abs(new Date().getTime() - date.getTime()) < oneDay) {
					return this.dateToString(locale, date, timeFormat, true);
				} else {
					return this.dateToString(locale, date, dateFormat);
				}
			} else {
				return '';
			}
		},

		toMilliSeconds: function(day) {
			return day * 24 * 60 * 60 * 1000;
		},

		dateToString: function(locale, date, outFormat, isTime) {
			outFormat = outFormat || (isTime ? this.localeTimeFormat(locale.timeFormat) : this.localeDateFormat(locale.dateFormat));

			if(date === undefined || date === null) {
				return '';
			} else if (!isNaN(parseInt(date))) {
				date = new Date(parseInt(date));
			}
			var days = locale.days || [], months = locale.months || [], months_abr = locale.months_abr || [],
				month = date.getMonth() + 1,
				hours = outFormat.indexOf('{A}') !== -1 && date.getHours() > 12 ? date.getHours() - 12 : date.getHours();

			outFormat = outFormat.replace('{DD}', days[date.getDay()]); //Tuesday
			outFormat = outFormat.replace('{dd}', date.getDate() > 9 ? date.getDate() : '0' + date.getDate()); //02
			outFormat = outFormat.replace('{d}', date.getDate()); //2
			outFormat = outFormat.replace('{MM}', months[date.getMonth()]); //January
			outFormat = outFormat.replace('{M}', months_abr[date.getMonth()]); //Jan
			outFormat = outFormat.replace('{mm}', month > 9 ? month : '0' + month); //01
			outFormat = outFormat.replace('{m}', month); //1
			outFormat = outFormat.replace('{yy}', date.getFullYear()); //2016
			outFormat = outFormat.replace('{y}', String(date.getFullYear()).substring(2)); //16

			outFormat = outFormat.replace('{hh}', hours > 9 ? hours : '0' + hours);
			outFormat = outFormat.replace('{h}', hours);
			outFormat = outFormat.replace('{min}', date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());
			outFormat = outFormat.replace('{sec}', date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds());
			outFormat = outFormat.replace('{A}', date.getHours() >= 12 ? locale.time_pm : locale.time_am);
			return outFormat;
		},

		localeDateFormat: function(dateFormat) {
			return dateFormat || '{dd} {M}, {yy}';
		},

		localeTimeFormat: function(timeFormat) {
			return timeFormat || '{hh}:{min}:{sec} {A}';
		}
	};
});

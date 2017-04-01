/*jshint unused:false*/
function Image($, indigo) {
	'use strict';
	indigo.debug('Init Image');

	return {
		init: function(el) {
			this.$node = $('>*', el);
			this.isIMG = this.$node.prop('tagName') === 'IMG';
		},

		url: {
			get: function() {
				return this.isIMG ? this.$node.prop('src') : this.$node.css('background-image').replace(/(url\(|\)|'|")/gi, '');
			},
			set: function(value) {
				return this.isIMG ? this.$node.prop('src', value) : this.$node.css('background-image', 'url("' + value + '")');
			}
		}
	};
}
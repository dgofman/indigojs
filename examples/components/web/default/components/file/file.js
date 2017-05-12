/*jshint unused:false*/
function File($, indigo) {
	'use strict';
	indigo.debug('Init File');

	return {
		fieldName: 'file',
		fileName: null,

		init: function(el, self) {
			self.$input = $('>input', el).event('change.file', function() {
				if (!this.files.length) {
					return;
				}
				var formData = new window.FormData(),
					file = this.files[0],
					ext = file.name.split('.').pop().toLowerCase();
				this.value = null;
				formData.append(self.fieldName || 'file', file);
				self.load(function(fileName) {
					self.file = fileName;
				}, formData, ext, file);
			});
		},

		field: {
			get: function() {
				return this.fieldName;
			},
			set: function(value) {
				this.fieldName = value;
			}
		},

		file: {
			get: function() {
				return this.fileName;
			},
			set: function(value) {
				this.fileName = value;
			}
		},

		load: function(calback, formData, ext, file) {
			calback(file.name);
		}
	};
}
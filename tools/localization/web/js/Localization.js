'use strict';

define([
	'jquery',
	'backbone',
	'socketio'
], function($, Backbone, io) {

	var socket = null;

	return Backbone.View.extend({
		events: {
			'click .submit': 'submit'
		},

		initialize: function() {
			this.div = $(this.el);

			socket = io.connect();
			socket.on('localize', function(data) {
				this.div.find('#msg').val(data);
			});
		},

		submit: function(e) {
			e.preventDefault();
			socket.emit('localize', 'TO DO');
		}
	});
});
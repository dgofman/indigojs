'use strict';

define([
	'jquery',
	'backbone',
	'userModel'
], function($, Backbone, User){

	return Backbone.View.extend({
		events: {
			'submit form.reset-form': 'submit',
			'click .cancel': 'cancel'
		},

		initialize: function(options) {
			this.div = $(options.el);
			this.template = options.template;
		},

		render: function () {
			this.div.html(this.template);
		},

		cancel: function(e) {
			e.preventDefault();
			Backbone.history.navigate(null, true);
		},

		submit: function(e) {
			e.preventDefault();

			User.submitUser(this.div.find('.error_message'),
				{
					email: this.div.find('#email').val(),
				}, function(error, model) {
					if(!error) {
						alert(window.Indigo.messages.resetpwd + ' ' + model.get('first') + ' ' + model.get('last'));
					}
				}, '/reset'
			);
		}
	});
});
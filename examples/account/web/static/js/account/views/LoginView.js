'use strict';

define([
	'jquery',
	'backbone',
	'userModel'
], function($, Backbone, User){

	return Backbone.View.extend({
		events: {
			'submit form.login-form': 'submit'
		},

		initialize: function(options) {
			this.div = $(options.el);
			this.template = options.template;
		},

		render: function () {
			this.div.html(this.template);
		},

		submit: function(e) {
			e.preventDefault();

			var email = this.div.find('#email'), 
				password = this.div.find('#password');

			User.submitUser(this.div.find('.error_message'),
				{
					email: email.val(),
					password: password.val()
				}, function(error, model) {
					password.val(''); //clean password
					if(!error) {
						alert(window.Indigo.messages.greeting + ' ' + model.get('email'));
					}
				}
			);
		}
	});
});
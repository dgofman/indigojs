'use strict';

define([
	'jquery',
	'backbone',
	'models/UserModel',
	'text!login' 
], function($, Backbone, User, template){

	return Backbone.View.extend({
		events: {
			'submit form.login-form': 'submit'
		},

		initialize: function() {
			this.div = $(this.el);
		},

		render: function () {
			this.div.html(template);
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
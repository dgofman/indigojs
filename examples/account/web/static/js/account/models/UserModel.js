'use strict';

define([
		'backbone'
	], function(Backbone) {
		var UserModel =  Backbone.Model.extend({
	});

	//static function
	UserModel.submitUser = function(message, data, callback, url) {

		message.html(''); //clean old messages

		var user = new UserModel();
		user.url = '/account' + (url || '/login');

		user.save(data, {
			success : function(model, response, options) {
				callback(null, model, response, options);
			},
			error : function(model, xhr, options) {
				if (xhr.status === 400) {
						message.html(xhr.responseJSON.error);
				} else {
						alert("ERROR: " + xhr.responseText);
				}
				callback(xhr, model, options);
			}
		});
	};

	return UserModel;
});
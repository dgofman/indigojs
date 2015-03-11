'use strict';

define([
	'backbone',
	'models/UserModel'
], function(Backbone, User){
	var UserCollection = Backbone.Collection.extend({
		model: User,
		url: '/login'
	});
	return UserCollection;
});
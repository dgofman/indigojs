'use strict';

define([
  'backbone',
  'views/LoginView', 
  'views/ResetView'
], function (Backbone, LoginView, ResetView) {
  
  var el = '.wrapper',
    loginView, resetView,
    AccountRouter = Backbone.Router.extend({
      routes: {
        'resetPassword': 'resetAction',
        'forgotPassword': 'forgotPassword',
        '*actions': 'defaultAction'
      },
      resetAction: function () {
        console.log("reset route");
        resetView.render();
      },
      defaultAction: function () {
        console.log("default route");
        loginView.render();
      }
  });

  var initialize = function(){
    console.log("account/router/AccountRouter::initialize");

    //Create views
    loginView = new LoginView({el:el});
    resetView = new ResetView({el:el});
    
    new AccountRouter();

    Backbone.history.start();
  };

  return {
    initialize: initialize
  };
});
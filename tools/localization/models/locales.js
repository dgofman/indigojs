'use strict';

var mongoose = require('mongoose');

var locales = new mongoose.Schema({
	code:  String,
	key:   String,
	value: String
});

module.exports = mongoose.model('Locale', locales);
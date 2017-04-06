'use strict';

define(['./errcode'], function(ErrCode) {
	var _ = function(model, verifyByName) {
		this.model = model;
		this.verifyByName = verifyByName; //optional
		this.errors = [];
	};
	_.prototype = {
		addError: function(name, code, details) {
			this.errors.push(new ErrCode(name, code, details));
			return (this.verifyByName !== false && this.verifyByName !== name); //skip error result
		},

		isValid: function() {
			return this.errors.length === 0;
		},

		isError: function() {
			return this.errors.length !== 0;
		},

		getErrors: function() {
			return this.errors;
		},

		minmax: function(name, min, max) {
			var val = this.model[name];
			if (typeof val !== 'string') {
				return this.addError(name, ErrCode.INVALID_VALUE);
			}
			val = val.trim();
			if (val.length < min) {
				return this.addError(name, ErrCode.INVALID_MIN_LENGTH);
			}
			if (max && val.length > max) {
				return this.addError(name, ErrCode.INVALID_MAX_LENGTH);
			}
			return true;
		}
	};
	return _;
});
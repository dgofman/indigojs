'use strict';

define([], function() {
	var _ = function(name, code) {
		this.name = name;
		this.code = code;
	};
	_.INVALID_VALUE  = 0;
	_.INVALID_MIN_LENGTH = 1;
	_.INVALID_MAX_LENGTH = 1;
	return _;
});
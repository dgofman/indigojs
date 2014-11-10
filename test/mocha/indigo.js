'use strict';

var superagent = require('superagent'),
	assert = require('assert');

describe('Testing Account Pages', function () {

	it('should request to US login page', function(done){
		superagent.get('http://localhost:8585/account/us/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should load RU login template', function(done){
		superagent.get('http://localhost:8585/account/ru/templates/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
				done();
		});
	});

	it('should test redirect to default/common resources', function(done){
		superagent.get('http://localhost:8585/account/en-us/js/account/models/userModel.js')
			.redirects(0)
			.end(function(err, res) {
				assert.equal(res.statusCode, 302);
				assert.equal(res.headers['location'], '/default/js/account/models/userModel.js');
				done();
		});
	});

});

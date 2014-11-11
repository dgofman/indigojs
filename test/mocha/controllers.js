'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	users = require('../../examples/account/models/account').users,
	indigo = require('../../indigo');

describe('Testing Account Controllers', function () {

	before(function (done) {
		var nconf = require('nconf').
				use('file', { file: __appDir +  '/examples/account/config/app.json' });
		indigo.start(nconf);
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	var userEmail = 'user@indigo.js',
		userDetails = users[userEmail].details,
		adminEmail = 'admin@indigo.js',
		adminDetails = users[adminEmail].details,
		password = '12345';

	it('should get user details', function(done){
		superagent.post('http://localhost:8585/account/login')
			.send({
				email: userEmail,
				password: password
			})
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				for (var name in userDetails) {
					assert.equal(res.body[name], userDetails[name]);
				}
				done();
		});
	});

	it('should get admin details', function(done){
		superagent.post('http://localhost:8585/account/login')
			.send({
				email: adminEmail,
				password: password
			})
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				for (var name in adminDetails) {
					assert.equal(res.body[name], adminDetails[name]);
				}
				done();
		});
	});

	it('should get error on login', function(done){
		superagent.post('http://localhost:8585/account/login')
			.send({
				email: 'wrong@user.com',
				password: password
			})
			.end(function(err, res) {
				assert.equal(res.statusCode, 400);
				assert.ok(res.body.error !== null);
				done();
		});
	});

	it('should test reset password', function(done){
		superagent.post('http://localhost:8585/account/reset')
			.send({
				email: userEmail,
				password: password
			})
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				for (var name in userDetails) {
					assert.equal(res.body[name], userDetails[name]);
				}
				done();
		});
	});

	it('should get error on reset', function(done){
		superagent.post('http://localhost:8585/account/reset')
			.send({
				email: 'wrong@user.com',
				password: password
			})
			.end(function(err, res) {
				assert.equal(res.statusCode, 400);
				assert.ok(res.body.error !== null);
				done();
		});
	});
});
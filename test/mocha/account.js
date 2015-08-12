'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	users = require('../../examples/account/models/account').users,
	indigo = require('../../indigo');

describe('Testing Account Controllers', function () {

	var port;

	before(function (done) {
		indigo.start(__appDir +  '/examples/account/config/app.json');
		port = indigo.appconf.get('server:port');
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

	it('should redirect to /en/login', function(done) {
		superagent.get('http://localhost:' + port + '/account/login')
			.end(function(err, res) {
				assert.equal(res.statusCode, 200);
				assert.equal(res.redirects.toString(),  'http://localhost:' + port + '/account/en/login');
				done();
		});
	});

	it('should get user details', function(done) {
		superagent.post('http://localhost:' + port + '/account/login')
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

	it('should get admin details', function(done) {
		superagent.post('http://localhost:' + port + '/account/login')
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

	it('should get error on login', function(done) {
		superagent.post('http://localhost:' + port + '/account/login')
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

	it('should test reset password', function(done) {
		superagent.post('http://localhost:' + port + '/account/reset')
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

	it('should get error on reset', function(done) {
		superagent.post('http://localhost:' + port + '/account/reset')
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

	it('should test middleware handler call', function(done) {
		superagent.post('http://localhost:' + port + '/account/todo')
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test invalid path to static CSS', function(done) {
		superagent.get('http://localhost:' + port + '/static/css/invalid.css')
			.end(function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
		});
	});

	it('should test redirect CSS to LESS', function(done) {
		superagent.get('http://localhost:' + port + '/static/css/custom.css')
			.end(function(err, res) {
				assert.equal(res.type, 'text/css');
				assert.equal(res.redirects.toString(), 'http://localhost:' + port + '/static/css/custom.less');
				assert.equal(res.header['cache-control'], 'public, max-age=86400');
				done();
		});
	});

	it('should test default cache header value', function(done) {
		indigo.appconf.server.cache = null;
		superagent.get('http://localhost:' + port + '/static/css/common.less')
			.end(function(err, res) {
				assert.equal(res.header['cache-control'], 'public, max-age=3600');
				done();
		});
	});
});
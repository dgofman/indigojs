'use strict';

var stdio = require('stdio'),
	fs = require('fs'),
	fse = require('fs-extra'),
	pkg = require('../../package.json');

(function() {

	if (process.argv.slice(2).indexOf('-v') !== -1) {
		console.log(pkg.name + ' ' + pkg.version);
		return;
	}

	var defaultPort = 8125, ops = stdio.getopt({
		'version': {key: 'v', description: 'display product version'},
		'name': {key: 'n', args: 1, mandatory: true, description: 'application name'},
		'dir': {key: 'd', args: 1, description: 'path to the webroot directory (defaults /web)'},
		'port': {key: 'p', args: 1, description: 'server port number  (defaults ' + defaultPort + ')'},
		'uri': {key: 'u', args: 1, description: 'default routing path/uri (defaults /%APPNAME%)'},
		'routers': {key: 'r', args: 1, description: 'path to the routers files (defaults /routers)'},
		'controllers': {key: 'c', args: 1, description: 'path to the controllers directory (defaults /controllers)'},
		'locales': {key: 'l', args: 1, description: 'path to the localization files directory (defaults /locales)'},
		'env': {key: 'e', args: 1, description: 'software environment (dev/prod)'}
	});

	var lines = fs.readFileSync(__dirname + '/package.json', 'utf-8').
								replace('{{name}}', ops.name).
								replace('{{version}}', pkg.version),
	dir = '.';
	createFile(dir, '/package.json', lines);

	lines = fs.readFileSync(__dirname + '/index.js', 'utf-8');
	createFile(dir, '/index.js', lines);

	lines = fs.readFileSync(__dirname + '/.npmignore', 'utf-8');
	createFile(dir, '/.gitignore', lines);

	lines = fs.readFileSync(__dirname + '/app.json', 'utf-8').
						replace('{{env}}', ops.env || 'dev').
						replace('{{port}}', ops.port || defaultPort).
						replace('{{webdir}}', ops.dir || '/web').
						replace('{{locales}}', ops.locales || '/locales').
						replace('{{routers}}', ops.routers || '/routers');
	createFile(dir + '/config', '/app.json', lines);

	dir = '.' + (ops.locales || '/locales') + '/en';
	lines = fs.readFileSync(__dirname + '/locales.json', 'utf-8').
						replace('{{name}}', ops.name).
						replace('{{year}}', new Date().getFullYear());
	createFile(dir, '/common.json', lines);

	dir = '.' + (ops.routers || '/routers');
	lines = fs.readFileSync(__dirname + '/router.js', 'utf-8').
						replace('{{uri}}', ops.uri || '/' + ops.name).
						replace('{{routers}}', ops.routers || '/routers').
						replace('{{controllers}}', ops.controllers || '/controllers');
	createFile(dir, '/router.js', lines);

	dir = '.' + (ops.controllers || '/controllers');
	lines = fs.readFileSync(__dirname + '/controller.js', 'utf-8');
	createFile(dir, '/controller.js', lines);
	fse.copySync(__dirname + '/web', '.' + (ops.dir || '/web'));

	console.log('\nThank you for using IndigoJS!');

	console.log('\nPlease run commands:');
	console.log('npm install');
	console.log('npm start');
	console.log('\nURL: http://localhost:%s%s/index', ops.port || defaultPort, ops.uri || '/app');
})();

function createFile(dir, file, lines) {
	fse.mkdirsSync(dir);
	console.log('creating %s%s', dir, file);
	fs.writeFileSync(dir + file, lines);
}
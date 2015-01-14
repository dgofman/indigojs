'use strict';

var stdio = require('stdio'),
	fs = require('fs'),
	fse = require('fs-extra');

(function() {

	if (process.argv.slice(2).indexOf('-v') !== -1) {
		var pkg = require('../../package.json');
		console.log(pkg.name + ' ' + pkg.version);
		return;
	}

	var ops = stdio.getopt({
		'version': {key: 'v', description: 'output the version number'},
		'name': {key: 'n', args: 1, mandatory: true, description: 'application name'},
		'dir': {key: 'd', args: 1, description: 'path to the webroot directory  (defaults to /web)'},
		'port': {key: 'p', args: 1, description: 'server port number  (defaults 80)'},
		'uri': {key: 'u', args: 1, description: 'default routing path/uri (defaults /app)'},
		'routers': {key: 'r', args: 1, description: 'path to the directory with routing files (defaults to /routers)'},
		'locales': {key: 'l', args: 1, description: 'path to the directory with localization files (defaults to /locales)'},
		'env': {key: 'e', args: 1, description: 'software environment (dev/prod)'}
	});

	var lines = fs.readFileSync(__dirname + '/package.json', 'utf-8').replace('{{name}}', ops.name),
		dir = '.';
	createFile(dir, '/package.json', lines);

	lines = fs.readFileSync(__dirname + '/index.js', 'utf-8');
	createFile(dir, '/index.js', lines);

	lines = fs.readFileSync(__dirname + '/app.json', 'utf-8').
						replace('{{env}}', ops.env || 'dev').
						replace('{{port}}', ops.port || 80).
						replace('{{appdir}}', ops.dir || '/web').
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
						replace('{{uri}}', ops.uri || '/app').
						replace('{{routers}}', ops.routers || '/routers');
	createFile(dir, '/router.js', lines);

	dir = dir + '/controllers';
	lines = fs.readFileSync(__dirname + '/controller.js', 'utf-8');
	createFile(dir, '/controller.js', lines);
	fse.copySync(__dirname + '/web', './web');

	console.log('\nThank you for using IndigoJS!');

	console.log('\nPlease run commands:');
	console.log('npm install');
	console.log('npm start');
	console.log('\nURL: http://localhost:%s%s/index', ops.port || 80, ops.uri || '/app');
})();

function createFile(dir, file, lines) {
	fse.mkdirsSync(dir);
	console.log('creating %s%s', dir, file);
	fs.writeFileSync(dir + file, lines);
}
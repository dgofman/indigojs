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

	var defaultPort = 8125,
		ops = stdio.getopt({
		'version': {key: 'v', description: 'display indigojs version'},
		'name': {key: 'n', args: 1, mandatory: true, description: 'application name'},
		'dir': {key: 'd', args: 1, description: 'path to the webroot directory (defaults /web)'},
		'static': {key: 's', args: 1, description: 'name of static directory under webroot (defaults /static)'},
		'port': {key: 'p', args: 1, description: 'server port number  (defaults ' + defaultPort + ')'},
		'uri': {key: 'u', args: 1, description: 'default routing path/uri (defaults /%APPNAME%)'},
		'routers': {key: 'r', args: 1, description: 'path to the routers files (defaults /routers)'},
		'controllers': {key: 'c', args: 1, description: 'path to the controllers directory (defaults /controllers)'},
		'locales': {key: 'l', args: 1, description: 'path to the localization files directory (defaults /locales)'},
		'env': {key: 'e', args: 1, description: 'software environment (dev/prod)'}
	});

	var dir = '.',
		webdir = getDir(ops.dir || 'web'),
		staticDir = getDir(ops.static || 'static'),
		localesDir = getDir(ops.locales || 'locales'),
		routersDir = getDir(ops.routers || 'routers'),
		controllersDir = getDir(ops.controllers || 'controllers'),
		lines = fs.readFileSync(__dirname + '/package.json', 'utf-8').
								replace(/{{name}}/g, ops.name).
								replace(/{{version}}/g, pkg.version);
	createFile(dir, '/package.json', lines);

	lines = fs.readFileSync(__dirname + '/index.js', 'utf-8');
	createFile(dir, '/index.js', lines);

	lines = fs.readFileSync(__dirname + '/index.js', 'utf-8');
	createFile(dir, '/index.js', lines);

	lines = fs.readFileSync(__dirname + '/.jshintrc', 'utf-8');
	createFile(dir, '/.jshintrc', lines);

	lines = fs.readFileSync(__dirname + '/.gitignore', 'utf-8');
	createFile(dir, '/.gitignore', lines).replace(/{{webdir}}/g, webdir);
	
	lines = fs.readFileSync(__dirname + '/.jshintignore', 'utf-8').replace(/{{webdir}}/g, webdir);
	createFile(dir, '/.jshintignore', lines);
	
	lines = fs.readFileSync(__dirname + '/constant.less', 'utf-8').replace(/{{static}}/g, staticDir);
	createFile(webdir + '/default/less', '/constant.less', lines);
	
	lines = fs.readFileSync(__dirname + '/Gruntfile.js', 'utf-8').replace(/{{webdir}}/g, webdir);
	createFile(dir, '/Gruntfile.js', lines);

	lines = fs.readFileSync(__dirname + '/app.json', 'utf-8').
						replace(/{{env}}/g, ops.env || 'dev').
						replace(/{{port}}/g, ops.port || defaultPort).
						replace(/{{webdir}}/g, webdir).
						replace(/{{static}}/g, staticDir).
						replace(/{{locales}}/g, localesDir).
						replace(/{{routers}}/g, routersDir);
	createFile('/config', '/app.json', lines);

	lines = fs.readFileSync(__dirname + '/locales.json', 'utf-8').
						replace(/{{name}}/g, ops.name).
						replace(/{{year}}/g, new Date().getFullYear());
	createFile(localesDir + '/en', '/common.json', lines);

	lines = fs.readFileSync(__dirname + '/static.js', 'utf-8');
	createFile(routersDir, '/static.js', lines);

	lines = fs.readFileSync(__dirname + '/router.js', 'utf-8').
						replace(/{{uri}}/g, ops.uri || '/' + ops.name).
						replace(/{{routers}}/g, routersDir).
						replace(/{{controllers}}/g, controllersDir);
	createFile(routersDir, '/router.js', lines);

	lines = fs.readFileSync(__dirname + '/controller.js', 'utf-8');
	createFile(controllersDir, '/controller.js', lines);
	fse.copySync(__dirname + '/web', '.' + webdir);

	dir = '/resources/nginx/conf';
	lines = fs.readFileSync(__dirname + '/resources/nginx/conf/nginx.conf', 'utf-8').
							replace(/{{webdir}}/g, (process.cwd() + webdir).replace(/\\/g, '/')).
							replace(/{{static}}/g, staticDir).
							replace(/{{port}}/g, ops.port || defaultPort);
	createFile(dir, '/nginx.conf', lines);

	console.log('\nThank you for using IndigoJS!');

	console.log('\nPlease run commands:');
	console.log('npm install --production');
	console.log('npm start');
	console.log('\nURL: http://localhost:%s%s/index', ops.port || defaultPort, ops.uri || '/' + ops.name);
})();

function createFile(dir, file, lines) {
	if (dir.substr(0, 1) === '/') {
		dir = '.' + dir;
	}
	fse.mkdirsSync(dir);
	console.log('creating %s%s', dir, file);
	fs.writeFileSync(dir + file, lines);
}

function getDir(dir) {
	return dir.substr(0, 1) === '/' ? dir : '/' + dir;
}
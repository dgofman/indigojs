'use strict';

var indigo = global.__indigo,
	debug = indigo.debug('indigo:static'),
	fs = require('fs'),
	less = require('less');

module.exports = (router, app) => {

	var base = indigo.getStaticDir(),
		path = '^' + base;

	app.use(path + '/css/*(.css)$', (req, res) => {
		return res.redirect(req.originalUrl.replace(/\.css$/, '.less'));
	});

	app.use(path + '/css/*(.less)$', (req, res, next) => {

		var filename = req.params[0] + req.params[1],
			lessFile = router.moduleWebDir() + '/default/less/' + filename,
			cache = parseInt(indigo.appconf.get('server:cache')),
			isDev = indigo.appconf.get('environment') === 'dev';

		debug(req.method, lessFile);

		if (fs.existsSync(lessFile)) {
			res.setHeader && res.setHeader('Cache-Control', 'public, max-age=' + 
					(!isNaN(cache) ? cache : 3600)); //or one hour

			fs.readFile(lessFile, (error, data) => {
				less.render(data.toString(), {
						filename: lessFile,
						compress: !isDev
					}, (error, result) => {
						res.set('Content-Type', 'text/css');
						if (!error) {
							res.write(result.css);
							res.end();
						} else {
							indigo.error(error);
							res.send(data);
						}
					});
			});
			return;
		}
		next();
	});

	return base;
};
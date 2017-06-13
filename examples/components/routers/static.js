'use strict';

const indigo = global.__indigo,
	component = indigo.libs('component');

module.exports = (router, app) => {

	const base = indigo.getStaticDir(),
		path = '^' + base;

	app.use(path + '/css/*(.less)$', (req, res, next) => {
		const filename = req.params[0] + req.params[1],
			lessFile = router.moduleWebDir() + '/default/less/' + filename;
		return component.renderLess(lessFile, req, res, next);
	});

	return base;
};
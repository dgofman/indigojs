'use strict';

var indigo = require('../../../indigo'),
	stream = require('stream'),
	StringDecoder = require('string_decoder').StringDecoder;

module.exports = function(router) {

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, '/index');
	});

	router.post('/appConf', function(req, res) {
		var fileStream = new stream.Writable(),
			buffer = '';
		fileStream._write = function (chunk, encoding, done) {
			//buffer += chunk.toString();
			console.log('write')
			done();
		};
		fileStream.end = function (chunk, encoding, done) {
			console.log('end')
		};
		fileStream.on('finish', function ()
    {
        console.log('finish')
    });

    fileStream.on('pipe', function (src)
    {
       console.log('pipe')
    });

    fileStream.on('readable', function (src)
    {
       console.log('readable')
    });

    fileStream.on('unpipe', function (src)
    {
        console.log('unpipe')
    });

		var destStream = new stream.PassThrough();
				destStream.on('readable', function() {
    var buffer = destStream.read();
    console.log(buffer);
});

		req.pipe(fileStream);
	});
};
var bodyParser = require('body-parser');
var express = require('express');
var portscanner = require('portscanner');
// custom
var router = require('./lib/router');

var app = express();

app.use(bodyParser.json());

app.use('/', router);

portscanner.findAPortNotInUse(8000, 9000, '127.0.0.1', function(error, port) {
	app.listen(port, function() {
		console.log('baas listening on port ' + port);
	});
});

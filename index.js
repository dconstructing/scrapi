var bodyParser = require('body-parser');
var express = require('express');
var portscanner = require('portscanner');
var Promise = require('promise');
// custom
var router = require('./lib/router');

var Baas = function(config) {
	if (!config) {
		config = {};
	}
	var port = config.port;
	var app = express();

	app.use(bodyParser.json());

	var getPort = function() {
		var promise = new Promise(function(resolve, reject) {
			if (!port) {
				portscanner.findAPortNotInUse(8000, 9000, '127.0.0.1', function(error, availablePort) {
					port = availablePort;
					resolve(port);
				});
			} else {
				resolve(port);
			}
		});
		return promise;
	};

	this.addCommand = function(resourceType, command, callback) {
		var path = '/' + resourceType + '/:resourceId/' + command;
		router.post(path, callback);
	};

	this.start = function() {
		app.use('/', router);

		if (!port) {
			getPort().then(function(desiredPort) {
				app.listen(desiredPort, function() {
					console.log('baas listening on port ' + desiredPort);
				});
			});
		}
	};
};

module.exports = Baas;

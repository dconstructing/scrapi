var http = require('http');
// 3rd party
var bodyParser = require('body-parser');
var express = require('express');
var portscanner = require('portscanner');
var Promise = require('promise');
// custom
var auth = require('./lib/auth');
var client = require('./lib/client');
var realtime = require('./lib/realtime');
var resources = require('./lib/resources');
var router = require('./lib/router');

var Scrapi = function(config) {
	if (!config) {
		config = {};
	}
	var port = config.port;
	var app = express();

	app.use(bodyParser.json());
	router.staticRoute('/public', config.static.dir);
	auth.configure(config.auth);
	resources.initialize(config.data);

	var server = http.createServer(app);

	realtime.initialize(server);

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

	this.getClient = function() {
		return client;
	};

	this.addCommand = function(resourceType, command, callback) {
		var path = '/' + resourceType + '/:resourceId/' + command;
		router.addPost(path, callback);
	};

	this.start = function(callback) {
		router.attach('/', app);

		if (!port) {
			getPort().then(function(desiredPort) {
				server.listen(desiredPort, function() {
					console.log('Scrapi listening on port ' + desiredPort);
					callback({
						port: desiredPort
					});
				});
			});
		}
	};
};

module.exports = Scrapi;

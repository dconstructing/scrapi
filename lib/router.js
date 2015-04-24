// 3rd party
var express = require('express');
// custom
var client = require('./client');
var users = require('./users');

var router = express.Router();

router.use(function(req, res, next) {
	// log each request to the console
	console.log(req.method, req.url);
	next();
});

router.route('/auth/social')
	.post(function(req, res) {
		console.log('social authing', req.body);
		// authenticate token
		users.authenticate(req.body.service, req.body.token)
			.then(function(userData) {
				console.log('authenticated data', userData);
				return users.getSocialUser(userData.service, userData.serviceId, userData);
			})
			.then(function(user) {
				res.status(200).send(user);
			}, function(err) {
				res.status(403).end();
			});
	});

router.route('/:resourceType/:resourceId?')
	.get(function(req, res) {
		client.get(req.params.resourceType, req.params.resourceId)
			.then(function(resource) {
				var statusCode = 200;
				if (!resource) {
					statusCode = 404;
				}
				res.status(statusCode).send(resource);
			}, function(err) {
				res.status(500).send(err);
			});
	})
	.post(function(req, res) {
		client.post(req.params.resourceType, req.body)
			.then(function(resource) {
				var statusCode = 200;
				if (!resource) {
					statusCode = 404;
				}
				res.status(statusCode).send(resource);
			}, function(err) {
				res.status(500).send(err);
			});
	})
	.put(function(req, res) {
		if (!req.params.resourceId) {
			res.status(400).send("Must provide resource ID");
		}
		client.put(req.params.resourceType, req.params.resourceId, req.body)
			.then(function(resource) {
				var statusCode = 200;
				if (!resource) {
					statusCode = 404;
				}
				res.status(statusCode).end();
			}, function(err) {
				res.status(500).send(err);
			});
	});

module.exports = {
	attach: function(path, server) {
		server.use(path, router);
	},
	staticRoute: function(directory, path) {
		router.use(directory, express.static(path));
	},
	defaultRoute: function(path) {
		router.get('/', function(req, res, next) {
			res.sendFile('index.html', { root: path });
		});
	},
	addPost: function(path, callback) {
		router.post(path, callback);
	}
};

// 3rd party
var express = require('express');
// custom
var auth = require('./auth');
var client = require('./client');

var router = express.Router();

var staticDir;

router.use(function(req, res, next) {
	// log each request to the console
	console.log(req.method, req.url);
	next();
});

router.use('/scrapi', express.static(__dirname + '/../public'));
router.route('/dashboard/:section?*?')
	.get(function(req, res) {
		res.sendFile('dashboard.html', { root: __dirname + '/../public' });
	});

router.get('/resources', auth.middleware, function(req, res) {
	client.resources()
		.then(function(list) {
			res.status(200).send(list);
		});
});

router.route('/auth/social')
	.post(auth.socialEndpoint);

var addResourceRoutes = function() {
	router.route('/:resourceType/:resourceId?')
		.all(function(req, res, next) {
			console.log('checking json');
			if (req.accepts('html') === 'html') {
				console.log('accepts html');
				sendDefaultFile(res);
			} else if (req.accepts('json') === 'json') {
				console.log('accepts json');
				next();
			} else {
				console.log('does not accept json or html');
				sendDefaultFile(res);
			}
		})
		.all(auth.middleware)
		.get(function(req, res) {
			client.get(req.params.resourceType, req.params.resourceId)
				.then(function(resource) {
					var statusCode = 200;
					if (!resource) {
						statusCode = 404;
					}
					res.status(statusCode).send(resource);
				}, function(err) {
					res.status(500).send(err.message);
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
					res.status(500).send(err.message);
				});
		});
};

var sendDefaultFile = function(res) {
	res.sendFile('index.html', { root: staticDir });
};

module.exports = {
	attach: function(path, server) {
		addResourceRoutes();
		server.use(path, router);
	},
	staticRoute: function(directory, path) {
		staticDir = path;
		router.use(directory, express.static(staticDir));
		router.get('/', function(req, res, next) {
			sendDefaultFile(res);
		});
	},
	addPost: function(path, callback) {
		router.post(path, callback);
	}
};

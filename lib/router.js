var router = require('express').Router();

var resources = require('./resources');

router.use(function(req, res, next) {
	// log each request to the console
	console.log(req.method, req.url);
	next();
});

router.route('/')
	.all(function(req, res) {
		res.send('Nothing here');
	});

router.route('/:resourceType/:resourceId?')
	.get(function(req, res) {
		resources.get(req.params.resourceType, req.params.resourceId)
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
		resources.add(req.params.resourceType, req.body)
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
		resources.update(req.params.resourceType, req.params.resourceId, req.body)
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

module.exports = router;

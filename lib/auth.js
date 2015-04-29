var users = require('./users');

var providers = [];

module.exports = {
	configure: function(config) {
		providers = config.providers || [];
	},
	middleware: function(req, res, next) {
		if (providers.length > 0) {
			var authHeader = req.get('Authorization');
			if (authHeader) {
				var token = authHeader.replace('Bearer ', '');
				users.authenticate('google', token)
					.then(function(authData) {
						return users.getSocialUser(authData.service, authData.serviceId, authData);
					})
					.then(function(user) {
						if (user.permissions.admin) {
							next();
						} else if (user.permissions.resources.read && req.method === 'GET') {
							next();
						} else if (user.permissions.resources.write && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
							next();
						} else {
							res.set('Content-Type', 'text/plain');
							res.status(403).end();
						}
					}, function(err) {
						console.log('auth error', err);
						res.status(500).send(err.message);
					});
			} else {
				res.status(401).send('Must supply an Authorization token');
			}
		} else {
			next();
		}
	},
	socialEndpoint: function(req, res) {
		// authenticate token
		users.authenticate(req.body.service, req.body.token)
			.then(function(userData) {
				return users.getSocialUser(userData.service, userData.serviceId, userData);
			})
			.then(function(user) {
				res.status(200).send(user);
			}, function(err) {
				res.status(403).send(err.message);
			});
	}
};

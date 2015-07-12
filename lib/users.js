var https = require('https');
// 3rd party
var Promise = require('promise');
// custom
var client = require('./client');

var User = function() {
	this.permissions = {
		dashboard: false,
		resources: {
			read: false,
			write: false
		}
	};
};

var authGooglePlus = function(token, lastTimeout) {
	return new Promise(function(resolve, reject) {
		https.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token, function(res) {
			var data = '';
			var json;
			res.on('data', function(chunk) {
				data += chunk.toString();
			});
			res.on('end', function() {
				console.log("Google response: " + data);
				json = JSON.parse(data);
				if (json.user_id) {
					var user = new User();
					user.service = 'google';
					user.serviceId = json.user_id;
					user.email = json.email;
					console.log('resolving', user, json);
					resolve(user);
				} else {
					console.log('rejecting', json);
					reject(new Error('token not validated'));
				}
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
			if (lastTimeout < 30000) {
				var newTimeout = (lastTimeout === 0 ? 1000 : (lastTimeout * 2));
				authGooglePlus(newTimeout)
					.then(function(data) {
						resolve(data);
					}, function(err) {
						reject(err);
					});
			} else {
				reject(new Error('exhausted retries contacting Google+'));
			}
		});
	});
};

// Is an admin found in the DB?
var hasAdmin = true;

// Load existing users to see if an admin is there
client.get('users', {'permissions.admin': true})
	.then(function(users) {
		if (users.length < 1) {
			hasAdmin = false;
		}
	});

module.exports = {
	authenticate: function(service, token) {
		console.log('authenticating', service, token);
		var promise = new Promise(function(resolve, reject) {
			if (service === 'google' && token) {
				authGooglePlus(token, 0)
					.then(function(data) {
						console.log('authed', data);
						resolve(data);
					}, function(err) {
						reject(err);
					});
			} else {
				console.log('verifying something other than google');
				reject(new Error('unknown social service: ' + service));
			}
		});
		return promise;
	},
	getSocialUser: function(service, serviceId, user) {
		console.log('getting social user', service, serviceId);
		var promise = new Promise(function(resolve, reject) {
			var parameters = {
				'service': service,
				'serviceId': serviceId
			};

			client.get('users', parameters)
				.then(function(users) {
					if (users.length < 1) {
						console.log('adding user', user);
						if (!hasAdmin) {
							user.permissions.admin = true;
						}
						client.post('users', user)
							.then(function(newUser) {
								hasAdmin = true;
								resolve(newUser);
							}, function(err) {
								reject(err);
							});
					} else {
						resolve(users[0]);
					}
				}, function(err) {
					reject(err);
				});
		});
		return promise;
	}
};

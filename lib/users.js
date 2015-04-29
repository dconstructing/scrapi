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

var hasAdmin = true;

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
							user.service = service;
							user.serviceId = json.user_id;
							user.email = json.email;
							resolve(user);
						} else {
							reject(new Error('token not validated'));
						}
					});
				}).on('error', function(e) {
					console.log("Got error: " + e.message);
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

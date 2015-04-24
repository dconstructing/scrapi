var https = require('https');
// 3rd party
var Datastore = require('nedb');
var Promise = require('promise');

var usersDatastore = new Datastore();

var User = function() {
	this.permissions = {
		dashboard: false,
		resources: {
			read: false,
			write: false
		}
	};
};

module.exports = {
	authenticate: function(service, token) {
		console.log('authenticating', service, token);
		var promise = new Promise(function(resolve, reject) {
			if (service === 'google') {
				https.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token, function(res) {
					var data = '';
					var json;
					res.on('data', function(chunk) {
						data += chunk.toString();
					});
					res.on('end', function() {
						console.log("Google response: " + data);
						json = JSON.parse(data);
						var user = new User();
						user.service = service;
						user.serviceId = json.user_id;
						user.email = json.email;
						resolve(user);
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

			usersDatastore.findOne(parameters, function(err, doc) {
				if (err) {
					reject(err);
				} else {
					if (!doc) {
						console.log('adding user', user);
						usersDatastore.insert(user, function(err, doc) {
							if (err) {
								reject(err);
							} else {
								resolve(doc);
							}
						});
					} else {
						resolve(doc);
					}
				}
			});
		});
		return promise;
	}
};

// 3rd party
var Promise = require('promise');
// custom
var resources = require('./resources');

module.exports = {
	post: function(type, data) {
		var promise = new Promise(function(resolve, reject) {
			resources.add(type, data)
				.then(function(resource) {
					resolve(resource);
				}, function(err) {
					reject(err);
				});
		});
		return promise;
	},
	get: function(type, filter) {
		var promise = new Promise(function(resolve, reject) {
			resources.get(type, filter)
				.then(function(resource) {
					resolve(resource);
				}, function(err) {
					reject(err);
				});
		});
		return promise;
	},
	put: function(type, id, data) {
		var promise = new Promise(function(resolve, reject) {
			resources.update(type, id, data)
				.then(function(resource) {
					resolve(resource);
				}, function(err) {
					reject(err);
				});
		});
		return promise;
	},
	resources: function() {
		return resources.list();
	}
};

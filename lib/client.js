// 3rd party
var Promise = require('promise');
// custom
var resources = require('./resources');

var listeners = [];

var updateListeners = function(data) {
	listeners.forEach(function(listener) {
		listener(data);
	});
};

module.exports = {
	post: function(type, data) {
		var promise = new Promise(function(resolve, reject) {
			resources.add(type, data)
				.then(function(resource) {
					resolve(resource);
					updateListeners(resource);
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
					var change;
					if (typeof resource === 'number') {
						change = {
							type: type,
							id: id,
							data: data
						};
					} else {
						change = resource;
					}

					resolve(change);
					updateListeners(change);
				}, function(err) {
					reject(err);
				});
		});
		return promise;
	},
	listen: function(callback) {
		listeners.push(callback);
	},
	resources: function() {
		return resources.list();
	}
};

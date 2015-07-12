var fs = require('fs');
// 3rd party
var Datastore = require('nedb');
var Promise = require('promise');
// custom

var config = {};
var datastores = {};

var getDataDirectory = function() {
	return config.dir || 'data';
};

var loadData = function() {
	// fs.readdir(__dirname + '/../data', function(err, files) {
	fs.readdir(getDataDirectory(), function(err, files) {
		var toInit = [];

		if (files) {
			console.log('files', files);
			files.forEach(function(file, index, array) {
				if (file.indexOf('resource') === 0) {
					console.log('building', file);
					toInit.push(file.substr(9));
				}
			});
		}

		toInit.forEach(function(type, index, array) {
			if (!datastores[type]) {
				createDatastore(type);
			}
		});
	});
};

var createDatastore = function(type) {
	console.log('creating datastore', type);
	datastores[type] = new Datastore({
		filename: getDataDirectory() + '/resource-' + type,
		autoload: true
	});
};

var getDatastore = function(type) {
	if (datastores[type] === undefined) {
		createDatastore(type);
	}

	return datastores[type];
};

module.exports = {
	initialize: function(customConfig) {
		config = customConfig || {};
		loadData();
	},
	add: function(type, data) {
		var promise = new Promise(function(resolve, reject) {
			var db = getDatastore(type);

			db.insert(data, function(err, doc) {
				if (err) {
					reject(err);
				} else {
					resolve(doc);
				}
			});
		});
		return promise;
	},
	get: function(type, filter) {
		var promise = new Promise(function(resolve, reject) {
			var db = getDatastore(type);

			var parameters = {};
			for (var key in filter) {
				if (key === 'id') {
					parameters._id = filter.id;
				} else {
					parameters[key] = filter[key];
				}
			}

			db.find(parameters, function(err, doc) {
				if (err) {
					reject(err);
				} else {
					if (filter && filter.id) {
						resolve(doc[0]);
					} else {
						resolve(doc);
					}
				}
			});
		});
		return promise;
	},
	update: function(type, id, data) {
		var promise = new Promise(function(resolve, reject) {
			var db = getDatastore(type);

			db.update({_id:id}, { $set: data }, {}, function(err, numReplaced, doc) {
				if (err) {
					reject(err);
				} else {
					resolve(numReplaced);
				}
			});
		});
		return promise;
	},
	list: function() {
		var promise = new Promise(function(resolve, reject) {
			resolve(Object.keys(datastores));
		});
		return promise;
	}
};

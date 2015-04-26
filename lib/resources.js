var fs = require('fs');
// 3rd party
var Datastore = require('nedb');
var Promise = require('promise');
// custom

var datastores = {};

fs.readdir(__dirname + '/../data', function(err, files) {
	files.forEach(function(file, index, array) {
		if (file.indexOf('~', file.length - 1) === -1) {
			createDatastore(file);
		}
	});
});

var createDatastore = function(type) {
	datastores[type] = new Datastore({
		filename: __dirname + '/../data/' + type,
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
	}
};

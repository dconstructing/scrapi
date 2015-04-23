// 3rd party
var Datastore = require('nedb');
var Promise = require('promise');
// custom

var datastores = {};

var createDatastore = function(type) {
	datastores[type] = new Datastore();
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
	get: function(type, id) {
		var promise = new Promise(function(resolve, reject) {
			var db = getDatastore(type);

			var parameters = {};
			if (id) {
				parameters._id = id;
			}

			db.find(parameters, function(err, doc) {
				if (err) {
					reject(err);
				} else {
					if (id) {
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

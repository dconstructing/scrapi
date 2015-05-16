// 3rd party
var WebSocket = require('ws');
// custom
var client = require('./client');

var connections = [];

var updateConnections = function(data) {
	connections.forEach(function(connection) {
		if (connection.readyState > 1) {
			removeConnection(connection);
		}
		connection.send(JSON.stringify(data));
	});
};

var removeConnection = function(connection) {
	var index = connections.indexOf(connection);
	if (index > -1) {
		connections.splice(index, 1);
	}
};

var onConnection = function(ws) {
	connections.push(ws);
	ws.on('close', function() {
		removeConnection(ws);
	});
};

client.listen(function(data) {
	updateConnections(data);
});

module.exports = {
	initialize: function(server) {
		var wss = new WebSocket.Server({
			server: server,
			path: "/baas/update"
		});
		wss.on('connection', onConnection);
	}
};

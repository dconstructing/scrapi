# Scrapi
Data manager with a flexible API. A popup backend (nobackend, baas) that compliments your code or stands alone.

Scrapi can be used to setup a simple CRUD backend server with a REST interface, but also includes an internal client that provides your business logic with easy access to your data.

`npm install scrapi`

## Usage

Basic Google Auth protected CRUD backend

Allows:

Request | Description
--- | ---
`POST /<resourceType>` with JSON payload | Create Resource
`PUT /<resourceType>/<resourceId>` with JSON payload | Overwrite Resource
`GET /<resourceType>/<resourceId>` | Retrieve Resource

```js
var Scrapi = require('scrapi');

var config = {
	auth: {
		providers: [
			'google'
		]
	}
};

var scrapi = new Scrapi(config);

scrapi.start(function(data) {
	// REST server started
});
```

Google Auth protected CRUD backend with custom endpoints and logic

```js
var Scrapi = require('scrapi');

var config = {
	auth: {
		providers: [
			'google'
		]
	}
};

var scrapi = new Scrapi(config);

// Get the client for internal use
var scrapiClient = scrapi.getClient();

// Create a custom REST endpoint to trigger custom logic
// Will create:
// POST /users/<userId>/congratulate
scrapi.addCommand('users', 'congratulate', function(req, res) {
	// do custom logic to congratulate user
});

// Start the REST server after all custom endpoints have been added.
scrapi.start(function(data) {
	// REST server started
});
```

### Configuration

`auth` - Configures how data access should be authorized. Only Google auth is supported (shown below) (default: disabled).

`data` - Describes data should be persisted. Currently, only supports an embedded noSQL database.

parameter | description
--- | ---
`data.dir` | The location of the data in relation to your project root (default: 'data').

`static` - Configure how your site's static files should be served.

parameter | description
--- | ---
`static.dir` | The location of the files in relation to your project root (default: 'public').

Here is an example config:

```js
var config = {
	auth: {
		providers: [
			'google'
		]
	},
	data: {
		dir: 'db'
	},
	static: {
		dir: 'assets'
	}
};
```

### Internal client

The internal client provides your app with access to your data, ensuring changes will notify all interested clients.

The internal client contains functions that resemble the `GET`, `POST`, and `PUT` REST methods.

function | description
--- | ---
`get(type, filter)` | Retrieve a certain type of data that matches the given filter. `type` is a string. `filter` is either a resourceId string or an object that matches the specificiations of a [mongodb query](http://docs.mongodb.org/manual/reference/method/db.collection.find/)
`post(type, data)` | Store the provided data as the given type. `type` is a string. `data` is a JSON document
`put(type, id, data)` | Overwrite the stored data of the given type and id with the provided data. `type` is a string. `id` is a resourceId string. `data` is a JSON document.

These functions each return a Promise. The `get()` and `post()` function Promises resolve to the JSON document requested or added. The `put()` function Promise resolves to an object with parameters matching the `put()` args.

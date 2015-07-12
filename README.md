# Scrapi
Data manager with a flexible API. A popup backend (nobackend, baas) that compliments your code or stands alone.

Scrapi can be used to setup a simple CRUD backend server with a REST interface, but also includes an internal client that provides your business logic with easy access to your data.

`npm install scrapi`

## Usage

Basic Google Auth protected CRUD backend

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

// Create a custom REST endpoint to trigger custom logic
// Will create:
// POST /user/<userId>/congratulate
scrapi.addCommand('user', 'congratulate', function(req, res) {
	// do custom logic to congratulate user
});

// Start the REST server after all custom endpoints have been added.
scrapi.start(function(data) {
	// REST server started
});
```

## Configuration

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

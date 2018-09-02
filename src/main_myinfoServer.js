var express = require("express");
var session = require('express-session');
var MemoryStore = require('memorystore')(session);

var apiHandler = require("./myinfoServer/api/apiHandler.js");

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

// - -- --->

const app = express();
app.use(session({
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
	resave: true,
  	saveUninitialized: true,
    secret: 'mysecret'
}));
app.all("/*", function(req, res, next) {
	if (req.session.userID) {
		console.log(`Already logged in: req.session.userID: ${req.session.userID} (${JSON.stringify(req.params)})`);
		next();
	} else {
		// ToDo: Redirecting to a login page.

		// Instead of loggin in and setting the userID
		// we set it to a default 0 value.
		req.session.userID = "default@myinfo.local";
		console.log(`Logging in: req.session.userID: ${req.session.userID}`);
		// Right now we assume we already logged in. So we proceed.
		next();
	};
});

app.all("/api/:version/:function", apiHandler);

const config = require('../webpack.config.js');
const compiler = webpack(config);

const listeningPort = 8080;

app.use(webpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath
}));

app.listen(listeningPort, () => {
	console.log(`myinfoServer started on listeningPort (${listeningPort})`);
});



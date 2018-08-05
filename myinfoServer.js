var express = require("express");
var session = require('express-session');
var MemoryStore = require('memorystore')(session);
import {apiSettingsV1} from "./myinfoServer/api/apiSettingsV1";

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

// - -- --->

const app = express();
app.use(session({
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
	//resave: false,
  	//saveUninitialized: true,
    secret: 'mysecret'
}));
app.get("/", function(req, res, next) {
	if (req.session.userID) {
		console.log(`Already logged in: req.session.userID: ${req.session.userID}`);
	} else {
		// ToDo: Redirecting to a login page.

		// Instead of loggin in and setting the userID
		// we set it to a default 0 value.
		req.session.userID = 0;
		console.log(`Logging in: req.session.userID: ${req.session.userID}`);
	};

	// After successful login
	next();
});

app.all("/api/v1/settings/", apiSettingsV1);



const config = require('./webpack.config.js');
const compiler = webpack(config);

const listeningPort = 8080;

app.get("/api/database/:username/:dbname", function(req, res) {
	res.send(`user:${req.params.username}, db:${req.params.dbname}`);
	res.end();
});


//app.use(express.static("./dist"));
app.use(webpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath,
	logLevel: 'trace'
}));

app.listen(listeningPort);

console.log(`MyInfo-Server started on listeningPort ${listeningPort}`);

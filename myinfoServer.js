const express = require('express');
const bodyParser = require('body-parser');
const config = require("./config/config.js")();
const livereload = require("livereload");
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const Database = require("./database/myinfoDatabase.js");

// Live reload init
var server = livereload.createServer();
server.watch(__dirname + '/public');

const database = new Database();
database.init();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
	resave: false,
  	saveUninitialized: true,
    secret: 'mysecret'
}));
app.use(express.static('./public'));

require('./routes')(app, config, database);
app.listen(config.PORT, () => {
	console.log('MyInfo-Server listening on port: ' + config.PORT);
});
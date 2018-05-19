const express = require("express");
const livereload = require("livereload");
const database = require("./myinfoDatabase.js");

// Live reload init
var server = livereload.createServer();
server.watch(__dirname + '/public');

// Set up "database"
var db = new database();
db.init();

var app = express();
const listeningPort = 3000;

app.get("/api/database/:username/:dbname", function(req, res) {
	res.send(`user:${req.params.username}, db:${req.params.dbname}`);
	res.end();
});

app.use(express.static('./public'));

app.listen(listeningPort);

console.log(`MyInfo-Server started on listeningPort ${listeningPort}`);

var express = require("express");
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

// - -- --->

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

console.log(`publicPath: '${config.output.publicPath}'`);

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

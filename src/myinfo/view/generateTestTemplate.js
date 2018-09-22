var dots = require("dot");
var fs = require("fs");

var baseDir = process.argv[1].replace(/\\/g,"/").replace(/\/[^\/]*$/g,"/");
var template = fs.readFileSync(baseDir +"template.myinfo.html", "UTF8");
var uiHomeHelperFunctions = fs.readFileSync(baseDir +"uiHomeHelperFunctions.def", "UTF8");
var defs = {};

defs.loadfile = function(path) {
	return fs.readFileSync(baseDir + path);
};

dots.templateSettings = {
	evaluate:    /\{\{([\s\S]+?)\}\}/g,
	interpolate: /\{\{=([\s\S]+?)\}\}/g,
	encode:      /\{\{!([\s\S]+?)\}\}/g,
//	use:         /\{\{#([\s\S]+?)\}\}/g,
	use:         /\<\!\-\-\#([\s\S]+?)\x\-\-\>/g,
	define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
//	conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
	conditional: /\<\!\-\-\?(\?)?\s*([\s\S]*?)\s*\x\-\-\>/g,
	iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
	varname: 'it',
	strip: false,
	append: true,
	selfcontained: false
};

var uiHomeHelperFunctionsHtml = dots.template(uiHomeHelperFunctions, undefined, defs);
var generator = dots.template(template, undefined, defs);

fs.writeFileSync(baseDir +"static.myinfo.html", generator({generateEmpty: true}), "UTF8");

console.log("done");

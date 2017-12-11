// ToDo: Végignézni, h mindenhol ahol logolok megfelelő szintet használok e.
var ERROR = {id: 0, text: "ERROR", css: "color:red"},
	WARNING = {id: 1, text: "WARNING", css: "color:orange"},
	INFO = {id: 2, text: "INFO", css: "color:green"},
	DEBUG = {id: 3, text: "DEBUG", css: "color:black"};
var textCss = "color:black";
var logLevel = 3;
var indent = "";
var indentstr = "-->";


function setLogLevel( level) {
	logLevel = level.id;
};

function log(level, txt) {
	if (level.id <= logLevel) {
		console.log(indent + "%c" + level.text + ": %c" + txt, level.css, textCss);
	}
};

function loginc() {
	indent += indentstr;
};

function logdec() {
	if (indent !== "") {
		indent = indent.substring(0, indent.length - indentstr.length);
	}
};


export {setLogLevel, log, loginc, logdec, ERROR, WARNING, INFO, DEBUG};

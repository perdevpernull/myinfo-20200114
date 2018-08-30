// ToDo: Végignézni, h mindenhol ahol logolok megfelelő szintet használok e.
class Log {
	constructor() {
		this.indent = "";
		this.indentstr = "-->";
		this.textCss = "color:black";

		this.lvl_ERROR = {id: 0, text: "ERROR", css: "color:red"};
		this.lvl_WARNING = {id: 1, text: "WARNING", css: "color:orange"};
		this.lvl_INFO = {id: 2, text: "INFO", css: "color:green"};
		this.lvl_DEBUG = {id: 3, text: "DEBUG", css: "color:black"};
		
		this.logLevel = this.DEBUG.id;
	};

	setLogLevel(level) {
		this.logLevel = level.id;
	};
	
	loginc() {
		this.indent += this.indentstr;
	};

	logdec() {
		if (this.indent !== "") {
			this.indent = this.indent.substring(0, this.indent.length - this.indentstr.length);
		};
	};

	log(level, txt) {
		if (level.id <= this.logLevel) {
			console.log(this.indent + "%c" + level.text + ": %c" + txt, level.css, this.textCss);
		};
	};

	ERROR(txt) {
		this.log(this.lvl_ERROR, txt);
	};

	WARNING(txt) {
		this.log(this.lvl_WARNING, txt);
	};

	INFO(txt) {
		this.log(this.lvl_INFO, txt);
	};

	DEBUG(txt) {
		this.log(this.lvl_DEBUG, txt);
	};
};

var log = new Log();
export {log};

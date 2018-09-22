import uiLp_thebrain from "./uiLp_thebrain.def";
import dots from "dot";

var defs = {};

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

var uiLp_thebrainHtml = dots.template(uiLp_thebrain, undefined, defs);

export {uiLp_thebrainHtml};

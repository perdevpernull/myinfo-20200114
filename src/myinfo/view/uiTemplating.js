import ui from "./ui.def";
import uiHomeHelperFunctions from "./uiHomeHelperFunctions.def";
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

var uiHtml = dots.template(ui, undefined, defs);
var uiAddMenuHtml = dots.template("<!--#def.uiAddMenu x-->", undefined, defs);
var uiAddWsHtml = dots.template("<!--#def.uiAddWs x-->", undefined, defs);
var uiHomeHelperFunctionsHtml = dots.template(uiHomeHelperFunctions, undefined, defs);
var uiHomeControlHtml = dots.template("<!--#def.uiHomeControl x-->", undefined, defs);
var uiHomeCardHeaderHtml = dots.template("<!--#def.uiHomeCardHeader x-->", undefined, defs);
var uiHomeCardViewsHtml = dots.template("<!--#def.uiHomeCardViews x-->", undefined, defs);
var uiHomeCardFooterHtml = dots.template("<!--#def.uiHomeCardFooter x-->", undefined, defs);
var uiHomeNewCardHtml = dots.template("<!--#def.uiHomeNewCard x-->", undefined, defs);

export {uiHtml, uiAddMenuHtml, uiAddWsHtml, uiHomeControlHtml, uiHomeCardHeaderHtml, uiHomeCardViewsHtml, uiHomeCardFooterHtml, uiHomeNewCardHtml};

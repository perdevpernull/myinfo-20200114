// ToDo:
//		1. View váltás
//		2. View mentés (új bejegyzés létrehozása a tömbben)
//		3. Teljes config DB mentés

// ToDo: a code (pl.: layoutPlugins[key].code) helyett key-t használni.

import {log, ERROR, WARNING, INFO, DEBUG} from "../common/util/log";
var undefined;

var preferences = {
};

var config = {
	dataset: {
		layoutModules: [
			{code: "layout_default", link: "layout_default.js", init: null, refresh: null, resize: null, destroy: null}
		]
	},

	getLayoutModules: function() {
		return config.dataset.layoutModules;
	},

	setLayoutModuleFunctions: function(layoutModuleCode, initFunc, refreshFunc, resizeFunc, destroyFunc) {
		var layoutModuleIndex = config.dataset.layoutModules.findIndex( function(element) {
				return (element.code === layoutModuleCode);
			});

		if (layoutModuleIndex > -1) {
			config.dataset.layoutModules[layoutModuleIndex].init = initFunc;
			config.dataset.layoutModules[layoutModuleIndex].refresh = refreshFunc;
			config.dataset.layoutModules[layoutModuleIndex].resize = resizeFunc;
			config.dataset.layoutModules[layoutModuleIndex].destroy = destroyFunc;
		} else {
			log(DEBUG, `FAILED: setLayoutModuleFunctions(${layoutModuleCode}, init, refresh)`);
		};
	},

	initSelectedLayoutModule: function(width, height) {
		var layoutModuleCode;
		var layoutModuleIndex;

		layoutModuleCode = config.dataset.views[config.dataset.selectedViewIndex].layoutModuleCode;
		layoutModuleIndex = config.dataset.layoutModules.findIndex( function(element) {
				return (element.code === layoutModuleCode);
			});
		config.dataset.layoutModules[layoutModuleIndex].init(width, height);
	},

	refreshSelectedLayoutModule: function() {
		var layoutModuleCode;
		var layoutModuleIndex;

		layoutModuleCode = config.dataset.views[config.dataset.selectedViewIndex].layoutModuleCode;
		layoutModuleIndex = config.dataset.layoutModules.findIndex( function(element) {
				return (element.code === layoutModuleCode);
			});
		config.dataset.layoutModules[layoutModuleIndex].refresh(this.dataset.views[this.dataset.selectedViewIndex]);
	},

	resizeSelectedLayoutModule: function(width, height) {
		var layoutModuleCode;
		var layoutModuleIndex;

		layoutModuleCode = config.dataset.views[config.dataset.selectedViewIndex].layoutModuleCode;
		layoutModuleIndex = config.dataset.layoutModules.findIndex( function(element) {
				return (element.code === layoutModuleCode);
			});
		config.dataset.layoutModules[layoutModuleIndex].resize(width, height);
	},

	destroySelectedLayoutModule: function() {
		var layoutModuleCode;
		var layoutModuleIndex;

		layoutModuleCode = config.dataset.views[config.dataset.selectedViewIndex].layoutModuleCode;
		layoutModuleIndex = config.dataset.layoutModules.findIndex( function(element) {
				return (element.code === layoutModuleCode);
			});
		config.dataset.layoutModules[layoutModuleIndex].destroy();
	}
};

export {preferences};

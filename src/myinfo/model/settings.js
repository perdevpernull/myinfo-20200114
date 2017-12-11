import {log, loginc, logdec, ERROR, WARNING, INFO, DEBUG} from "../../common/util/log";
var undefined;


var settings = {
	_data: {msg: "You have to initialize first!"},

	init: function(jsonData) {
		loginc();
		log(DEBUG, `settings.init(${jsonData})`);
		if (jsonData === undefined) {
			// ToDo: Majd ezt innen ki kell szervezni, h csak tényleges adattal lehessen inicializálni.
			this._data = {
				dataPlugins: {
					"dp_note": {key: "dp_note", link: "dp_note.js", registered: false}
				},
				layoutPlugins: {
					"lp_thebrain": {key: "lp_thebrain", link: "lp_thebrain.js", class: undefined, dpDependencies: ["dp_note"]}
				}
			};
		} else {
			this._data = jsonData;
		};
		log(DEBUG, JSON.stringify(this._data));
		logdec();
	},

	getJsonData() {
		loginc();
		log(DEBUG, `settings.getJsonData()`);
		logdec();
		return JSON.stringify(this._data);
	},

	getDataPlugins() {
		loginc();
		log(DEBUG, `settings.getDataPlugins()`);
		logdec();
		return this._data.dataPlugins;
	},

	registerDataPlugin(dataPluginKey) { //, dataPluginClass) {
		loginc();
		log(INFO, `settings.registerDataPlugin(${dataPluginKey})`);
		/*if (this._data.dataPlugins[dataPluginKey].class === undefined) {
			log(DEBUG, `settings.registerDataPlugin(${dataPluginKey}).class`);
			this._data.dataPlugins[dataPluginKey].class = dataPluginClass;
		} else {
			log(ERROR, `settings.registerDataPlugin(${dataPluginKey}).class already registered`);
		};*/

		if (this._data.dataPlugins[dataPluginKey].registered === false) {
			log(DEBUG, `settings.registerDataPlugin(${dataPluginKey}).registered(true)`);
			this._data.dataPlugins[dataPluginKey].registered = true;
		} else {
			log(ERROR, `settings.registerDataPlugin(${dataPluginKey}) already registered`);
		};

		logdec();
	},

	getLayoutPlugins() {
		loginc();
		log(DEBUG, `settings.getLayoutPlugins()`);
		logdec();
		return this._data.layoutPlugins;
	},

	registerLayoutPlugin(layoutPluginKey, layoutPluginClass) {
		loginc();
		log(INFO, `settings.registerLayoutPlugin(${layoutPluginKey})`);
		if (this._data.layoutPlugins[layoutPluginKey].class === undefined) {
			log(DEBUG, `settings.registerLayoutPlugin(${layoutPluginKey}).class`);
			this._data.layoutPlugins[layoutPluginKey].class = layoutPluginClass;
		} else {
			log(ERROR, `settings.registerLayoutPlugin(${layoutPluginKey}).class already registered`);
		}
		logdec();
	},

	getLayoutPluginClass(layoutPluginKey) {
		loginc();
		log(DEBUG, `settings.getLayoutPluginClass(${layoutPluginKey})`);
		if (this._data.layoutPlugins[layoutPluginKey].class) {
			log(DEBUG, `settings.getLayoutPluginClass(${layoutPluginKey}).loaded`);
			logdec();
			return this._data.layoutPlugins[layoutPluginKey].class;
		} else {
			log(ERROR, `settings.getLayoutPluginClass(${layoutPluginKey}).not_loaded`);
			logdec();
			return undefined;
		};
	}

};


export {settings};

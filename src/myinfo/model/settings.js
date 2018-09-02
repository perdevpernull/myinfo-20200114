import {log} from "../../common/util/log";


class Settings {
	constructor(jsonData) {
		log.loginc();
		log.DEBUG(`Settings.constructor(${jsonData})`);
		if (jsonData === null) {
			this._data = {msg: "You have to initialize first!"};
		} else {
			this._data = jsonData;
			this._dataTmp = {dataPlugins: {}, layoutPlugins: {}};
		};
		log.DEBUG(JSON.stringify(this._data));
		log.logdec();
	};

	getJsonData() {
		log.loginc();
		log.DEBUG(`Settings.getJsonData()`);
		log.logdec();
		return JSON.stringify(this._data);
	};

	getDataPlugins() {
		log.loginc();
		log.DEBUG(`Settings.getDataPlugins()`);
		log.logdec();
		return this._data.dataPlugins;
	};

	registerDataPlugin(dataPluginKey) {
		log.loginc();
		log.INFO(`Settings.registerDataPlugin(${dataPluginKey})`);

		if (this.getDataPluginRegistered(dataPluginKey) === false) {
			log.DEBUG(`Settings.registerDataPlugin(${dataPluginKey}).registered(true)`);
			this._dataTmp.dataPlugins[dataPluginKey].registered = true;
		} else {
			log.ERROR(`Settings.registerDataPlugin(${dataPluginKey}).already_registered`);
		};

		log.logdec();
	};

	getDataPluginRegistered(dataPluginKey) {
		log.loginc();
		log.INFO(`Settings.getDataPluginRegistered(${dataPluginKey})`);
		if (!this._dataTmp.dataPlugins[dataPluginKey]) {
			this._dataTmp.dataPlugins[dataPluginKey] = {registered: false};
		};
		log.logdec();
		return this._dataTmp.dataPlugins[dataPluginKey].registered;
	};

	getLayoutPlugins() {
		log.loginc();
		log.DEBUG(`Settings.getLayoutPlugins()`);
		log.logdec();
		return this._data.layoutPlugins;
	};

	registerLayoutPlugin(layoutPluginKey, layoutPluginClass) {
		log.loginc();
		log.INFO(`Settings.registerLayoutPlugin(${layoutPluginKey})`);
		if (this.getLayoutPluginClass(layoutPluginKey) === null) {
			log.DEBUG(`Settings.registerLayoutPlugin(${layoutPluginKey}).class.registered`);
			this._dataTmp.layoutPlugins[layoutPluginKey].class = layoutPluginClass;
		} else {
			log.ERROR(`Settings.registerLayoutPlugin(${layoutPluginKey}).class.already_registered`);
		}
		log.logdec();
	};

	getLayoutPluginClass(layoutPluginKey) {
		log.loginc();
		log.DEBUG(`Settings.getLayoutPluginClass(${layoutPluginKey})`);

		if (!this._dataTmp.layoutPlugins[layoutPluginKey]) {
			this._dataTmp.layoutPlugins[layoutPluginKey] = {class: null};
		};
		log.logdec();
		return this._dataTmp.layoutPlugins[layoutPluginKey].class;
	};
};

export {Settings};

import {log, loginc, logdec, ERROR, WARNING, INFO, DEBUG} from "../../common/util/log";


class Settings {
	constructor(jsonData) {
		loginc();
		log(DEBUG, `Settings.constructor(${jsonData})`);
		if (jsonData === null) {
			this._data = {msg: "You have to initialize first!"};
		} else {
			this._data = jsonData;
		};
		log(DEBUG, JSON.stringify(this._data));
		logdec();
	};

	getJsonData() {
		loginc();
		log(DEBUG, `Settings.getJsonData()`);
		logdec();
		return JSON.stringify(this._data);
	};

	getDataPlugins() {
		loginc();
		log(DEBUG, `Settings.getDataPlugins()`);
		logdec();
		return this._data.dataPlugins;
	};

	registerDataPlugin(dataPluginKey) {
		loginc();
		log(INFO, `Settings.registerDataPlugin(${dataPluginKey})`);

		if (this._data.dataPlugins[dataPluginKey].registered === false) {
			log(DEBUG, `Settings.registerDataPlugin(${dataPluginKey}).registered(true)`);
			this._data.dataPlugins[dataPluginKey].registered = true;
		} else {
			log(ERROR, `Settings.registerDataPlugin(${dataPluginKey}).already_registered`);
		};

		logdec();
	};

	getLayoutPlugins() {
		loginc();
		log(DEBUG, `Settings.getLayoutPlugins()`);
		logdec();
		return this._data.layoutPlugins;
	};

	registerLayoutPlugin(layoutPluginKey, layoutPluginClass) {
		loginc();
		log(INFO, `Settings.registerLayoutPlugin(${layoutPluginKey})`);
		if (this._data.layoutPlugins[layoutPluginKey].class === null) {
			log(DEBUG, `Settings.registerLayoutPlugin(${layoutPluginKey}).class.registered`);
			this._data.layoutPlugins[layoutPluginKey].class = layoutPluginClass;
		} else {
			log(ERROR, `Settings.registerLayoutPlugin(${layoutPluginKey}).class.already_registered`);
		}
		logdec();
	};

	getLayoutPluginClass(layoutPluginKey) {
		loginc();
		log(DEBUG, `Settings.getLayoutPluginClass(${layoutPluginKey})`);
		if (this._data.layoutPlugins[layoutPluginKey].class) {
			log(DEBUG, `settings.getLayoutPluginClass(${layoutPluginKey}).returned`);
			logdec();
			return this._data.layoutPlugins[layoutPluginKey].class;
		} else {
			log(ERROR, `settings.getLayoutPluginClass(${layoutPluginKey}).null`);
			logdec();
			return null;
		};
	};
};

export {Settings};

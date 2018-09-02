import {log} from "../../common/util/log";


class Settings {
	constructor(jsonData) {
		log.loginc();
		log.DEBUG(`Settings.constructor(${jsonData})`);
		if (jsonData === null) {
			this._data = {msg: "You have to initialize first!"};
		} else {
			this._data = jsonData;
			this._initRegistrations();
		};
		log.DEBUG(JSON.stringify(this._data));
		log.logdec();
	};

	_initRegistrations() {
		// Clear DataPlugin registrations
		for (var dataPluginKey in this._data.dataPlugins) {
			this._data.dataPlugins[dataPluginKey].registered = false;
		};
		// Clear LayoutPlugin registrations
		for (var layoutPluginKey in this._data.layoutPlugins) {
			this._data.layoutPlugins[layoutPluginKey].class = null;
		};
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

		if (this._data.dataPlugins[dataPluginKey].registered === false) {
			log.DEBUG(`Settings.registerDataPlugin(${dataPluginKey}).registered(true)`);
			this._data.dataPlugins[dataPluginKey].registered = true;
		} else {
			log.ERROR(`Settings.registerDataPlugin(${dataPluginKey}).already_registered`);
		};

		log.logdec();
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
		if (this._data.layoutPlugins[layoutPluginKey].class === null) {
			log.DEBUG(`Settings.registerLayoutPlugin(${layoutPluginKey}).class.registered`);
			this._data.layoutPlugins[layoutPluginKey].class = layoutPluginClass;
		} else {
			log.ERROR(`Settings.registerLayoutPlugin(${layoutPluginKey}).class.already_registered`);
		}
		log.logdec();
	};

	getLayoutPluginClass(layoutPluginKey) {
		log.loginc();
		log.DEBUG(`Settings.getLayoutPluginClass(${layoutPluginKey})`);
		if (this._data.layoutPlugins[layoutPluginKey].class) {
			log.DEBUG(`Settings.getLayoutPluginClass(${layoutPluginKey}).returned`);
			log.logdec();
			return this._data.layoutPlugins[layoutPluginKey].class;
		} else {
			log.ERROR(`Settings.getLayoutPluginClass(${layoutPluginKey}).null`);
			log.logdec();
			return null;
		};
	};
};

export {Settings};

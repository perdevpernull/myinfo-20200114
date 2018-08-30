import {log} from "../common/util/log";

// This is the LayoutPlugin interface.
class LayoutPlugin {
	constructor(datasetKey, viewKey, datasetInstance, view) {
		this.datasetKey = datasetKey;
		this.viewKey = viewKey;
		this._datasetInstance = datasetInstance;
		this._view = view;
	};

	constructLayout() {
		log.ERROR("LayoutPlugin.constructLayout()");
	};

	destructLayout() {
		log.ERROR("LayoutPlugin.destructLayout()");
	};

	resizeLayout() {
		log.ERROR("LayoutPlugin.resizeLayout()");
	};

	refreshLayout() {
		log.ERROR("LayoutPlugin.refreshLayout()");
	};

	eventListenerKeydown() {
		log.ERROR("LayoutPlugin.eventListenerKeydown()");
	};
};

export {LayoutPlugin};

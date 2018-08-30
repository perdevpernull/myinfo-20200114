import {log} from "../../common/util/log";


class UserData {
	constructor(jsonData) {
		log.loginc();
		log.DEBUG(`UserData.constructor(${jsonData})`);
		if (jsonData === null) {
			this._data = {msg: "You have to initialize first!"};
		} else {
			this._data = jsonData;
		};
		log.logdec();
	};

	getJsonData() {
		log.loginc();
		log.DEBUG(`UserData.getJsonData()`);
		log.logdec();
		return JSON.stringify(this._data);
	};

	getDatasets() {
		log.loginc();
		log.DEBUG(`UserData.getDatasets()`);
		log.logdec();
		return this._data.datasets;
	};

	getDataset(datasetKey) {
		log.loginc();
		log.DEBUG(`UserData.getDataset(${datasetKey})`);
		log.logdec();
		return this._data.datasets[datasetKey];
	};

	addDataset(datasetTitle, datasetDescription, datasetLink) {
		log.loginc();
		log.DEBUG(`UserData.addDataset(${datasetTitle},${datasetDescription},${datasetLink})`);
		var datasetID = this._data.nextDatasetID;
		var datasetKey = "ID"+datasetID;
		this._data.nextDatasetID = this._data.nextDatasetID + 1;
		this._data.datasets[datasetKey] = {
			ID: datasetID,
			imgSrc: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15de0854d81%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15de0854d81%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22109.203125%22%20y%3D%2297.2%22%3EImage%20cap%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E",
			title: datasetTitle,
			description: datasetDescription,
			link: datasetLink,
			tabIndex: null,
			instance: null,
			selectedViewIndex: 0,
			nextViewID: 1,
			views: {
				ID0: {
					ID: 0, layoutPluginKey: "lp_thebrain", title: "Default view", instance: null,
					viewData: {
						selectedNodeID: 0,
						animationDuration: 400,
						node: {
							actualColor: "#f77",
							actualOpacity: 0.9,
							childColor: "#ff7",
							childOpacity: 0.9,
							parentColor: "#7ff",
							parentOpacity: 0.9,
							siblingColor: "#7f7",
							siblingOpacity: 0.9,
							friendColor: "#77f",
							friendOpacity: 0.9,
							Color: "#fff"
						}
					}
				}
			}
		};
		log.logdec();
		return datasetKey;
	};

	getDatasetInstance(datasetKey) {
		log.loginc();
		log.DEBUG(`UserData.getDatasetInstance(${datasetKey})`);
		log.logdec();
		return this._data.datasets[datasetKey].instance;
	};

	setDatasetInstance(datasetKey, datasetInstance) {
		log.loginc();
		log.INFO(`UserData.setDatasetInstance(${datasetKey})`);
		this._data.datasets[datasetKey].instance = datasetInstance;
		log.logdec();
	};

	getView(datasetKey, viewKey) {
		if (!viewKey) {
			viewKey = `ID${this._data.datasets[datasetKey].selectedViewIndex}`;
		};
		return this._data.datasets[datasetKey].views[viewKey];
	};

	setLayoutPluginInstance(datasetKey, viewKey, layoutPluginInstance) {
		var view = this.getView(datasetKey, viewKey);
		if (view) {
			view.instance = layoutPluginInstance;
		} else {
			log.ERROR(`UserData.setLayoutPluginInstance(${datasetKey},${viewKey}) not exists`);
		};
	};

	getLayoutPluginInstance(datasetKey, viewKey) {
		var instance;
		var view = this.getView(datasetKey, viewKey);
		if (view) {
			instance = view.instance;
		};
		return instance;
	};
};


export {UserData};

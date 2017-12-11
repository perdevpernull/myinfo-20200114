// ToDo:
//	- instance állítást megcsinálni
//	- Az egész osztályt át kell írni dataModule-ra.
//		- Külön osztály ami nem öröklődik a Dataset-ből
//		- A constructor-ban megkapja a Datasetinstance-t
//		- Amiben ha még nem létezik a "datasetForViews" szekció akkor létrehozza.
import {default as Dataset} from "./dataset/dataset";
var undefined;


class DatasetForViews extends Dataset {
	constructor(json) {
		super(json);
		this._data.plugins["datasetForViews"] = {
			selectedViewIndex: 1,
			nextViewID: 2,
			views: {
				ID0: {
					ID: 0, layoutPluginKey: "lp_thebrain", title: "Default view", instance: undefined,
					viewData: {
						selectedNodeID: 0
					}
				},
				ID1: {
					ID: 1, layoutPluginKey: "lp_thebrain", title: "TheBrain view2", instance: undefined,
					viewData: {
						selectedNodeID: 2
					}
				}
			}
		};
	};

	addView(layoutPluginKey, title, viewData) {
		var viewID = this._data.plugins["datasetForViews"].nextViewID;
		this._data.plugins["datasetForViews"].nextViewID = this._data.plugins["datasetForViews"].nextViewID + 1;
		this._data.plugins["datasetForViews"].views[`ID${viewID}`] = {
			ID: viewID,
			layoutPluginKey: layoutPluginKey,
			title: title,
			viewData: viewData
		};
		return viewID;
	};

	deleteView(viewID) {
		return (delete this._data.plugins["datasetForViews"].views[`ID${viewID}`]);
	};

	getSelectedView() {
		var tmpData = this._data.plugins["datasetForViews"];
		return (tmpData.views[`ID${tmpData.selectedViewIndex}`]);
	};

	setLayoutPluginInstance(viewID, layoutPluginInstance) {
		var tmpData = this._data.plugins["datasetForViews"];
		tmpData.views[`ID${viewID}`].instance = layoutPluginInstance;
	};

	getLayoutPluginInstance(viewID) {
		var tmpData = this._data.plugins["datasetForViews"];
		return tmpData.views[`ID${viewID}`].instance;
	};
};


export {DatasetForViews};

import {setLogLevel, log, loginc, logdec, ERROR, WARNING, INFO, DEBUG} from "../common/util/log";
import {loadJson} from "../common/util/loadjson";
import {loadPlugins} from "../common/util/loadplugins";
import {Settings} from "./model/settings";
import {UserData} from "./model/userdata";
import {Dataset} from "../common/model/dataset";
import {uiInit, uiRefreshHome, uiAddMenuAndWs, uiDeleteMenuAndWs} from "./view/ui";

var _this = null;
class MyInfo {
	constructor(domID) {
		_this = this;
		// Initial settings
		setLogLevel(DEBUG);
	
		if (domID === null) {
			_this.mainDomID = "#myinfo";
		} else {
			_this.mainDomID = domID;
		};
	
		log(INFO, `main.constructor(${_this.mainDomID})`);
	
		loadJson("/api/v1/settings", function(json) {
			log(INFO, "settings.json loaded");
			_this.settings = new Settings(json);
	
			var dataPlugins = _this.settings.getDataPlugins();
			loadPlugins(dataPlugins, function() {
				log(INFO, "dataPlugins loaded");
	
				var layoutPlugins = _this.settings.getLayoutPlugins();
				loadPlugins(layoutPlugins, function() {
					log(INFO, "layoutPlugins loaded");
	
					loadJson("/api/v1/userdata", function(json) {
						log(INFO, "userdata.json loaded");
						_this.userData = new UserData(json);
	
						uiInit(_this.mainDomID);
						uiRefreshHome(_this.userData.getDatasets());
					});
				});
			});
		});
	};

	refreshHome() {
		log(DEBUG, `main.refreshHome()`);
		uiRefreshHome(_this.userData.getDatasets());
	};
	
	openDataset(datasetKey, viewKey) {
		log(DEBUG, `main.openDataset(${datasetKey},${viewKey})`);
		if (datasetKey === "OpenNew") {
			// ToDo: meg kell írni.
		} else if (datasetKey === "CreateNew") {
			// ToDo: meg kell írni.
		} else {
			var dataset = _this.userData.getDataset(datasetKey);
			if (dataset) {
				if (!dataset.tabIndex) {
					loadJson(dataset.link, function(json) {
						log(INFO, `${dataset.link} loaded`);
	
						var datasetInstance = new Dataset(json);
						_this.userData.setDatasetInstance(datasetKey, datasetInstance);
	
						var view = _this.userData.getView(datasetKey, viewKey);
						viewKey = "ID"+view.ID;
	
						dataset.tabIndex = uiAddMenuAndWs(datasetKey, `${dataset.title}:${view.title}`);
						// Activate the newly added tab
							$(`#menu li:eq(${dataset.tabIndex}) a`).tab('show');
	
						var lp_instance = _this.userData.getLayoutPluginInstance(datasetKey, viewKey);
						if (!lp_instance) {
							lp_instance = new (_this.settings.getLayoutPluginClass(view.layoutPluginKey))(datasetKey, viewKey, datasetInstance, view);
							_this.userData.setLayoutPluginInstance(datasetKey, viewKey, lp_instance);
						};
						lp_instance.constructLayout($(_this.mainDomID).width(),$(_this.mainDomID).height() - 100);
	
						// Időőt kell hagyni az új tab megjelenésének (mert amíg nem jelent meg teljesen, addig a getBBox() fv nem működik.)
							setTimeout(function(){ lp_instance.refreshLayout(); }, 1000);
						//lp_instance.destructLayout();
	
						uiRefreshHome(_this.userData.getDatasets());
					});
				} else {
					$(`#menu li:eq(${dataset.tabIndex}) a`).tab('show');
					log(DEBUG, "Already open");
				};
			} else {
				log(ERROR, "Nonexistent");
			};
		};
	};
	
	registerDataPlugin(dataPluginKey, dataPluginInstall) { //, dataPluginClass) {
		dataPluginInstall(Dataset);
		_this.settings.registerDataPlugin(dataPluginKey); //, dataPluginClass);
	};
	
	registerLayoutPlugin(layoutPluginKey, layoutPluginClass) {
		_this.settings.registerLayoutPlugin(layoutPluginKey, layoutPluginClass);
	};
	
};


//export {refreshHome, openDataset, registerDataPlugin, registerLayoutPlugin};
export {MyInfo};

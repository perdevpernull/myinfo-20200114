import {setLogLevel, log, loginc, logdec, ERROR, WARNING, INFO, DEBUG} from "../common/util/log";
import {loadJson} from "../common/util/loadjson";
import {loadPlugins} from "../common/util/loadplugins";
import {settings} from "./model/settings";
import {userData} from "./model/userdata";
import {Dataset} from "../common/model/dataset";
import {uiInit, uiRefreshHome, uiAddMenuAndWs, uiDeleteMenuAndWs} from "./view/ui";


class MyInfo {
	constructor(domID) {
		// Initial settings
		setLogLevel(DEBUG);
	
		if (domID === null) {
			this.mainDomID = "#myinfo";
		} else {
			this.mainDomID = domID;
		};
	
		log(INFO, `main.run(${this.mainDomID})`);
	
		loadJson("/api/v1/settings", function(json) {
			log(INFO, "settings.json loaded");
			settings.init(json);
	
			var dataPlugins = settings.getDataPlugins();
			loadPlugins(dataPlugins, function() {
				log(INFO, "dataPlugins loaded");
	
				var layoutPlugins = settings.getLayoutPlugins();
				loadPlugins(layoutPlugins, function() {
					log(INFO, "layoutPlugins loaded");
	
					loadJson("/api/v1/userdata", function(json) {
						log(INFO, "userdata.json loaded");
						userData.init(json);
	
						uiInit(this.mainDomID);
						uiRefreshHome(userData.getDatasets());
					});
				});
			});
		});
	};

	refreshHome() {
		log(DEBUG, `main.refreshHome()`);
		uiRefreshHome(userData.getDatasets());
	};
	
	openDataset(datasetKey, viewKey) {
		log(DEBUG, `main.openDataset(${datasetKey},${viewKey})`);
		if (datasetKey === "OpenNew") {
			// ToDo: meg kell írni.
		} else if (datasetKey === "CreateNew") {
			// ToDo: meg kell írni.
		} else {
			var dataset = userData.getDataset(datasetKey);
			if (dataset) {
				if (!dataset.tabIndex) {
					loadJson(dataset.link, function(json) {
						log(INFO, `${dataset.link} loaded`);
	
						var datasetInstance = new Dataset(json);
						userData.setDatasetInstance(datasetKey, datasetInstance);
	
						var view = userData.getView(datasetKey, viewKey);
						viewKey = "ID"+view.ID;
	
						dataset.tabIndex = uiAddMenuAndWs(datasetKey, `${dataset.title}:${view.title}`);
						// Activate the newly added tab
							$(`#menu li:eq(${dataset.tabIndex}) a`).tab('show');
	
						var lp_instance = userData.getLayoutPluginInstance(datasetKey, viewKey);
						if (!lp_instance) {
							lp_instance = new (settings.getLayoutPluginClass(view.layoutPluginKey))(datasetKey, viewKey, datasetInstance, view);
							userData.setLayoutPluginInstance(datasetKey, viewKey, lp_instance);
						};
						lp_instance.constructLayout($(this.mainDomID).width(),$(this.mainDomID).height() - 100);
	
						// Időőt kell hagyni az új tab megjelenésének (mert amíg nem jelent meg teljesen, addig a getBBox() fv nem működik.)
							setTimeout(function(){ lp_instance.refreshLayout(); }, 1000);
						//lp_instance.destructLayout();
	
						uiRefreshHome(userData.getDatasets());
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
		settings.registerDataPlugin(dataPluginKey); //, dataPluginClass);
	};
	
	registerLayoutPlugin(layoutPluginKey, layoutPluginClass) {
		settings.registerLayoutPlugin(layoutPluginKey, layoutPluginClass);
	};
	
};


//export {refreshHome, openDataset, registerDataPlugin, registerLayoutPlugin};
export {MyInfo};

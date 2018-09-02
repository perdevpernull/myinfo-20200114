import {log} from "../common/util/log";
import {loadJson} from "../common/util/loadjson";
import {postJson} from "../common/util/postjson";
import {loadPlugins} from "../common/util/loadplugins";
import {Settings} from "./model/settings";
import {UserData} from "./model/userdata";
import {Dataset} from "../common/model/dataset";
import {UI} from "./view/ui";


var _this = null;
class MyInfo {
	constructor(domID) {
		if (_this === null) {
			_this = this;
			// Initial settings
			log.setLogLevel(log.lvl_DEBUG);

			if (domID === null) {
				_this.mainDomID = "#myinfo";
			} else {
				_this.mainDomID = domID;
			};
	
			log.INFO(`MyInfo.constructor(${_this.mainDomID})`);

			loadJson("/api/v1/settings")
			.then( function(json) {
					log.INFO("Settings.json loaded");
				_this.settings = new Settings(json);

				var dataPlugins = _this.settings.getDataPlugins();
				loadPlugins(dataPlugins, function() {
					log.INFO("dataPlugins loaded");
					
					var layoutPlugins = _this.settings.getLayoutPlugins();
					loadPlugins(layoutPlugins, function() {
						log.INFO("layoutPlugins loaded");
						
						loadJson("/api/v1/userdata")
						.then( function(json) {
							log.INFO("UserData.json loaded");
							_this.userData = new UserData(json);
							
							_this.ui = new UI(_this.mainDomID);
							_this.ui.refreshHome(_this.userData.getDatasets());
						});
					});
				});
			});
		} else {
			log.ERROR("Settings is already created (singleton)");
		};
	};

	saveSettings() {
		log.DEBUG(`MyInfo.saveSettings()`);
		postJson("/api/v1/settings", _this.settings.getJsonData())
		.then( function(data) {
			if( data.status != 200) {
				log.DEBUG(`MyInfo.saveSettings().error(${data.status})`);
			} else {
				log.DEBUG(`MyInfo.saveSettings().success`);
			};
		})
		.catch(error => console.error(error));
	};

	loadUserData() {
		//
	};

	refreshHome() {
		log.DEBUG(`MyInfo.refreshHome()`);
		this.ui.refreshHome(this.userData.getDatasets());
	};
	
	openDataset(datasetKey, viewKey) {
		log.DEBUG(`MyInfo.openDataset(${datasetKey},${viewKey})`);
		if (datasetKey === "OpenNew") {
			// ToDo: meg kell írni.
		} else if (datasetKey === "CreateNew") {
			// ToDo: meg kell írni.
		} else {
			var dataset = _this.userData.getDataset(datasetKey);
			if (dataset) {
				if (!dataset.tabIndex) {
					loadJson(dataset.link)
					.then( function(json) {
						log.INFO(`${dataset.link} loaded`);
	
						var datasetInstance = new Dataset(json);
						_this.userData.setDatasetInstance(datasetKey, datasetInstance);
	
						var view = _this.userData.getView(datasetKey, viewKey);
						viewKey = "ID"+view.ID;
	
						dataset.tabIndex = _this.ui.addMenuAndWs(datasetKey, `${dataset.title}:${view.title}`);
	
						var lp_instance = _this.userData.getLayoutPluginInstance(datasetKey, viewKey);
						if (!lp_instance) {
							lp_instance = new (_this.settings.getLayoutPluginClass(view.layoutPluginKey))(datasetKey, viewKey, datasetInstance, view);
							_this.userData.setLayoutPluginInstance(datasetKey, viewKey, lp_instance);
						};
						lp_instance.constructLayout($(_this.mainDomID).width(),$(_this.mainDomID).height() - 100);
	
						// Időt kell hagyni az új tab megjelenésének (mert amíg nem jelent meg teljesen, addig a getBBox() fv nem működik.)
						setTimeout(function(){ lp_instance.refreshLayout(); }, 1000);
						//lp_instance.destructLayout();
	
						_this.ui.refreshHome(_this.userData.getDatasets());
					});
				} else {
					_this.ui.activateMenuAndWs(dataset.tabIndex);
					log.DEBUG("Already open");
				};
			} else {
				log.ERROR("Nonexistent");
			};
		};
	};
	
	saveDataset(datasetKey) {
		log.DEBUG(`MyInfo.saveDataset(${datasetKey})`);
		var dataset = _this.userData.getDataset(datasetKey);
		postJson(dataset.link, dataset.instance.getJsonData())
		.then( function(data) {
			if( data.status != 200) {
				log.DEBUG(`MyInfo.saveDataset(${datasetKey}).error(${data.status})`);
			} else {
				log.DEBUG(`MyInfo.saveDataset(${datasetKey}).success`);
			};
		})
		.catch(error => console.error(error));
	};

	registerDataPlugin(dataPluginKey, dataPluginInstall) { //, dataPluginClass) {
		dataPluginInstall(Dataset);
		_this.settings.registerDataPlugin(dataPluginKey); //, dataPluginClass);
	};
	
	registerLayoutPlugin(layoutPluginKey, layoutPluginClass) {
		_this.settings.registerLayoutPlugin(layoutPluginKey, layoutPluginClass);
	};
	
	test() {
		log.DEBUG("test() START");
		this.saveSettings();
		log.DEBUG("test() END");
	};
};


export {MyInfo};

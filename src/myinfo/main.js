import { setLogLevel, log, loginc, logdec, ERROR, WARNING, INFO, DEBUG } from "../common/util/log";
import { loadJson } from "../common/util/loadjson";
import { loadPlugins } from "../common/util/loadplugins";
import { loadUserData } from "../common/util/loadRemote";
import { settings } from "./model/settings";
import { userData, USER_DATA_STORE_KEY } from "./model/userdata";
import { Dataset } from "../common/model/dataset";
import { uiInit, uiRefreshHome, uiAddMenuAndWs, uiDeleteMenuAndWs } from "./view/ui";
var mainDomID;


var run = function (domID) {
	// Initial settings
	setLogLevel(DEBUG);

	if (domID === undefined) {
		mainDomID = "#myinfo";
	} else {
		mainDomID = domID;
	};

	log(INFO, `main.run(${mainDomID})`);

	loadJson("settings.json", function (json) {
		log(INFO, "settings.json loaded");
		// ToDo: Egyelőre a default értékekkel dolgozom.
		var emptyJson;
		settings.init(emptyJson);

		loadUserData((data) => {
			log(DEBUG, 'data= ' + data);
		});

		var dataPlugins = settings.getDataPlugins();
		loadPlugins(dataPlugins, function () {
			log(INFO, "dataPlugins loaded");

			var layoutPlugins = settings.getLayoutPlugins();
			loadPlugins(layoutPlugins, function () {
				log(INFO, "layoutPlugins loaded");

				var userdataJson = localStorage.loadJson(USER_DATA_STORE_KEY);
				if (userdataJson === null) {
					loadJson("userdata-ID0.json", function (json) {
						log(INFO, "userdata-ID0.json loaded");
						// TODO: Ezt kivenni, amikor már nincs szükség a teszt adatokra
						localStorage.storeJson(USER_DATA_STORE_KEY, json);
						userData.init(json);
					});
				} else {
					userData.init(userdataJson);
				}

				uiInit(mainDomID);
				uiRefreshHome(userData.getDatasets());
			});
		});
	});
};

var refreshHome = function () {
	log(DEBUG, `main.refreshHome()`);
	uiRefreshHome(userData.getDatasets());
};

var openDataset = function (datasetKey, viewKey) {
	log(DEBUG, `main.openDataset(${datasetKey},${viewKey})`);
	if (datasetKey === "OpenNew") {
		// ToDo: meg kell írni.
	} else {
		var dataset = userData.getDataset(datasetKey);
		if (dataset) {
			if (!dataset.tabIndex) {
				var localdataset = localStorage.loadJson(dataset.link);

				if (localdataset === null) {
					loadJson(dataset.link, function (json) {
						log(INFO, `${dataset.link} loaded`);

						var datasetInstance = new Dataset(json);
						userData.setDatasetInstance(datasetKey, datasetInstance);

						var view = userData.getView(datasetKey, viewKey);
						viewKey = "ID" + view.ID;

						dataset.tabIndex = uiAddMenuAndWs(datasetKey, `${dataset.title}:${view.title}`);
						// Activate the newly added tab
						$(`#menu li:eq(${dataset.tabIndex}) a`).tab('show');

						var lp_instance = userData.getLayoutPluginInstance(datasetKey, viewKey);
						if (!lp_instance) {
							lp_instance = new (settings.getLayoutPluginClass(view.layoutPluginKey))(datasetKey, viewKey, datasetInstance, view);
							userData.setLayoutPluginInstance(datasetKey, viewKey, lp_instance);
						};
						lp_instance.constructLayout($(mainDomID).width(), $(mainDomID).height() - 100);

						// Időt kell hagyni az új tab megjelenésének (mert amíg nem jelent meg teljesen, addig a getBBox() fv nem működik.)
						setTimeout(function () { lp_instance.refreshLayout(); }, 1000);
						//lp_instance.destructLayout();

						uiRefreshHome(userData.getDatasets());
					});
				} else {
					var datasetInstance = new Dataset(localdataset);
					userData.setDatasetInstance(datasetKey, datasetInstance);

					var view = userData.getView(datasetKey, viewKey);
					viewKey = "ID" + view.ID;

					dataset.tabIndex = uiAddMenuAndWs(datasetKey, `${dataset.title}:${view.title}`);
					// Activate the newly added tab
					$(`#menu li:eq(${dataset.tabIndex}) a`).tab('show');

					var lp_instance = userData.getLayoutPluginInstance(datasetKey, viewKey);
					if (!lp_instance) {
						lp_instance = new (settings.getLayoutPluginClass(view.layoutPluginKey))(datasetKey, viewKey, datasetInstance, view);
						userData.setLayoutPluginInstance(datasetKey, viewKey, lp_instance);
					};
					lp_instance.constructLayout($(mainDomID).width(), $(mainDomID).height() - 100);

					// Időt kell hagyni az új tab megjelenésének (mert amíg nem jelent meg teljesen, addig a getBBox() fv nem működik.)
					setTimeout(function () { lp_instance.refreshLayout(); }, 1000);
					//lp_instance.destructLayout();

					uiRefreshHome(userData.getDatasets());
				}
			} else {
				$(`#menu li:eq(${dataset.tabIndex}) a`).tab('show');
				log(DEBUG, "Already open");
			};
		} else {
			log(ERROR, "Nonexistent");
		};
	};
};

var createNewDataset = (datasetTitle, datasetDescription) => {
	var newDatasetId = userData.addDataset(datasetTitle, datasetDescription, "");

	var newDataset = new Dataset(null);
	var datasetLink = 'dataset-' + newDatasetId;

	var dataset = userData.getDataset(newDatasetId);
	dataset.link = datasetLink;

	log(DEBUG, `New dataset: ${JSON.stringify(newDataset.getJsonData())}`);
	// Store new dataset
	localStorage.storeJson(datasetLink, newDataset.getJsonData());
	// Update user data
	localStorage.storeJson(USER_DATA_STORE_KEY, userData.getJsonData());
};

var changeDatasetInfo = (datasetKey, datasetTitle, datasetDescription) => {
	var dataset = userData.getDataset(datasetKey);

	dataset.title = datasetTitle;
	dataset.description = datasetDescription;

	// Update info in store
	localStorage.storeJson(USER_DATA_STORE_KEY, userData.getJsonData());
	log(DEBUG, `Stored JSON: ${JSON.stringify(localStorage.loadJson(dataset.link))}`);
};

var deleteDataset = (datasetKey) => {
	log(DEBUG, `Delete dataset with key: ${datasetKey}`);
	var datasets = userData.getDatasets();
	delete datasets[datasetKey];

	// Update info in store
	localStorage.storeJson(USER_DATA_STORE_KEY, userData.getJsonData());
};

var registerDataPlugin = function (dataPluginKey, dataPluginInstall) { //, dataPluginClass) {
	dataPluginInstall(Dataset);
	settings.registerDataPlugin(dataPluginKey); //, dataPluginClass);
};

var registerLayoutPlugin = function (layoutPluginKey, layoutPluginClass) {
	settings.registerLayoutPlugin(layoutPluginKey, layoutPluginClass);
};

Storage.prototype.storeJson = (link, value) => {
	localStorage.setItem(link, JSON.stringify(value));
	log(INFO, `JSON stored with key [${link}]`);
};

Storage.prototype.loadJson = (link) => {
	var value = localStorage.getItem(link);
	log(INFO, `JSON loaded with key [${link}]
	data:
	${value}`);
	if (value === "undefined") {
		return null;
	}
	return value && JSON.parse(value);
};

export { run, refreshHome, openDataset, createNewDataset, changeDatasetInfo, deleteDataset, registerDataPlugin, registerLayoutPlugin };

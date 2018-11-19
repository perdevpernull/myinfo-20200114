import {log} from "../../common/util/log";
import {autosize} from "../../common/util/autosize";
import {uiHtml, uiAddMenuHtml, uiAddWsHtml, uiHomeControlHtml, uiHomeCardHeaderHtml,
	uiHomeCardViewsHtml, uiHomeCardFooterHtml, uiHomeNewCardHtml} from "./uiTemplating";


class UIHome {
	constructor() {
		$("#ws-home").append(uiHomeControlHtml({generateEmplty: false}));

		// Modal window: Edit
		autosize($("#dataset-description"));

		$("#dataset-editor").on("show.bs.modal", function (event) {
			// Button that triggered the modal
				var button = $(event.relatedTarget);

			// Extract info from data-* attributes
				var key = button.data("key");
				var title = button.data("title");
				var description = button.data("description");
			
			// If necessary, we could initiate an AJAX request here (and then do the updating in a callback).
			var modal = $(this);
			modal.find("#dataset-editorLabel").text(`Edit dataset's metadata (${key})`);
			$("#dataset-key").val(key);
			$("#dataset-title").val(title);
			$("#dataset-description").val(description);
		});

		$("#dataset-editor").on("shown.bs.modal", function (event) {
			autosize.update($("#dataset-description"));
		});

		$("#modal-save").click( function() {
			var key = $("#dataset-key").val();
			var title = $("#dataset-title").val();
			var description = $("#dataset-description").val();
			// ToDo: Innen a userData-t majd száműzni kell. Ne legyen importálva.
			var datasets = myinfo.userData.getDatasets();
			datasets[key].title = title;
			datasets[key].description = description;
			myinfo.refreshHome();
		});

		// Modal window: Delete
		$("#dataset-delete-confirm").on("show.bs.modal", function (event) {
			// Button that triggered the modal
				var button = $(event.relatedTarget);

			// Extract info from data-* attributes
				var key = button.data("key");
				var title = button.data("title");
			
			// If necessary, we could initiate an AJAX request here (and then do the updating in a callback).
			var modal = $(this);
			modal.find("#dataset-delete-confirmLabel").text(`Delete dataset (${key})`);
			modal.find("#dataset-delete-confirmLabel2").text(`Are you sure you want to delete dataset: '${title}'?`);
		});

		$("#modal-delete").click( function() {
			// ToDo: Törölni az adatbázisból az adott dataset-et.
			log.INFO("Deleted");
			myinfo.refreshHome();
		});

		$(`#ws-home-tab`).on("show.bs.tab", function (event) {
			myinfo.ui.activeTab = "home";
		});
	};

	refreshLayout(datasets) {
		var str, primary, open;
		$("#ws-home-list").empty();
		for (var datasetKey in datasets) {
			//open = (datasets[datasetKey].open ? "invisible": "");
			open = ( (myinfo.userData.getDatasetInstance(datasetKey) === null) ? "": "invisible");
			str = uiHomeCardHeaderHtml({
				datasetKey: datasetKey,
				imgSrc: datasets[datasetKey].imgSrc,
				open: open,
				datasetTitle: datasets[datasetKey].title,
				datasetDescription: datasets[datasetKey].description
			});
			for (var viewKey in datasets[datasetKey].views) {
				primary = ((datasets[datasetKey].selectedViewIndex === datasets[datasetKey].views[viewKey].ID) ? "btn-primary" : "btn-secondary");
				str += uiHomeCardViewsHtml({
					datasetKey: datasetKey,
					open: open,
					viewKey: viewKey,
					viewTitle: datasets[datasetKey].views[viewKey].title,
					viewPrimary: primary
				});
			};
			str += uiHomeCardFooterHtml({
				datasetKey: datasetKey,
				open: open,
				datasetTitle: datasets[datasetKey].title
			});
			$("#ws-home-list").append(str);
		};
		str = uiHomeNewCardHtml();
		$("#ws-home-list").append(str);
	};

	resizeLayout() {
		// Deliberately do nothing.
	};

	eventListenerKeydown() {
		// Deliberately do nothing.
	};

	eventListenerButton() {
		$(`#home-leftmenu`).modal("show");
	};
};

class UI {
	constructor(domID) {
		this.domID = domID;
		this.tabs = {};
		this.tabsLength = 0;
		this.activeTab = "";

		$(domID).append(uiHtml({generateEmplty: false}));

		this.tabs["home"] = {
			uiComponent: new UIHome()
		};
		this.tabsLength += 1;
		this.activeTab = "home";

		$("#sidebar-toggler").click( function() {
			myinfo.ui.eventListenerButton(this);
		});

		$(window).resize( function() {
			myinfo.ui.resize( $(window).width(), $(window).outerHeight(true));
		});

		$("body").on("keydown", function(e) {
			myinfo.ui.eventListenerKeydown(e);
		});
	};

	eventListenerKeydown(e) {
		this.tabs[this.activeTab].uiComponent.eventListenerKeydown(e);
	};

	eventListenerButton(uiElement) {
		this.tabs[this.activeTab].uiComponent.eventListenerButton(uiElement);
	};

	resize(newWidth, newHeight) {
		var heightOfOthers = $("#menu-bar").outerHeight(true);
		for (var datasetKey in this.tabs) {
			this.tabs[datasetKey].uiComponent.resizeLayout(newWidth, newHeight - heightOfOthers);
		};
	};

	refreshHome(datasets) {
		this.tabs["home"].uiComponent.refreshLayout(datasets);
	};

	addMenuAndWs(datasetKey, viewKey, menuTitle, lp_instance) {
		var tabKey = datasetKey + "-" + viewKey;
		this.tabs[tabKey] = {uiComponent: lp_instance};

		var str = uiAddMenuHtml({
			datasetKey: datasetKey,
			viewKey: viewKey,
			menuTitle: menuTitle
		});
		$("#menu").append(str);

		str = uiAddWsHtml({
			datasetKey: datasetKey,
			viewKey: viewKey
		});
		$("#ws-content").append(str);

		$(`#ws-${tabKey}-tab`).on("show.bs.tab", function (event) {
			myinfo.ui.activeTab = tabKey;
		});

		// Activate the newly added tab
		this.activateMenuAndWs(tabKey);
	};

	activateMenuAndWs(tabKey) {
		$(`#ws-${tabKey}-tab`).tab('show');
	};

	isMenuAndWs(tabKey) {
		var retval = true;
		if (!this.tabs[tabKey]) {
			retval = false;
		};
		return retval;
	};

	deleteMenuAndWs(tabKey) {
		// ToDo: Megcsinálni rendesen
		//$(`#menu-${datasetID}`).remove();
		//$(`#ws-${datasetID}`).remove();
	};
};


export {UI};

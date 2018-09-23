import {log} from "../../common/util/log";
import {autosize} from "../../common/util/autosize";
import {uiHtml, uiAddMenuHtml, uiAddWsHtml, uiHomeControlHtml, uiHomeCardHeaderHtml,
	uiHomeCardViewsHtml, uiHomeCardFooterHtml, uiHomeNewCardHtml} from "./uiTemplating";


class UIHome {
	constructor(domID) {

		$(domID).append(uiHomeControlHtml({generateEmplty: false}));

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
	};

	refresh(datasets) {
		var str, primary, open;
		$("#ws-home-list").empty();
		for (var datasetKey in datasets) {
			open = (datasets[datasetKey].open ? "invisible": "");
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
};

class UI {
	constructor(domID) {
		var str = uiHtml({generateEmplty: false});
		$(domID).append(str);

		this.home = new UIHome("#ws-home");

		// ToDo: Átnézendő.
		$("#ws-home-tab").on("show.bs.pill", function (e) {
			log.INFO("Helló-belló!");
			myinfo.refreshHome();
		});
		$("#sidebar-toggler").click( function() {
			log.INFO("Helló-belló2!");
			myinfo.refreshHome();
		});

		$(window).resize( function() {
			myinfo.ui.resize( $(window).width(), $(window).outerHeight(true));
		});

		this.mainDomID = domID;
		this.tabs = {};
		this.selectedTab = 0;

		$("body").on("keydown", function(e) {
			myinfo.ui.eventListenerKeydown(e);
		});
	};

	eventListenerKeydown(e) {
		console.log(e.key);
		// ToDo: Meg kell oldani, h majd csak az aktuálisnak küldjük el az eventet és ne az összesnek!
		for (var datasetKey in this.tabs) {
			this.tabs[datasetKey].layoutPluginInstance.eventListenerKeydown(e);
		};
	};

	resize(newWidth, newHeight) {
		log.INFO(`Resize (${newWidth},${newHeight})`);
		var heightOfOthers = $("#debug-area").outerHeight(true) + $("#menu-bar").outerHeight(true);
		log.INFO(`Resize heightOfOthers(${heightOfOthers})`);
		for (var datasetKey in this.tabs) {
			this.tabs[datasetKey].layoutPluginInstance.resizeLayout(newWidth, newHeight - heightOfOthers);
		};
	};

	refreshHome(datasets) {
		this.home.refresh(datasets);
	};

	addMenuAndWs(datasetKey, menuTitle, lp_instance) {
		this.tabs[datasetKey] = {layoutPluginInstance: lp_instance};

		var str = uiAddMenuHtml({
			datasetKey: datasetKey,
			menuTitle: menuTitle
		});
		$("#menu").append(str);

		var index = $("#menu li").length - 1;
		this.selectedTab = index;

		str = uiAddWsHtml({
			datasetKey: datasetKey
		});
		$("#ws-content").append(str);
		/*$(`#ws-${datasetKey}-tab`).on("shown.bs.tab", function (event) {
			//$(event.target);
			//$(event.relatedTarget);
			alert("shown.bs.tab");
			lp_instance.refreshLayout();
		});*/

		// Activate the newly added tab
		this.activateMenuAndWs(index);

		return index;
	};

	activateMenuAndWs(index) {
		$(`#menu li:eq(${index}) a`).tab('show');
		this.selectedTab = index;
	};

	deleteMenuAndWs(datasetKey) {
		//$(`#menu-${datasetID}`).remove();
		//$(`#ws-${datasetID}`).remove();
	};
};


export {UI};

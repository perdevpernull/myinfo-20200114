import {log, ERROR, WARNING, INFO, DEBUG} from "../../common/util/log";
import {autosize} from "../../common/util/autosize";


class UIHome {
	constructor(domID) {
		var str = `
			<div id="ws-home-list" class="d-flex flex-wrap justify-content-around">
			</div>`;
		$(domID).append(str);

		// Modal window: Edit
		str = `
			<div id="dataset-editor" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="dataset-editorLabel" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h5 id="dataset-editorLabel" class="modal-title">Edit dataset's metadata (ID_here)</h5>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<form>
								<div class="form-group">
									<input id="dataset-key" type="text" class="form-control" hidden>
									<label for="dataset-title" class="form-control-label">Title:</label>
									<input id="dataset-title" type="text" class="form-control">
								</div>
								<div class="form-group">
									<label for="dataset-description" class="form-control-label">Description:</label>
									<textarea id="dataset-description" class="form-control"></textarea>
								</div>
							</form>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
							<button id="modal-save" type="button" class="btn btn-primary" data-dismiss="modal">Save</button>
						</div>
					</div>
				</div>
			</div>`;
		$(domID).append(str);

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
		str = `
			<div id="dataset-delete-confirm" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="dataset-delete-confirmLabel" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h5 id="dataset-delete-confirmLabel" class="modal-title">Delete dataset (ID_here)</h5>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<p id="dataset-delete-confirmLabel2">Are you sure you want to delete dataset: Title_here ?</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
							<button id="modal-delete" type="button" class="btn btn-secondary" data-dismiss="modal">OK</button>
						</div>
					</div>
				</div>
			</div>`;
		$(domID).append(str);

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
			log(INFO, "Deleted");
			myinfo.refreshHome();
		});
	};

	refresh(datasets) {
		var str1, str2, str3, primary, open;
		$("#ws-home-list").empty();
		for (var datasetKey in datasets) {
			open = (datasets[datasetKey].open ? "invisible": "");
			str1 = `
				<div id="dataset-${datasetKey}" class="card m-2" style="width: 18rem;">
					<a href="#" onClick="myinfo.openDataset('${datasetKey}')">
						<img class="card-img-top" src="${datasets[datasetKey].imgSrc}" alt="Card image cap">
					</a>
					<div class="card-body">
						<div class="d-flex justify-content-between">
							<h4 class="card-title">${datasets[datasetKey].title}</h4>
							<button type="button" class="btn btn-light ${open}" data-toggle="modal" data-target="#dataset-editor" data-key="${datasetKey}" data-title="${datasets[datasetKey].title}" data-description="${datasets[datasetKey].description}" ${open}>Edit</button>
						</div>
						<p class="card-text">${datasets[datasetKey].description}</p>
					</div>
					<ul class="list-group list-group-flush">`;
			str2 = "";
			for (var viewKey in datasets[datasetKey].views) {
				primary = ((datasets[datasetKey].selectedViewIndex === datasets[datasetKey].views[viewKey].ID) ? "btn-primary" : "btn-light");
				str2 = str2 + `
						<li class="list-group-item d-flex justify-content-between">
							${datasets[datasetKey].views[viewKey].title}
							<button type="button" class="btn ${primary} ${open}" onClick="myinfo.openDataset('${datasetKey}','${viewKey}')">Open</button>
						</li>`;
			};
			str3 = `
					</ul>
					<div class="card-footer bg-white">
						<div class="d-flex justify-content-center">
							<button type="button" class="btn btn-danger ${open}" data-toggle="modal" data-target="#dataset-delete-confirm" data-key="${datasetKey}" data-title="${datasets[datasetKey].title}" ${open}>Delete</button>
						</div>
					</div>
				</div>`;
			$("#ws-home-list").append(str1 + str2 + str3);
		};
		str1 = `
				<div id="dataset-new" class="card m-2" style="width: 18rem;">
					<img class="card-img-top" src="data:image/svg+xml;charset=UTF-8,%3Csvg%20id=%22svg%22%20width=%22318%22%20height=%22180%22%20style=%22stroke:%20black;%20stroke-width:%201;%20border:%201px%20solid%20black;%22%20xmlns=%22http://www.w3.org/2000/svg%22%20preserveAspectRatio=%22none%22%20viewBox=%220%200%20508%20288%22%3E%3Cg%20id=%22svgBase%22%3E%3Cg%20id=%22svgLinks%22%3E%3Cpath%20d=%22M%20261,141%20C%20261,201%20115.5,96.5%20115.5,156.5%22%20style=%22fill:%20none;%20opacity:%201;%22%3E%3C/path%3E%3Cpath%20d=%22M%20261,141%20C%20261,201%20366.5,96.5%20366.5,156.5%22%20style=%22fill:%20none;%20opacity:%201;%20stroke-width:%201;%20stroke:%20rgb(0,%200,%200);%22%3E%3C/path%3E%3C/g%3E%3Cg%20id=%22svgNodes%22%3E%3Cg%20class=%22node%22%20id=%22node_2%22%20transform=%22translate(125.5,%20170)%22%20style=%22opacity:%201;%22%3E%3Crect%20class=%22rectangle%22%20x=%22-22.4375%22%20y=%22-13.5%22%20width=%2244.546875%22%20height=%2227%22%20rx=%227%22%20ry=%227%22%20style=%22fill:%20rgb(255,%20119,%20119);%20fill-opacity:%200.9;%20stroke:%20rgb(102,%20102,%20102);%20stroke-width:%201;%22%3E%3C/rect%3E%3Ctext%20class=%22text%22%20style=%22fill:%20black;%20stroke-width:%200;%20text-anchor:%20middle;%20alignment-baseline:%20central;%22%3EP%C3%A9ter%3C/text%3E%3Ccircle%20class=%22child%22%20r=%225%22%20cx=%2210%22%20cy=%2213.5%22%20style=%22fill:%20rgb(255,%200,%200);%20stroke-width:%202;%20display:%20inline;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3Ccircle%20class=%22parent%22%20r=%225%22%20cx=%22-10%22%20cy=%22-13.5%22%20style=%22fill:%20rgb(0,%20255,%200);%20stroke-width:%202;%20display:%20inline;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3Ccircle%20class=%22friend%22%20r=%225%22%20cx=%22-22.2734375%22%20cy=%220%22%20style=%22fill:%20rgb(0,%200,%20255);%20stroke-width:%202;%20display:%20inline;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3C/g%3E%3Cg%20class=%22node%22%20id=%22node_0%22%20transform=%22translate(251,%20127.5)%22%20style=%22opacity:%201;%22%3E%3Crect%20class=%22rectangle%22%20x=%22-40.640625%22%20y=%22-13.5%22%20width=%2281.203125%22%20height=%2227%22%20rx=%227%22%20ry=%227%22%20style=%22fill:%20rgb(255,%20119,%20119);%20fill-opacity:%200.9;%20stroke:%20rgb(102,%20102,%20102);%20stroke-width:%201;%22%3E%3C/rect%3E%3Ctext%20class=%22text%22%20style=%22fill:%20black;%20stroke-width:%200;%20text-anchor:%20middle;%20alignment-baseline:%20central;%22%3EPocakpapa%3C/text%3E%3Ccircle%20class=%22child%22%20r=%225%22%20cx=%2210%22%20cy=%2213.5%22%20style=%22fill:%20rgb(255,%200,%200);%20stroke-width:%202;%20display:%20inline;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3Ccircle%20class=%22parent%22%20r=%225%22%20cx=%22-10%22%20cy=%22-13.5%22%20style=%22fill:%20rgb(0,%20255,%200);%20stroke-width:%202;%20display:%20none;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3Ccircle%20class=%22friend%22%20r=%225%22%20cx=%22-40.6015625%22%20cy=%220%22%20style=%22fill:%20rgb(0,%200,%20255);%20stroke-width:%202;%20display:%20none;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3C/g%3E%3Cg%20class=%22node%22%20id=%22node_3%22%20transform=%22translate(376.5,%20170)%22%20style=%22opacity:%201;%22%3E%3Crect%20class=%22rectangle%22%20x=%22-25.765625%22%20y=%22-13.5%22%20width=%2251.53125%22%20height=%2227%22%20rx=%227%22%20ry=%227%22%20style=%22fill:%20rgb(255,%20119,%20119);%20fill-opacity:%200.9;%20stroke:%20rgb(102,%20102,%20102);%20stroke-width:%201;%22%3E%3C/rect%3E%3Ctext%20class=%22text%22%20style=%22fill:%20black;%20stroke-width:%200;%20text-anchor:%20middle;%20alignment-baseline:%20central;%22%3ETam%C3%A1s%3C/text%3E%3Ccircle%20class=%22child%22%20r=%225%22%20cx=%2210%22%20cy=%2213.5%22%20style=%22fill:%20rgb(255,%200,%200);%20stroke-width:%202;%20display:%20none;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3Ccircle%20class=%22parent%22%20r=%225%22%20cx=%22-10%22%20cy=%22-13.5%22%20style=%22fill:%20rgb(0,%20255,%200);%20stroke-width:%202;%20display:%20inline;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3Ccircle%20class=%22friend%22%20r=%225%22%20cx=%22-25.765625%22%20cy=%220%22%20style=%22fill:%20rgb(0,%200,%20255);%20stroke-width:%202;%20display:%20inline;%20-webkit-tap-highlight-color:%20rgba(0,%200,%200,%200);%22%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E" alt="Card image cap">
					<div class="card-body">
						<h4 class="card-title">NEW Dataset</h4>
						<p class="card-text">Open or create a new dataset.</p>
					</div>
					<div class="card-footer bg-white">
						<div class="d-flex justify-content-between">
							<button type="button" class="btn btn-light" onClick="myinfo.openDataset('OpenNew')">Open new</button>
							<button type="button" class="btn btn-light" onClick="myinfo.openDataset('CreateNew')">Create new</button>
						</div>
					</div>
				</div>`;
		$("#ws-home-list").append(str1);
	};
};

class UI {
	constructor(domID) {
		var str = `
			<div id="menu-bar" class="row p-2">
				<button id="sidebar-toggler" type="button" class="btn btn-light">
					<span class="navbar-toggler-icon">
						<svg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'><path stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'></path></svg>
					</span>
				</button>
				<ul id="menu" class="nav nav-pills" role="tablist">
					<li id="menu-home" class="nav-item">
						<a id="ws-home-tab" class="nav-link active" data-toggle="pill" href="#ws-home" role="tab">Home</a>
					</li>
				</ul>
			</div>
			<div id="ws-content" class="tab-content">
				<div id="ws-home" class="tab-pane fade show active" role="tabpanel" aria-labelledby="ws-home-tab">
				</div>
			</div>`;
		$(domID).append(str);

		this.home = new UIHome("#ws-home");

		// ToDo: ezt itt kupucolni.
		$("#ws-home-tab").on("show.bs.pill", function (e) {
			log(INFO, "Helló-belló!");
			myinfo.refreshHome();
		});
		$("#sidebar-toggler").click( function() {
			log(INFO, "Helló-belló2!");
			myinfo.refreshHome();
		});
	};

	refreshHome(datasets) {
		this.home.refresh(datasets);
	};

	addMenuAndWs(datasetKey, menuTitle) {
		var str = `
			<li id="menu-${datasetKey}" class="nav-item">
				<a id="ws-${datasetKey}-tab" class="nav-link" data-toggle="pill" href="#ws-${datasetKey}" role="tab">${menuTitle}</a>
			</li-->`;
		$("#menu").append(str);

		var index = $("#menu li").length - 1;

		str = `
			<div id="ws-${datasetKey}" class="h-100 tab-pane fade" role="tabpanel" aria-labelledby="ws-${datasetKey}-tab">
			</div>`;
		$("#ws-content").append(str);
		/*$(`#ws-${datasetKey}-tab`).on("shown.bs.tab", function (event) {
			//$(event.target);
			//$(event.relatedTarget);
			alert("shown.bs.tab");
			lp_instance.refreshLayout();
		});*/

		return index;
	};

	deleteMenuAndWs(datasetKey) {
		//$(`#menu-${datasetID}`).remove();
		//$(`#ws-${datasetID}`).remove();
	};
};


export {UI};

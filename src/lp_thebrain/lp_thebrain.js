import {log} from "../common/util/log";
import {LayoutPlugin} from "../common/layoutplugin";
import {calcPathWithDirs} from "./util/calcpathwithdirs";
import {uiLp_thebrainHtml} from "./uiLp_thebrainTemplating";

var nodeHeight = 42;
var margo = 5;


class LP_Thebrain extends LayoutPlugin {
	constructor(datasetKey, viewKey, datasetInstance, view) {
		super(datasetKey, viewKey, datasetInstance, view);
		log.DEBUG("LP_Thebrain.constructor()");
		this._tmp = {
			visibles: {
				nodeIDs: [],
				links: [],
				actualID: null,
				childIDs: [],
				parentIDs: [],
				friendIDs: [],
				siblingIDs: []
			},
			nodes: {},
			historyIDs: [],
			viewMode: "normal",
			focus: "svg-node",
			selectedLink: {sourceNodeID: null, targetNodeID: null, type: null},
			newNode: {linkType: "", sourceClass: null, sourceNodeID: null, targetClass: null, targetNodeID: null},
		};
		log.loginc();
		log.DEBUG("Checking for dp_note ...");
		if (this._datasetInstance["dp_note"]) {
			log.DEBUG(`dp_note(${this._datasetInstance.dp_note()})`);
		} else {
			// ToDo: Itt majd kell egy exception, h nem futhatunk tovább!
			log.ERROR(`dp_note() not installed`);
		};
		log.logdec();
		log.DEBUG("LP_Thebrain.constructor()");
	};

	constructLayout(width, height) {
		log.DEBUG(`LP_Thebrain.constructLayout(${width},${height})`);
		var _this = this;
		var str;

		this._setZones(width - 30, height - 6 - 106);

		var placeholderZoomPercent = 33/100;
		str = uiLp_thebrainHtml({
			datasetKey: this.datasetKey,
			viewKey: this.viewKey,
			width: this._w,
			height: this._h,
			placeholder_x: this._placeholder.x,
			placeholder_y: this._placeholder.y,
			placeholderZoomPercent: placeholderZoomPercent
		});
		$(`#ws-${this.datasetKey}-${this.viewKey}`).append(str);

		this.svg = d3.select(`#svg-${this.datasetKey}-${this.viewKey}`);	
		this.svgBase = d3.select(`#svgBase-${this.datasetKey}-${this.viewKey}`);
		this.svgPlaceholder = d3.select(`#svgPlaceholder-${this.datasetKey}-${this.viewKey}`);

		this.svgLinks = d3.select(`#svgLinks-${this.datasetKey}-${this.viewKey}`);
		this.svgNodes = d3.select(`#svgNodes-${this.datasetKey}-${this.viewKey}`);
		this.svgPins = d3.select(`#svgPins-${this.datasetKey}-${this.viewKey}`);
		this.svgHistory = d3.select(`#svgHistory-${this.datasetKey}-${this.viewKey}`);

		// Node-editor section
		$(`#node-editor-${this.datasetKey}-${this.viewKey}`).on("show.bs.modal", function () {
			_this._tmp.focus = "editor";
			var nodeID = _this._view.viewData.selectedNodeID;
			$(`#node-editor-${_this.datasetKey}-${_this.viewKey}-title`).text(`Edit node's text (ID${nodeID})`);
			$(`#node-editor-${_this.datasetKey}-${_this.viewKey}-nodeID`).val(nodeID);
			$(`#node-editor-${_this.datasetKey}-${_this.viewKey}-nodeText`).val(_this._datasetInstance.getNode(nodeID).text);
		});

		$(`#node-editor-${this.datasetKey}-${this.viewKey}`).on("shown.bs.modal", function () {
			$(`#node-editor-${_this.datasetKey}-${_this.viewKey}-nodeText`).trigger('focus');
		});

		$(`#node-editor-${this.datasetKey}-${this.viewKey}-save`).click( function () {
			var nodeID = Number($(`#node-editor-${_this.datasetKey}-${_this.viewKey}-nodeID`).val());
			var text = $(`#node-editor-${_this.datasetKey}-${_this.viewKey}-nodeText`).val();
			_this._datasetInstance._data.nodes[`ID${nodeID}`].text = text;

			_this._modifyNode(d3.select(`#node_${nodeID}`), _this);
			_this._drawVisibles(nodeID);
			log.DEBUG(`ID${nodeID}.text="${text}"`);
		});

		$(`#node-editor-${this.datasetKey}-${this.viewKey}`).on("hidden.bs.modal", function () {
			_this._tmp.focus = "svg-node";
		});

		// Node-search section
		$.fn.select2.amd.require([
			'select2/data/array',
			'select2/utils'
		], function (ArrayData, Utils) {
			function CustomData ($element, options) {
				CustomData.__super__.constructor.call(this, $element, options);
			}
		
			Utils.Extend(CustomData, ArrayData);
		
			CustomData.prototype.query = function (params, callback) {
				var pageSize = 6;
				var data = {results: [], all: []};
				if (!("page" in params)) {
					params.page = 1;

					if (params.term && params.term.length > 0) {
						params.all = _this._datasetInstance.searchNodesByText(params.term);

						if (params.all.length > params.page * pageSize) {
							data.results = params.all.slice((params.page - 1) * pageSize, params.page * pageSize);
							data["pagination"] = {more: true};
						} else {
							data.results = params.all;
							data["pagination"] = {more: false};
						}

						if (_this._tmp.viewMode === "insert") {
							if ((data.results.length !== 1) || (params.term !== data.results[0].text)) {
								data.results.unshift({
									id: -1,
									text: params.term
								});
							};
						};
					};
				} else if (params.page > 1) {
					if (params.all.length > params.page * pageSize) {
						data.results = params.all.slice((params.page - 1) * pageSize, params.page * pageSize);
						data["pagination"] = {more: true};
					} else {
						data.results = params.all.slice((params.page - 1) * pageSize, params.page * pageSize);
						data["pagination"] = {more: false};
					}
				};

				callback(data);
			};
			
			CustomData.prototype.current = function (callback) {
				var data = [];
				var nodeID = _this._view.viewData.selectedNodeID;

				data.push({
					id: `${nodeID}`,
					text: _this._datasetInstance.getNode(nodeID).text,
					selected: true
				});

				callback(data);
			};
		
			$(`#node-search-${_this.datasetKey}-${_this.viewKey}-nodeText`).select2({
				dropdownParent: $(`#node-search-${_this.datasetKey}-${_this.viewKey}`),
				placeholder: "Search ...",
				dataAdapter: CustomData,
				ajax: {}
			});
		});

		$(`#node-search-${this.datasetKey}-${this.viewKey}`).on("show.bs.modal", function () {
			_this._tmp.focus = "search";
			if (_this._tmp.viewMode === "insert") {
				$(`#node-search-${_this.datasetKey}-${_this.viewKey}-title`).text(`Search or Insert`);
			} else {
				$(`#node-search-${_this.datasetKey}-${_this.viewKey}-title`).text(`Search`);
			};
		});

		$(`#node-search-${this.datasetKey}-${this.viewKey}`).on("shown.bs.modal", function () {
			setTimeout(function(){ $(`#node-search-${_this.datasetKey}-${_this.viewKey}-nodeText`).select2('open'); }, 250);
		});

		$(`#node-search-${this.datasetKey}-${this.viewKey}-nodeText`).on('select2:selecting', function (e) {
			if (_this._tmp.viewMode === "insert") {
				_this.svgBase.select("#dragcircle").remove();
				_this.svgBase.select("#dragpath").remove();
				_this._tmp.viewMode = "normal";
				if (e.params.args.data.id > -1) {
					if (_this._tmp.newNode.linkType === "friend") {
						_this._datasetInstance.addFriendLink(_this._tmp.newNode.sourceNodeID, e.params.args.data.id);
					} else if (_this._tmp.newNode.linkType === "parent") {
						_this._datasetInstance.addParentLink(_this._tmp.newNode.sourceNodeID, e.params.args.data.id);
					} else if (_this._tmp.newNode.linkType === "child") {
						_this._datasetInstance.addChildLink(_this._tmp.newNode.sourceNodeID, e.params.args.data.id);
					};
					_this._drawVisibles(_this._tmp.newNode.sourceNodeID);
				} else {
					var newNodeID;
					if (_this._tmp.newNode.linkType === "friend") {
						newNodeID = _this._datasetInstance.addFriendNode( _this._tmp.newNode.sourceNodeID, e.params.args.data.text);
					} else if (_this._tmp.newNode.linkType === "parent") {
						newNodeID = _this._datasetInstance.addParentNode( _this._tmp.newNode.sourceNodeID, e.params.args.data.text);
					} else if (_this._tmp.newNode.linkType === "child") {
						newNodeID = _this._datasetInstance.addChildNode( _this._tmp.newNode.sourceNodeID, e.params.args.data.text);
					};
					_this._drawVisibles(_this._tmp.newNode.sourceNodeID);
				};
			} else {
				var nodeID = e.params.args.data.id;
				_this._drawVisibles(nodeID);
			}
			$(`#node-search-${_this.datasetKey}-${_this.viewKey}`).modal("hide");
		});

		$(`#node-search-${this.datasetKey}-${this.viewKey}-nodeText`).on('select2:close', function (e) {
			_this.svgBase.select("#dragcircle").remove();
			_this.svgBase.select("#dragpath").remove();
			_this._tmp.viewMode = "normal";
			if (_this._tmp.newNode.sourceNodeID !== null) {
				_this._setCirclesDisplay(_this._tmp.newNode.sourceNodeID, "showHasLinks");
			};
		});

		$(`#node-search-${this.datasetKey}-${this.viewKey}`).on("hidden.bs.modal", function () {
			_this._tmp.focus = "svg-node";
		});


	};

	destructLayout() {
		log.DEBUG("LayoutPlugin.destructLayout()");
		$(`#lp_thebrain-${this.datasetKey}-${this.viewKey}`).remove();
	};

	resizeLayout(width, height) {
		log.DEBUG(`LP_Thebrain.resizeLayout(${width},${height})`);
		var datasetKeyAndViewKey = `${this.datasetKey}-${this.viewKey}`;
		
		d3.select(`#svg-${datasetKeyAndViewKey}`)
			.style("width", width - 30)
			.style("height", height - $(`#notearea-${datasetKeyAndViewKey}`).outerHeight(true) - 6);

		this._setZones($(`#svg-${datasetKeyAndViewKey}`).width(),$(`#svg-${datasetKeyAndViewKey}`).height());
		this._drawVisibles(this._view.viewData.selectedNodeID);
	};

	refreshLayout() {
		log.DEBUG("LP_Thebrain.refreshLayout()");
		this._drawVisibles(this._view.viewData.selectedNodeID);
	};

	_setZones(width, height) {
		log.DEBUG(`_setZones(${width},${height})`);
		this._x = 0;
		this._y = 0;
		this._w = width;
		this._h = height;

		this._actualzone = {x: this._x+this._w/3, y: this._y+this._h/3, w: this._w/3, h: this._h/3};
		this._childzone = {x: this._x, y: this._y+2*this._h/3, w: this._w, h: this._h/3};
		this._parentzone = {x: this._x+this._w/3, y: this._y, w: this._w/3, h: this._h/3};
		this._friendzone = {x: this._x, y: this._y, w: this._w/3, h: 2*this._h/3};
		this._siblingzone = {x: this._x+2*this._w/3, y: this._y, w: this._w/3, h: 2*this._h/3};

		this._placeholder = {x: this._actualzone.x + this._actualzone.w/2, y: this._actualzone.y + this._actualzone.h/2};

		this._actualEntrypoint = {x: this._placeholder.x, y: this._placeholder.y};
		this._childEntrypoint = {x: this._x + this._w/2, y: this._y + this._h};
		this._parentEntrypoint = {x: this._x + this._w/2, y: this._y};
		this._friendEntrypoint = {x: this._x, y: this._y};
		this._siblingEntrypoint = {x: this._x + this._w, y: this._y};

		log.DEBUG(`_setZones.placeholder(${this._placeholder.x},${this._placeholder.y})`);
	};

	_drawVisibles(nodeID) {
		log.DEBUG(`_drawVisibles(${nodeID})`);

		var visibleNodeID;
		var _this = this;

		this._view.viewData.selectedNodeID = nodeID;

		// Ez vmiért kell, h a select2 frissüljön. Önmagában a .current metódusa nem elég.
		$(`#node-search-${_this.datasetKey}-${_this.viewKey}-nodeText`).val(null).trigger("change");

		// A korábbi látható elmek pozícióinak elmentése
			for (var i in this._tmp.visibles.nodeIDs) {
				visibleNodeID = this._tmp.visibles.nodeIDs[i];
				this._tmp.nodes[`ID${visibleNodeID}`].x0 = this._tmp.nodes[`ID${visibleNodeID}`].x;
				this._tmp.nodes[`ID${visibleNodeID}`].y0 = this._tmp.nodes[`ID${visibleNodeID}`].y;
			};

		// A kattintás után látható elmek kikeresése és pozíciójuk meghatározása
			this._findVisibles(nodeID);
			this._calcVisiblesPositions();
			log.DEBUG("Visible nodeIDs: " + JSON.stringify(this._tmp.visibles.nodeIDs));

		// Placeholder mozgaása
			if (this._tmp.nodes[`ID${nodeID}`].x0) {
				var x0 = this._tmp.nodes[`ID${nodeID}`].x0;
				var y0 = this._tmp.nodes[`ID${nodeID}`].y0;
				this.svgPlaceholder
					.attr("transform", `translate(${x0},${y0})`)
				;
			};

			this.svgPlaceholder
				.transition().duration(this._view.viewData.animationDuration)
					.attr("transform", `translate(${_this._placeholder.x},${_this._placeholder.y})`)
			;

		// Változások lekérdezése és átrajzolás (nodes)
			var tmpNodes = this.svgNodes.selectAll("g")
				.data(this._tmp.visibles.nodeIDs, function(d) {return d; })
			;
			// MODIFY nodes
				tmpNodes.transition().duration(this._view.viewData.animationDuration)
					.attr("transform", function(d) {
						//log.DEBUG(`MODIFY node d(${d})`);
						return "translate(" + _this._tmp.nodes[`ID${d}`].x + "," + _this._tmp.nodes[`ID${d}`].y + ")"; })
				;
				tmpNodes.select(".rectangle").transition().duration(this._view.viewData.animationDuration)
					.style("fill", function(d) {
						return _this._view.viewData.node[_this._tmp.nodes[`ID${d}`].zone+"Color"];
					})
					.style("fill-opacity", function(d) {
						return _this._view.viewData.node[_this._tmp.nodes[`ID${d}`].zone+"Opacity"];
					})
				;
				tmpNodes.select(".child")
					.style("display", function(d) {
						return _this._datasetInstance.hasChildLinks(d) ? "inline" : "none";
					})
				;
				tmpNodes.select(".parent")
					.style("display", function(d) {
						return _this._datasetInstance.hasParentLinks(d) ? "inline" : "none";
					})
				;
				tmpNodes.select(".friend")
					.style("display", function(d) {
						return _this._datasetInstance.hasFriendLinks(d) ? "inline" : "none";
					})
				;

			// APPEND nodes
				var tmpTmpNodes = tmpNodes.enter().append("g")
					.call(this._appendNode, this)
					.transition().duration(this._view.viewData.animationDuration)
						.style("opacity", 1)
						.attr("transform", function(d) {
							//log.DEBUG(`APPEND node d(${d})`);
							return "translate(" + _this._tmp.nodes[`ID${d}`].x + "," + _this._tmp.nodes[`ID${d}`].y + ")"; })
				;

			// REMOVE nodes
				tmpNodes.exit()
					.attr("class", function(d) {
						log.DEBUG(`REMOVE node d(${d})`);
						_this._tmp.nodes[`ID${d}`].x = null;
						_this._tmp.nodes[`ID${d}`].y = null;
						_this._tmp.nodes[`ID${d}`].x0 = null;
						_this._tmp.nodes[`ID${d}`].y0 = null;
						return "";
					})
					.remove()
				;

		//log.DEBUG(JSON.stringify(this._tmp.visibles.links));

		// Változások lekérdezése és átrajzolás (links)
			var tmpLinks = this.svgLinks.selectAll("path")
				.data(this._tmp.visibles.links, function(d) {return d.key; })
			;
			// MODIFY links
				tmpLinks.transition().duration(this._view.viewData.animationDuration)
					.attr("d", function(d) {
						//log.DEBUG(`MODIFY link d(${JSON.stringify(d)})`);

						if (d["type"] === "friend") {
							var sign = ((_this._tmp.nodes[`ID${d.source}`].x <= _this._tmp.nodes[`ID${d.target}`].x) ? 1 : -1);

							var node = d3.select("#node_"+d.source);
							node.select(".friend")
								.transition().duration(_this._view.viewData.animationDuration)
									.attr("cx", function(d) {return + sign * _this._tmp.nodes[`ID${d}`].width/2;})
							;

							node = d3.select("#node_"+d.target);
							node.select(".friend")
								.transition().duration(_this._view.viewData.animationDuration)
									.attr("cx", function(d) {return - sign * _this._tmp.nodes[`ID${d}`].width/2;})
							;
						};
						return calcPathWithDirs(
							_this._tmp.nodes[`ID${d.source}`].x, _this._tmp.nodes[`ID${d.source}`].y,
							_this._tmp.nodes[`ID${d.source}`].width, _this._tmp.nodes[`ID${d.source}`].height,
							_this._tmp.nodes[`ID${d.target}`].x, _this._tmp.nodes[`ID${d.target}`].y,
							_this._tmp.nodes[`ID${d.target}`].width, _this._tmp.nodes[`ID${d.target}`].height,
							d["type"], margo
						);
					})
				;

			// APPEND links
				tmpLinks.enter().append("path")
					.call(this._appendLink, this)
					.transition().duration(this._view.viewData.animationDuration)
						.style("opacity", 1)
						.attr("d", function(d) {
							//log.DEBUG(`APPEND link d(${JSON.stringify(d)})`);
							if (d["type"] === "friend") {
								var sign = ((_this._tmp.nodes[`ID${d.source}`].x <= _this._tmp.nodes[`ID${d.target}`].x) ? 1 : -1);
								var node = d3.select("#node_"+d.source);

								node.select(".friend")
									.transition().duration(_this._view.viewData.animationDuration)
										.attr("cx", function(d) {return + sign * _this._tmp.nodes[`ID${d}`].width/2;})
								;
								node = d3.select("#node_"+d.target);
								node.select(".friend")
									.transition().duration(_this._view.viewData.animationDuration)
										.attr("cx", function(d) {return - sign * _this._tmp.nodes[`ID${d}`].width/2;})
								;
							};
							return calcPathWithDirs(
								_this._tmp.nodes[`ID${d.source}`].x, _this._tmp.nodes[`ID${d.source}`].y,
								_this._tmp.nodes[`ID${d.source}`].width, _this._tmp.nodes[`ID${d.source}`].height,
								_this._tmp.nodes[`ID${d.target}`].x, _this._tmp.nodes[`ID${d.target}`].y,
								_this._tmp.nodes[`ID${d.target}`].width, _this._tmp.nodes[`ID${d.target}`].height,
								d["type"], margo
							);
						})
					;

			// REMOVE links
				tmpLinks.exit().remove();

		this._appendHistory(nodeID);
	};

	_findVisibles(nodeID) {
		var visibleNodeID;
		var childLinks, childNodeID, parentLinks, parentNodeID, friendLinks, friendNodeID;
		var allLinks, fromNodeID, toNodeID;
		var linkType;
		var link, linkKey;


		// Clear the old zone values of visible nodes
			for (var i in this._tmp.visibles.nodeIDs) {
				visibleNodeID = this._tmp.visibles.nodeIDs[i];
				this._tmp.nodes[`ID${visibleNodeID}`].zone = "";
			}

		// The ACTUAL itself
			this._tmp.visibles.nodeIDs = [];
			//this._tmp.visibles.actualID = null;
			// Itt még nem lehet ismétlődés
			if (!this._tmp.nodes[`ID${nodeID}`]) {
				this._tmp.nodes[`ID${nodeID}`] = {};
			}
			this._tmp.nodes[`ID${nodeID}`].zone = "actual";
			this._tmp.visibles.nodeIDs.push(nodeID);
			this._tmp.visibles.actualID = nodeID;

		// The CHILD nodes
			this._tmp.visibles.childIDs = [];
			childLinks = this._datasetInstance.getChildLinks(nodeID);
			for (var i in childLinks) {
				childNodeID = childLinks[i].toID;

				if (this._tmp.visibles.nodeIDs.indexOf(childNodeID) < 0) {
					if (!this._tmp.nodes[`ID${childNodeID}`]) {
						this._tmp.nodes[`ID${childNodeID}`] = {};
					}
					this._tmp.nodes[`ID${childNodeID}`].zone = "child";
					this._tmp.visibles.nodeIDs.push(childNodeID);
					this._tmp.visibles.childIDs.push(childNodeID);
				};
			};

		// The PARENT nodes
			this._tmp.visibles.parentIDs = [];
			parentLinks = this._datasetInstance.getParentLinks(nodeID);
			for (var i in parentLinks) {
				parentNodeID = parentLinks[i].toID;

				if (this._tmp.visibles.nodeIDs.indexOf(parentNodeID) < 0) {
					if (!this._tmp.nodes[`ID${parentNodeID}`]) {
						this._tmp.nodes[`ID${parentNodeID}`] = {};
					}
					this._tmp.nodes[`ID${parentNodeID}`].zone = "parent";
					this._tmp.visibles.nodeIDs.push(parentNodeID);
					this._tmp.visibles.parentIDs.push(parentNodeID);
				};
			};

		// The FRIEND nodes
			this._tmp.visibles.friendIDs = [];
			friendLinks = this._datasetInstance.getFriendLinks(nodeID);
			for (var i in friendLinks) {
				friendNodeID = friendLinks[i].toID;

				if (this._tmp.visibles.nodeIDs.indexOf(friendNodeID) < 0) {
					if (!this._tmp.nodes[`ID${friendNodeID}`]) {
						this._tmp.nodes[`ID${friendNodeID}`] = {};
					}
					this._tmp.nodes[`ID${friendNodeID}`].zone = "friend";
					this._tmp.visibles.nodeIDs.push(friendNodeID);
					this._tmp.visibles.friendIDs.push(friendNodeID);
				};
			};

		// The SIBLING nodes
			this._tmp.visibles.siblingIDs = [];
			// parentLinks = previous dataset.getParentLinks(nodeID);
			for (var i in parentLinks) {
				parentNodeID = parentLinks[i].toID;
				childLinks = this._datasetInstance.getChildLinks(parentNodeID);
				for (var j in childLinks) {
					childNodeID = childLinks[j].toID;

					if (this._tmp.visibles.nodeIDs.indexOf(childNodeID) < 0) {
						if (!this._tmp.nodes[`ID${childNodeID}`]) {
							this._tmp.nodes[`ID${childNodeID}`] = {};
						}
						this._tmp.nodes[`ID${childNodeID}`].zone = "sibling";
						this._tmp.visibles.nodeIDs.push(childNodeID);
						this._tmp.visibles.siblingIDs.push(childNodeID);
					};
				};
			};

		// Search for visible LINKs
			this._tmp.visibles.links = [];
			for (var i in this._tmp.visibles.nodeIDs) {
				fromNodeID = this._tmp.visibles.nodeIDs[i];
				allLinks = this._datasetInstance.getLinks(fromNodeID);

				for (var j in allLinks) {
					toNodeID = allLinks[j].toID;

					if (this._tmp.visibles.nodeIDs.indexOf(toNodeID) >= 0) {
						var linkType = allLinks[j].type;
						//log.DEBUG(`fromNodeID(${fromNodeID}), toNodeID(${toNodeID}), type(${linkType})`);
						if (fromNodeID <= toNodeID) {
							linkKey = "source:"+fromNodeID+"-target:"+toNodeID;
							link = { key: linkKey, source: fromNodeID, target: toNodeID, type: linkType};
						} else {
							linkKey = "source:"+toNodeID+"-target:"+fromNodeID;
							if (linkType === "parent") {
								linkType = "child";
							} else if (linkType === "child") {
								linkType = "parent";
							};
							link = { key: linkKey, source: toNodeID, target: fromNodeID, type: linkType};
						};
						// ToDo: Megvizsgálandó, h szükség van e erre az ellenőrzésre.
						if (this._tmp.visibles.links.findIndex( function(element) {
								return ((element.key === linkKey) && (element.type === linkType));
							}) === -1)
						{
							this._tmp.visibles.links.push(link);
						}
					};
				};
			};
	};

	_calcVisiblesPositions() {
		var nodeID;
		var neededHeight;
		var numInOneCol;
		var numOfCols;


		// ACTUAL
			nodeID = this._tmp.visibles.actualID;
			if (!this._tmp.nodes[`ID${nodeID}`]) {
				this._tmp.nodes[`ID${nodeID}`] = {};
			};
			this._tmp.nodes[`ID${nodeID}`].x = this._placeholder.x;
			this._tmp.nodes[`ID${nodeID}`].y = this._placeholder.y;

		// PARENT
			numInOneCol = Math.floor(this._parentzone.h / nodeHeight) - 1; // -1 a history sáv miatt.
			if (this._tmp.visibles.parentIDs.length <= 1) {
				numOfCols = 1;
			} else {
				numOfCols = Math.max(Math.ceil(this._tmp.visibles.parentIDs.length / numInOneCol),2);
			};
			neededHeight = Math.ceil(this._tmp.visibles.parentIDs.length / numOfCols) * nodeHeight;
			//log.DEBUG(`numInOneCol(${numInOneCol}), numOfCols(${numOfCols})`);
			for (var i in this._tmp.visibles.parentIDs) {
				nodeID = this._tmp.visibles.parentIDs[i];
				if (!this._tmp.nodes[`ID${nodeID}`]) {
					this._tmp.nodes[`ID${nodeID}`] = {};
				};

				this._tmp.nodes[`ID${nodeID}`].x = this._parentzone.x + this._parentzone.w/(2*numOfCols) + (i % numOfCols) * this._parentzone.w/numOfCols;
				this._tmp.nodes[`ID${nodeID}`].y = this._parentzone.y + (this._parentzone.h - neededHeight)/2 + nodeHeight/2 + Math.floor(i/numOfCols) * nodeHeight;
			};

		// CHILD
			numInOneCol = Math.floor(this._childzone.h / nodeHeight) - 1; // -1 a history sáv miatt.
			if (this._tmp.visibles.childIDs.length <= 1) {
				numOfCols = 1;
			} else {
				numOfCols = Math.max(Math.ceil(this._tmp.visibles.childIDs.length / numInOneCol),2);
			};
			for (var i in this._tmp.visibles.childIDs) {
				nodeID = this._tmp.visibles.childIDs[i];
				if (!this._tmp.nodes[`ID${nodeID}`]) {
					this._tmp.nodes[`ID${nodeID}`] = {};
				};

				this._tmp.nodes[`ID${nodeID}`].x = this._childzone.x + this._childzone.w/(2*numOfCols) + (i % numOfCols) * this._childzone.w/numOfCols;

				this._tmp.nodes[`ID${nodeID}`].y = this._childzone.y + Math.floor(i/numOfCols) * nodeHeight;
			};

		// FRIEND
			numInOneCol = Math.floor(this._friendzone.h / nodeHeight) - 1; // -1 a pin sáv miatt
			numOfCols = Math.ceil(this._tmp.visibles.friendIDs.length / numInOneCol);
			neededHeight = Math.ceil(this._tmp.visibles.friendIDs.length / numOfCols) * nodeHeight;
			for (var i in this._tmp.visibles.friendIDs) {
				nodeID = this._tmp.visibles.friendIDs[i];
				if (!this._tmp.nodes[`ID${nodeID}`]) {
					this._tmp.nodes[`ID${nodeID}`] = {};
				};

				this._tmp.nodes[`ID${nodeID}`].x = this._friendzone.x + this._friendzone.w/(2*numOfCols) + (i % numOfCols) * this._friendzone.w / numOfCols;
				this._tmp.nodes[`ID${nodeID}`].y = this._friendzone.y + (this._friendzone.h - neededHeight)/2 + nodeHeight/2 + Math.floor(i/numOfCols) * nodeHeight;
			};

		// SIBLING
			numInOneCol = Math.floor(this._siblingzone.h / nodeHeight) - 1; // -1 a pin sáv miatt
			numOfCols = Math.ceil(this._tmp.visibles.siblingIDs.length / numInOneCol);
			neededHeight = Math.ceil(this._tmp.visibles.siblingIDs.length / numOfCols) * nodeHeight;
			for (var i in this._tmp.visibles.siblingIDs) {
				nodeID = this._tmp.visibles.siblingIDs[i];
				if (!this._tmp.nodes[`ID${nodeID}`]) {
					this._tmp.nodes[`ID${nodeID}`] = {};
				};

				this._tmp.nodes[`ID${nodeID}`].x = this._siblingzone.x + this._siblingzone.w/(2*numOfCols) + (i % numOfCols) * this._siblingzone.w / numOfCols;
				this._tmp.nodes[`ID${nodeID}`].y = this._siblingzone.y + (this._siblingzone.h - neededHeight)/2 + nodeHeight/2 + Math.floor(i/numOfCols) * nodeHeight;
			};
	};

	_appendNode(selection, _this) {
		//log.ERROR("_appendNode" + JSON.stringify(selection));
		selection
			.attr("class", "node")
			.attr("id", function(d) { return "node_"+d; })
			.attr("transform", function(d) {
				switch (_this._tmp.nodes[`ID${d}`].zone) {
					case "actual":
						_this._tmp.nodes[`ID${d}`].x0 = _this._actualEntrypoint.x;
						_this._tmp.nodes[`ID${d}`].y0 = _this._actualEntrypoint.y;
						break;
					case "child":
						_this._tmp.nodes[`ID${d}`].x0 = _this._childEntrypoint.x;
						_this._tmp.nodes[`ID${d}`].y0 = _this._childEntrypoint.y;
						break;
					case "parent":
						_this._tmp.nodes[`ID${d}`].x0 = _this._parentEntrypoint.x;
						_this._tmp.nodes[`ID${d}`].y0 = _this._parentEntrypoint.y;
						break;
					case "friend":
						_this._tmp.nodes[`ID${d}`].x0 = _this._friendEntrypoint.x;
						_this._tmp.nodes[`ID${d}`].y0 = _this._friendEntrypoint.y;
						break;
					case "sibling":
						_this._tmp.nodes[`ID${d}`].x0 = _this._siblingEntrypoint.x;
						_this._tmp.nodes[`ID${d}`].y0 = _this._siblingEntrypoint.y;
						break;
					default:
						_this._tmp.nodes[`ID${d}`].x0 = _this._x;
						_this._tmp.nodes[`ID${d}`].y0 = _this._y - nodeHeight/2;
				}
				return `translate(${_this._tmp.nodes[`ID${d}`].x0},${_this._tmp.nodes[`ID${d}`].y0})`; })
			.style("opacity", 0)
			.on("mouseenter", function(d) {
				_this._eventMouseenterNode(d, this);
			})
			.on("mouseleave", function(d) {
				_this._eventMouseleaveNode(d, this);
			})
			.on("click", function(d) {
				log.DEBUG(`eventClickNode(${d})`);
				_this._drawVisibles(d);
			})
			.on("dblclick", function(d) {
				log.DEBUG(`eventDblclickNode(${d})`);
				$(`#node-editor-${_this.datasetKey}-${_this.viewKey}`).modal('show');
			})
		;
			var tmpRect = selection.append("rect");
			var tmpText = selection.append("text")
				.attr("class", "text")
				.attr("id", function(d) { return "text_"+d; })
				.attr("style", "fill: black; stroke-width: 0")
				.text(function(d) { return _this._datasetInstance.getNode(d).text; })
				.style("text-anchor", "middle")
				.style("alignment-baseline", "central")
			;

			tmpRect
				.attr("class", "rectangle")
				.attr("id", function(d) { return "rect_"+d; })
				.attr("x", function(d) {
					return this.parentNode.getBBox().x - margo;
				})
				.attr("y", function(d) {
					return this.parentNode.getBBox().y - margo;
				})
				.attr("width", function(d) {
					return _this._tmp.nodes[`ID${d}`].width = margo + this.parentNode.getBBox().width + margo;
				})
				.attr("height", function(d) {
					return _this._tmp.nodes[`ID${d}`].height = margo + this.parentNode.getBBox().height + margo;
				})
				.attr("rx", 7)
				.attr("ry", 7)
				.style("fill", function(d) {
					return _this._view.viewData.node[_this._tmp.nodes[`ID${d}`].zone+"Color"];
				})
				.style("fill-opacity", function(d) {
					return _this._view.viewData.node[_this._tmp.nodes[`ID${d}`].zone+"Opacity"];
				})
				.style("stroke", "#666")
				.style("stroke-width", "1")
			;
			selection.append("circle")
				.attr("class", "child")
				.attr("r", margo)
				.attr("cx", 2*margo)
				.attr("cy", function(d) {return _this._tmp.nodes[`ID${d}`].height/2;})
				.style("fill", "#f00")
				.style("stroke-width", 2)
				.style("display", function(d) {
					return _this._datasetInstance.hasChildLinks(d) ? "inline" : "none";
				})
				.call(d3.drag()
					.on("start", function(d) {
						_this._eventDragStartCircle(d, this);
					})
					.on("drag", function(d) {
						_this._eventDragDragCircle(d, this);
					})
					.on("end", function(d) {
						_this._eventDragEndCircle(d, this);
					})
				)
			;
			selection.append("circle")
				.attr("class", "parent")
				.attr("r", margo)
				.attr("cx", -2*margo)
				.attr("cy", function(d) {return -_this._tmp.nodes[`ID${d}`].height/2;})
				.style("fill", "#0f0")
				.style("stroke-width", 2)
				.style("display", function(d) {
					return _this._datasetInstance.hasParentLinks(d) ? "inline" : "none";
				})
				.call(d3.drag()
					.on("start", function(d) {
						_this._eventDragStartCircle(d, this);
					})
					.on("drag", function(d) {
						_this._eventDragDragCircle(d, this);
					})
					.on("end", function(d) {
						_this._eventDragEndCircle(d, this);
					})
				)
			;
			selection.append("circle")
				.attr("class", "friend")
				.attr("r", margo)
				.attr("cx", function(d) {return -_this._tmp.nodes[`ID${d}`].width/2;})
				.attr("cy", 0)
				.style("fill", "#00f")
				.style("stroke-width", 2)
				.style("display", function(d) {
					return _this._datasetInstance.hasFriendLinks(d) ? "inline" : "none";
				})
				.call(d3.drag()
					.on("start", function(d) {
						_this._eventDragStartCircle(d, this);
					})
					.on("drag", function(d) {
						_this._eventDragDragCircle(d, this);
					})
					.on("end", function(d) {
						_this._eventDragEndCircle(d, this);
					})
				)
			;
	};

	_modifyNode(selection, _this) {
		var nodeID = selection.datum();
		var t = selection.selectAll("circle");
		selection.selectAll("circle").remove();
		var tmpRect = selection.select(`#rect_${nodeID}`)
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 0)
			.attr("height", 0)
		;
		var tmpText = selection.select(`#text_${nodeID}`)
			.text(function(d) { return _this._datasetInstance.getNode(d).text; })
		;

		tmpRect
			.attr("x", function(d) {
				return this.parentNode.getBBox().x - margo;
			})
			.attr("y", function(d) {
				return this.parentNode.getBBox().y - margo;
			})
			.attr("width", function(d) {
				return _this._tmp.nodes[`ID${d}`].width = margo + this.parentNode.getBBox().width + margo;
			})
			.attr("height", function(d) {
				return _this._tmp.nodes[`ID${d}`].height = margo + this.parentNode.getBBox().height + margo;
			})
		;
		selection.append("circle")
			.attr("class", "child")
			.attr("r", margo)
			.attr("cx", 2*margo)
			.attr("cy", function(d) {return _this._tmp.nodes[`ID${d}`].height/2;})
			.style("fill", "#f00")
			.style("stroke-width", 2)
			.style("display", function(d) {
				return _this._datasetInstance.hasChildLinks(d) ? "inline" : "none";
			})
			.call(d3.drag()
				.on("start", function(d) {
					_this._eventDragStartCircle(d, this);
				})
				.on("drag", function(d) {
					_this._eventDragDragCircle(d, this);
				})
				.on("end", function(d) {
					_this._eventDragEndCircle(d, this);
				})
			)
		;
		selection.append("circle")
			.attr("class", "parent")
			.attr("r", margo)
			.attr("cx", -2*margo)
			.attr("cy", function(d) {return -_this._tmp.nodes[`ID${d}`].height/2;})
			.style("fill", "#0f0")
			.style("stroke-width", 2)
			.style("display", function(d) {
				return _this._datasetInstance.hasParentLinks(d) ? "inline" : "none";
			})
			.call(d3.drag()
				.on("start", function(d) {
					_this._eventDragStartCircle(d, this);
				})
				.on("drag", function(d) {
					_this._eventDragDragCircle(d, this);
				})
				.on("end", function(d) {
					_this._eventDragEndCircle(d, this);
				})
			)
		;
		selection.append("circle")
			.attr("class", "friend")
			.attr("r", margo)
			.attr("cx", function(d) {return -_this._tmp.nodes[`ID${d}`].width/2;})
			.attr("cy", 0)
			.style("fill", "#00f")
			.style("stroke-width", 2)
			.style("display", function(d) {
				return _this._datasetInstance.hasFriendLinks(d) ? "inline" : "none";
			})
			.call(d3.drag()
				.on("start", function(d) {
					_this._eventDragStartCircle(d, this);
				})
				.on("drag", function(d) {
					_this._eventDragDragCircle(d, this);
				})
				.on("end", function(d) {
					_this._eventDragEndCircle(d, this);
				})
			)
		;
	};

	_appendLink(selection, _this) {
		//log.ERROR("_appendLink" + JSON.stringify(selection));

		selection
			.style("fill", "none")
			.style("opacity", 0)
			.attr("d", function(d) {
				//log.DEBUG(`_appendLink d(${JSON.stringify(d)})`);
				return calcPathWithDirs(
					_this._tmp.nodes[`ID${d.source}`].x0, _this._tmp.nodes[`ID${d.source}`].y0,
					_this._tmp.nodes[`ID${d.source}`].width, _this._tmp.nodes[`ID${d.source}`].height,
					_this._tmp.nodes[`ID${d.target}`].x0, _this._tmp.nodes[`ID${d.target}`].y0,
					_this._tmp.nodes[`ID${d.target}`].width, _this._tmp.nodes[`ID${d.target}`].height,
					d["type"], margo
				);
			})
			.on("mouseenter", function(d) {
				if (_this._tmp.viewMode === "normal") {
					d3.select(this)
						.style("stroke-width", 7)
						.style("stroke", "#f77")
						//.style("stroke-dasharray", ("10, 10"))
					;
					_this._tmp.focus = "svg-link";
					_this._tmp.selectedLink = {sourceNodeID: d.source, targetNodeID: d.target, type: d.type};
				};
			})
			.on("mouseleave", function(d) {
				if (_this._tmp.viewMode === "normal") {
					d3.select(this)
						.style("stroke-width", 1)
						.style("stroke", "#000")
						//.style("stroke-dasharray", "none")
					;
				};
				_this._tmp.focus = "svg-node";
				_this._tmp.selectedLink = {sourceNodeID: null, targetNodeID: null, type: null};
			})
		;
	};

	_appendHistory(nodeID) {
		var _this = this;
		var index = this._tmp.historyIDs.indexOf(nodeID);
		if (index > -1) {
			this._tmp.historyIDs.splice(index,1);
		};
		this._tmp.historyIDs.unshift(nodeID);

		// Filter out the deleted items
		this._tmp.historyIDs = this._tmp.historyIDs.filter( function(element) {
			return (!_this._datasetInstance.isDeleted(element));
		});

		var remainingWidth = this._w;
		var padding = 30;
		var terminate = false;

		for (var i=1; ((!terminate)&&(i<this._tmp.historyIDs.length)); i++) {
			if ((!terminate) && (remainingWidth >=  this._tmp.nodes[`ID${this._tmp.historyIDs[i]}`].width + padding)) {
				this._tmp.nodes[`ID${this._tmp.historyIDs[i]}`].xHistory = remainingWidth - (this._tmp.nodes[`ID${this._tmp.historyIDs[i]}`].width + padding) / 2;
				this._tmp.nodes[`ID${this._tmp.historyIDs[i]}`].yHistory = this._h - nodeHeight/2 - 4; // -4 mert 1-1px a border + 1-1px h ne is érjen hozzá.
				remainingWidth -= this._tmp.nodes[`ID${this._tmp.historyIDs[i]}`].width + padding;
			} else {
				terminate = true;
				this._tmp.historyIDs = this._tmp.historyIDs.slice(0,i);
			};
		};
		log.DEBUG(`history(${JSON.stringify(this._tmp.historyIDs)})`);
		var tmpNodes = this.svgHistory.selectAll("g")
			.data(this._tmp.historyIDs.slice(1,this._tmp.historyIDs.length) , function(d) {return d; })
		;
		// MODIFY history nodes
			tmpNodes.transition().duration(this._view.viewData.animationDuration)
				.attr("transform", function(d) {return `translate(${_this._tmp.nodes[`ID${d}`].xHistory}, ${_this._tmp.nodes[`ID${d}`].yHistory})`; })
			;
			tmpNodes.select(".rectangle").transition().duration(this._view.viewData.animationDuration)
				.style("fill", function(d) {
					//log.DEBUG(`d(${d}) ${node.class}Color(${layout_thebrain.dataset.preferences.node[node.class+"Color"]})`);
					return _this._view.viewData.node[_this._tmp.nodes[`ID${d}`].zone+"Color"];
				})
				.style("fill-opacity", function(d) {
					return _this._view.viewData.node[_this._tmp.nodes[`ID${d}`].zone+"Opacity"];
				})
			;
			tmpNodes.select(".child")
				.style("display", function(d) {
					return _this._datasetInstance.hasChildLinks(d) ? "inline" : "none";
				})
			;
			tmpNodes.select(".parent")
				.style("display", function(d) {
					return _this._datasetInstance.hasParentLinks(d) ? "inline" : "none";
				})
			;
			tmpNodes.select(".friend")
				.style("display", function(d) {
					return _this._datasetInstance.hasFriendLinks(d) ? "inline" : "none";
				})
			;

		// APPEND nodes
			var tmpTmpNodes = tmpNodes.enter().append("g")
				.call(this._appendNode, this)
				.attr("class", "nodeHistory")
				.transition().duration(this._view.viewData.animationDuration)
					.style("opacity", 1)
					.attr("transform", function(d) {return `translate(${_this._tmp.nodes[`ID${d}`].xHistory}, ${_this._tmp.nodes[`ID${d}`].yHistory})`; })
			;

		// REMOVE nodes
			tmpNodes.exit().remove();
	};

	_setCirclesDisplay(nodeID, mode) {
		var _this = this;
		var selection = this.svgBase.selectAll(`#node_${nodeID}`);

		selection.select(".child")
			.style("display", function(d) {
				return ((mode === "showAll") ? "inline" : (_this._datasetInstance.hasChildLinks(d) ? "inline" : "none"));
			})
		;
		selection.select(".parent")
			.style("display", function(d) {
				return ((mode === "showAll") ? "inline" : (_this._datasetInstance.hasParentLinks(d) ? "inline" : "none"));
			})
		;
		selection.select(".friend")
			.style("display", function(d) {
				return ((mode === "showAll") ? "inline" : (_this._datasetInstance.hasFriendLinks(d) ? "inline" : "none"));
			})
		;
	};

	eventListenerKeydown(e) {
		//$(`#node-editor-${this.datasetKey}-${this.viewKey}`).modal('show');
		log.DEBUG(`e.key(${e.key})`);
		if (this._tmp.focus === "search") {
			// Events for modal #node-search-
		} else if (this._tmp.focus === "editor") {
			// Events for modal #node-editor-
		} else if (this._tmp.focus === "svg-link") {
			switch (e.key) {
				case "Delete":
					if (e.ctrlKey) {
						//
					} else {
						// delete the link
						this.deleteLink(this._tmp.selectedLink.sourceNodeID, this._tmp.selectedLink.targetNodeID, this._tmp.selectedLink.type);
					}
					break;
				default:
					//
			}
		} else if (this._tmp.focus === "svg-node") {
			switch (e.key) {
				case "ArrowRight":
					if (e.ctrlKey) {
						//
					} else {
						var nodeID = this._view.viewData.selectedNodeID;
						if (this._tmp.visibles.siblingIDs.length > 0) {
							var nextNodeID = this._tmp.visibles.siblingIDs.find( function(element) {
								return element > nodeID;
							});
							if (nextNodeID) {
								this._drawVisibles(nextNodeID);
							} else {
								this._drawVisibles(this._tmp.visibles.siblingIDs[0]);
							};
						};
					};
					break;
				case "ArrowDown":
					if (e.ctrlKey) {
						this.addChild(this._view.viewData.selectedNodeID);
					} else {
						if (this._tmp.visibles.childIDs.length > 0) {
							this._drawVisibles(this._tmp.visibles.childIDs[0]);
						}
					};
					break;
				case "ArrowUp":
					if (e.ctrlKey) {
						this.addParent(this._view.viewData.selectedNodeID);
					} else {
						if (this._tmp.visibles.parentIDs.length > 0) {
							this._drawVisibles(this._tmp.visibles.parentIDs[0]);
						};
					};
					break;
				case "ArrowLeft":
					if (e.ctrlKey) {
						this.addFriend(this._view.viewData.selectedNodeID);
					} else {
						var nodeID = this._view.viewData.selectedNodeID;
						if (this._tmp.visibles.friendIDs.length > 0) {
							var nextNodeID = this._tmp.visibles.friendIDs.find( function(element) {
								return element > nodeID;
							});
							if (nextNodeID) {
								this._drawVisibles(nextNodeID);
							} else {
								this._drawVisibles(this._tmp.visibles.friendIDs[0]);
							};
						};
					};
					break;
				case "Delete":
					var nodeID = this._view.viewData.selectedNodeID;
					this.deleteNode(nodeID);
					break;
				case "f":
					if (e.ctrlKey) {
						// To disable browser default action.
						e.preventDefault();

						$(`#node-search-${this.datasetKey}-${this.viewKey}`).modal('show');
					} else {
						//
					};
					break;
				case "Enter":
					$(`#node-editor-${this.datasetKey}-${this.viewKey}`).modal('show');
					break;
				default:
					log.DEBUG(e.key);
			};
		};
	};

	eventListenerButton(uiElement) {
		$(`#node-leftmenu-${this.datasetKey}-${this.viewKey}`).modal("show");
	};

	_eventMouseenterNode(nodeID, node) {
		var nodes = this.svgBase.selectAll(`#node_${nodeID}`);
		nodes.select(".rectangle")
			.style("stroke-width", 3)
		;

		this._setCirclesDisplay(nodeID, "showAll");

		if (this._tmp.viewMode === "insert") {
			if (this._tmp.newNode.sourceNodeID !== nodeID) {
				this._tmp.newNode.targetNodeID = nodeID;
				this._tmp.newNode.targetClass = d3.select(node).attr("class");
			} else {
				this._tmp.newNode.targetNodeID = null;
				this._tmp.newNode.targetClass = null;
			};
		} else {
			this._tmp.newNode.sourceNodeID = nodeID;
			this._tmp.newNode.sourceClass = d3.select(node).attr("class");
			this._tmp.newNode.targetNodeID = null;
			this._tmp.newNode.targetClass = null;
		};
	};

	_eventMouseleaveNode(nodeID, node) {
		this.svgBase.selectAll(`#node_${nodeID}`).select(".rectangle")
			.style("stroke-width", 1)
		;

		if (this._tmp.viewMode === "normal") {
			this._setCirclesDisplay(nodeID, "showHasLinks");
			this._tmp.newNode.sourceNodeID = null;
			this._tmp.newNode.sourceClass = null;
			this._tmp.newNode.targetNodeID = null;
			this._tmp.newNode.targetClass = null;
		} else if (this._tmp.viewMode === "insert") {
			if (this._tmp.newNode.sourceNodeID !== nodeID) {
				this._setCirclesDisplay(nodeID, "showHasLinks");
			};
			this._tmp.newNode.targetNodeID = -1;
			this._tmp.newNode.targetClass = null;
		};
	};

	_eventDragStartCircle(nodeID, circle) {
		log.DEBUG(`eventDragStartCircle(${nodeID},${d3.select(circle).attr("class")})`);

		this._tmp.viewMode = "insert";
		this._tmp.newNode.linkType = d3.select(circle).attr("class");
	};

	_eventDragDragCircle(nodeID, circle) {
		//log.DEBUG(`eventDragDragCircle.target(${d3.select(this).attr("class")})`);
		var _this = this;
		var dragcircle = this.svgBase.select("#dragcircle");
		var dragpath = this.svgBase.select("#dragpath");

		var node = this._tmp.nodes[`ID${nodeID}`];
		var sourceClass = this._tmp.newNode.sourceClass;
		var targetClass = this._tmp.newNode.targetClass;

		if ((Math.abs(d3.event.x) > node.width/2) || (Math.abs(d3.event.y) > node.height/2)) {
			// Kiléptünk a nodeból --> valós dragging
			if (!dragcircle.empty()) {
				if ((this._tmp.newNode.targetNodeID === -1) || (this._tmp.newNode.targetNodeID === null)) {
					dragcircle
						.style("opacity", 1)
						.attr("transform", function(d) {
							if (sourceClass === "node") {
								return `translate(${node.x + d3.event.x},${node.y + d3.event.y})`;
							} else {
								return `translate(${node.xHistory + d3.event.x},${node.yHistory + d3.event.y})`;
							};
						})
					;
					dragpath
						.attr("d", function() {
							if (sourceClass === "node") {
								return calcPathWithDirs(
									node.x, node.y, node.width, node.height,
									node.x + d3.event.x, node.y + d3.event.y, 0, 0,
									_this._tmp.newNode.linkType, margo
								);
							} else if (sourceClass === "nodeHistory") {
								return calcPathWithDirs(
									node.xHistory, node.yHistory, node.width, node.height,
									node.xHistory + d3.event.x, node.yHistory + d3.event.y, 0, 0,
									_this._tmp.newNode.linkType, margo
								);
							};
						})
					;
				} else {
					var targetNode = this._tmp.nodes[`ID${this._tmp.newNode.targetNodeID}`];
					dragcircle
						.style("opacity", 0)
					;
					dragpath
						.attr("d", function() {
							log.DEBUG(`sourceClass(${sourceClass}), targetClass(${targetClass})`);
							if (sourceClass === "node") {
								if (targetClass === "node") {
									return calcPathWithDirs(
										node.x, node.y, node.width, node.height,
										targetNode.x, targetNode.y, targetNode.width, targetNode.height,
										_this._tmp.newNode.linkType, margo
									);
								} else if (targetClass === "nodeHistory") {
									return calcPathWithDirs(
										node.x, node.y, node.width, node.height,
										targetNode.xHistory, targetNode.yHistory, targetNode.width, targetNode.height,
										_this._tmp.newNode.linkType, margo
									);
								};
							} else if (sourceClass === "nodeHistory") {
								if (targetClass === "node") {
									return calcPathWithDirs(
										node.xHistory, node.yHistory, node.width, node.height,
										targetNode.x, targetNode.y, targetNode.width, targetNode.height,
										_this._tmp.newNode.linkType, margo
									);
								} else if (targetClass === "nodeHistory") {
									return calcPathWithDirs(
										node.xHistory, node.yHistory, node.width, node.height,
										targetNode.xHistory, targetNode.yHistory, targetNode.width, targetNode.height,
										_this._tmp.newNode.linkType, margo
									);
								};
							};
						})
					;
				};
			} else {
				dragcircle = this.svgNodes.append("circle")
					.attr("id", "dragcircle")
					.attr("r", margo)
					.style("stroke-width", 2)
					.style("display", "inline")
					.style("pointer-events", "none") // For the event bubbling to work correctly.
					.attr("transform", function(d) {
						if (sourceClass === "node") {
							return `translate(${node.x + d3.event.x},${node.y + d3.event.y})`;
						} else if (sourceClass === "nodeHistory") {
							return `translate(${node.xHistory + d3.event.x},${node.yHistory + d3.event.y})`;
						};
					})
					.attr("fill", function() {
						if (_this._tmp.newNode.linkType === "child") {
							return "#0f0";
						} else if (_this._tmp.newNode.linkType === "parent") {
							return "#f00";
						} else if (_this._tmp.newNode.linkType === "friend") {
							return "#00f";
						};
					})
				;

				dragpath = this.svgLinks.append("path")
					.attr("id", "dragpath")
					.style("fill", "none")
					.style("pointer-events", "none") // For the event bubbling to work correctly.
					.attr("d", function() {
						if (sourceClass === "node") {
							return calcPathWithDirs(
								node.x, node.y, node.width, node.height,
								node.x + d3.event.x, node.y + d3.event.y, 0, 0,
								_this._tmp.newNode.linkType, margo
							);
						} else if (sourceClass === "nodeHistory") {
							return calcPathWithDirs(
								node.xHistory, node.yHistory, node.width, node.height,
								node.xHistory + d3.event.x, node.yHistory + d3.event.y, 0, 0,
								_this._tmp.newNode.linkType, margo
							);
						};
					})
				;
			};
		} else {
			// Belül vagyun a nodeon
			if (!dragcircle.empty()) {
				dragcircle.remove();
				dragpath.remove();
			};
		};
	};

	_eventDragEndCircle(nodeID, circle) {
		log.DEBUG(`eventDragEndCircle(${this._tmp.newNode.sourceNodeID}, ${this._tmp.newNode.targetNodeID}, ${this._tmp.newNode.linkType})`);
		if (this._tmp.newNode.targetNodeID !== null) {
			if (this._tmp.newNode.targetNodeID === -1) {
				$(`#node-search-${this.datasetKey}-${this.viewKey}`).modal('show');
			} else {
				this._datasetInstance.addLink(this._tmp.newNode.sourceNodeID, this._tmp.newNode.targetNodeID, this._tmp.newNode.linkType);
				this.svgBase.select("#dragcircle").remove();
				this.svgBase.select("#dragpath").remove();
				this._tmp.viewMode = "normal";
				this._drawVisibles(this._tmp.newNode.sourceNodeID);
			};
		} else {
			this._tmp.viewMode = "normal";
		};
	};

	addChild(nodeID) {
		if (!nodeID) {
			nodeID = this._view.viewData.selectedNodeID;
		};
		this._tmp.viewMode = "insert";
		this._tmp.newNode.sourceNodeID = nodeID;
		this._tmp.newNode.sourceClass = "node";
		this._tmp.newNode.targetNodeID = -1;
		this._tmp.newNode.targetClass = null;
		this._tmp.newNode.linkType = "child";
		$(`#node-search-${this.datasetKey}-${this.viewKey}`).modal('show');
	};

	addParent(nodeID) {
		if (nodeID === null) {
			nodeID = this._view.viewData.selectedNodeID;
		};
		this._tmp.viewMode = "insert";
		this._tmp.newNode.sourceNodeID = nodeID;
		this._tmp.newNode.sourceClass = "node";
		this._tmp.newNode.targetNodeID = -1;
		this._tmp.newNode.targetClass = null;
		this._tmp.newNode.linkType = "parent";
		$(`#node-search-${this.datasetKey}-${this.viewKey}`).modal('show');
	};

	addFriend(nodeID) {
		if (nodeID === null) {
			nodeID = this._view.viewData.selectedNodeID;
		};
		this._tmp.viewMode = "insert";
		this._tmp.newNode.sourceNodeID = nodeID;
		this._tmp.newNode.sourceClass = "node";
		this._tmp.newNode.targetNodeID = -1;
		this._tmp.newNode.targetClass = null;
		this._tmp.newNode.linkType = "friend";
		$(`#node-search-${this.datasetKey}-${this.viewKey}`).modal('show');
	};

	deleteNode(nodeID) {
		if (nodeID === null) {
			nodeID = this._view.viewData.selectedNodeID;
		};
		var newSelectedID = null;
		var datasetInstance = this._datasetInstance;
		var otherRoodNodeID = Object.keys(datasetInstance._data.rootNodes).filter(function(element) {
			return datasetInstance._data.rootNodes[element] != nodeID;
		});

		if (this._tmp.visibles.parentIDs.length > 0) {
			newSelectedID = this._tmp.visibles.parentIDs[0];
		} else if (this._tmp.visibles.childIDs.length > 0) {
			newSelectedID = this._tmp.visibles.childIDs[0];
		} else if (this._tmp.visibles.friendIDs.length > 0) {
			newSelectedID = this._tmp.visibles.friendIDs[0];
		} else if (otherRoodNodeID.length > 0) {
			newSelectedID = datasetInstance._data.rootNodes[otherRoodNodeID[0]];
		} else {
			var orphanNodeIDs = datasetInstance.findOrphanNodeIDs();
			if (orphanNodeIDs.length > 0) {
				newSelectedID = orphanNodeIDs[0];
			}
		};
		if (newSelectedID !== null) {
			datasetInstance.deleteNode(nodeID);
			this._drawVisibles(newSelectedID);
		};
	};

	deleteLink(sourceNodeID, targetNodeID, type) {
		this._datasetInstance.purgeLink(sourceNodeID, targetNodeID, type);
		this._drawVisibles(0);
		this._tmp.focus = "svg-node";
		this._tmp.selectedLink = {sourceNodeID: null, targetNodeID: null, type: null};
	};
};


export {LP_Thebrain};

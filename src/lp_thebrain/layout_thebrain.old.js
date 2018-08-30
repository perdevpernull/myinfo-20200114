
// We suppose that exists in the global namespace:
// var dataset;
// var nodesData;

var svg;
var svgBase;
var svgPlaceholder;
var svgLinks;
var svgNodes;
var svgPins;
var svgHistory;

var nodeHeight = 40;

var margo = 5;

var layout_thebrain = {
	dataset: {
		selectedNodeID: 0,
		preferences: {
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
		},
		pins: []
	},
	datasetTmp: {
		x: 0, y: 0, w: 0, h: 0,
		friendzone: { x: 0, y: 0, w: 0, h: 0 },
		parentzone: { x: 0, y: 0, w: 0, h: 0 },
		siblingzone: { x: 0, y: 0, w: 0, h: 0 },
		actualzone: { x: 0, y: 0, w: 0, h: 0 },
		childzone: { x: 0, y: 0, w: 0, h: 0 },
		placeholderx: 0, placeholdery: 0,

		viewMode: "normal", // normal or insert
		newNode: {linkType: "", sourceClass: null, sourceNodeID: null, targetClass: null, targetNodeID: null},

		visibles: {
			nodes: [],
			links: [],
			friends: [],
			parents: [],
			siblings: [],
			actual: null,
			children: []
		},
		nodes: {},
		history: []
	},

	setDatasetJson: function(data) {
		layout_thebrain.dataset = data;
	},

	getDatasetJson: function() {
		return layout_thebrain.dataset;
	},

	setZones: function(x,y,w,h) {
		layout_thebrain.datasetTmp.x = x;
		layout_thebrain.datasetTmp.y = y;
		layout_thebrain.datasetTmp.w = w;
		layout_thebrain.datasetTmp.h = h;
		layout_thebrain.datasetTmp.friendzone = {x: x, y: y, w: w/3, h: 2*h/3};
		layout_thebrain.datasetTmp.parentzone = {x: x+w/3, y: y, w: w/3, h: h/3};
		layout_thebrain.datasetTmp.siblingzone = {x: x+2*w/3, y: y, w: w/3, h: 2*h/3};
		layout_thebrain.datasetTmp.actualzone = {x: x+w/3, y: y+h/3, w: w/3, h: h/3};
		layout_thebrain.datasetTmp.childzone = {x: x, y: y+2*h/3, w: w, h: h/3};
		layout_thebrain.datasetTmp.placeholderx = (layout_thebrain.datasetTmp.actualzone.x + layout_thebrain.datasetTmp.actualzone.w/2);
		layout_thebrain.datasetTmp.placeholdery = (layout_thebrain.datasetTmp.actualzone.y + layout_thebrain.datasetTmp.actualzone.h/2);
		log.DEBUG(`x: ${x}, y: ${y}, w: ${w}, h: ${h}`);
		log.DEBUG(`placeholderx: ${layout_thebrain.datasetTmp.placeholderx}, placeholdery: ${layout_thebrain.datasetTmp.placeholdery}`);
	},

	calcVisiblesPositions: function() {
		var nodeID;
		var neededHeight;
		var numInOneCol;
		var numOfCols;
		var i;
		// FRIEND
			numInOneCol = Math.floor(layout_thebrain.datasetTmp.friendzone.h / nodeHeight) - 1; // -1 a pin sáv miatt
			numOfCols = Math.ceil(layout_thebrain.datasetTmp.visibles.friends.length / numInOneCol);
			neededHeight = Math.ceil(layout_thebrain.datasetTmp.visibles.friends.length / numOfCols) * nodeHeight;
			for (i = 0; i < layout_thebrain.datasetTmp.visibles.friends.length; i++) {
				nodeID = layout_thebrain.datasetTmp.visibles.friends[i];
				if (!layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]) {
					layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = {};
				};

				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].x = layout_thebrain.datasetTmp.friendzone.x + layout_thebrain.datasetTmp.friendzone.w/(2*numOfCols) + (i % numOfCols) * layout_thebrain.datasetTmp.friendzone.w / numOfCols;
				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].y = layout_thebrain.datasetTmp.friendzone.y + (layout_thebrain.datasetTmp.friendzone.h - neededHeight)/2 + nodeHeight/2 + Math.floor(i/numOfCols) * nodeHeight;
			};

		// PARENT
			numInOneCol = Math.floor(layout_thebrain.datasetTmp.parentzone.h / nodeHeight) - 1; // -1 a history sáv miatt.
			if (layout_thebrain.datasetTmp.visibles.parents.length <= 1) {
				numOfCols = 1;
			} else {
				numOfCols = Math.max(Math.ceil(layout_thebrain.datasetTmp.visibles.parents.length / numInOneCol),2);
			};
			neededHeight = Math.ceil(layout_thebrain.datasetTmp.visibles.parents.length / numOfCols) * nodeHeight;
			log.DEBUG(`numInOneCol(${numInOneCol}), numOfCols(${numOfCols})`);
			for (i = 0; i < layout_thebrain.datasetTmp.visibles.parents.length; i++) {
				nodeID = layout_thebrain.datasetTmp.visibles.parents[i];
				if (!layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]) {
					layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = {};
				};

				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].x = layout_thebrain.datasetTmp.parentzone.x + layout_thebrain.datasetTmp.parentzone.w/(2*numOfCols) + (i % numOfCols) * layout_thebrain.datasetTmp.parentzone.w/numOfCols;
				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].y = layout_thebrain.datasetTmp.parentzone.y + (layout_thebrain.datasetTmp.parentzone.h - neededHeight)/2 + nodeHeight/2 + Math.floor(i/numOfCols) * nodeHeight;
			};

		// SIBLING
			numInOneCol = Math.floor(layout_thebrain.datasetTmp.siblingzone.h / nodeHeight) - 1; // -1 a pin sáv miatt
			numOfCols = Math.ceil(layout_thebrain.datasetTmp.visibles.siblings.length / numInOneCol);
			neededHeight = Math.ceil(layout_thebrain.datasetTmp.visibles.siblings.length / numOfCols) * nodeHeight;
			for (i = 0; i < layout_thebrain.datasetTmp.visibles.siblings.length; i++) {
				nodeID = layout_thebrain.datasetTmp.visibles.siblings[i];
				if (!layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]) {
					layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = {};
				};

				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].x = layout_thebrain.datasetTmp.siblingzone.x + layout_thebrain.datasetTmp.siblingzone.w/(2*numOfCols) + (i % numOfCols) * layout_thebrain.datasetTmp.siblingzone.w / numOfCols;
				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].y = layout_thebrain.datasetTmp.siblingzone.y + (layout_thebrain.datasetTmp.siblingzone.h - neededHeight)/2 + nodeHeight/2 + Math.floor(i/numOfCols) * nodeHeight;
			};

		// ACTUAL
			nodeID = layout_thebrain.datasetTmp.visibles.actual;
			if (!layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]) {
				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = {};
			};
			layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].x = layout_thebrain.datasetTmp.placeholderx;
			layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].y = layout_thebrain.datasetTmp.placeholdery;

		// CHILD
			numInOneCol = Math.floor(layout_thebrain.datasetTmp.childzone.h / nodeHeight) - 1; // -1 a history sáv miatt.
			if (layout_thebrain.datasetTmp.visibles.children.length <= 1) {
				numOfCols = 1;
			} else {
				numOfCols = Math.max(Math.ceil(layout_thebrain.datasetTmp.visibles.children.length / numInOneCol),2);
			};
			for (i = 0; i < layout_thebrain.datasetTmp.visibles.children.length; i++) {
				nodeID = layout_thebrain.datasetTmp.visibles.children[i];
				if (!layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]) {
					layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = {};
				};

				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].x = layout_thebrain.datasetTmp.childzone.x + layout_thebrain.datasetTmp.childzone.w/(2*numOfCols) + (i % numOfCols) * layout_thebrain.datasetTmp.childzone.w/numOfCols;

				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].y = layout_thebrain.datasetTmp.childzone.y + Math.floor(i/numOfCols) * nodeHeight;
			};
	},

	initLayout: function(width, height) {
		log.DEBUG(`initLayout( width: ${width}, height: ${height})`);
		// inserting keypress listener on body
			d3.select("body")
			.on("keydown", layout_thebrain.eventKeydownBody)
			;

		// Building the elements of the layout into #workspace
			// Insert main div
				d3.select("#workspace").append("div")
					.attr("id", "main")
				// Insert Select2 search field
					.append("div")
						.attr("id", "searchdiv")
						.append("div")
							.attr("id", "search");

					// Select2 component
						$("#search").select2(
							{
								query: function(options) {
									//alert("query: "+JSON.stringify(options));
									var pageSize = 10;
									var startIndex = (options.page - 1) * pageSize;
									var filteredData = [];

									if (options.term && options.term.length > 0) {
										if (!options.context) {
											var term = options.term.toLowerCase();
											var keys = Object.keys(dataset.dataset.nodes).filter(function(metric) {
												// majd figyelni kell, h a deleted-ek ne szerepeljenek a listában.
												return (dataset.dataset.nodes[metric].text.toLowerCase().indexOf(term) !== -1);
											});
											options.context = [];
											for (var i = 0; i < keys.length; i++) {
												options.context.push({
													id: dataset.dataset.nodes[keys[i]].ID,
													text: dataset.dataset.nodes[keys[i]].text
												});
											};
										}
										filteredData = options.context;
									}

									options.callback({
										context: filteredData,
										results: filteredData.slice(startIndex, startIndex + pageSize),
										more: (startIndex + pageSize) < filteredData.length
									});
								},
								placeholder: "Írj be egy nevet",
								allowClear: true,
								openOnEnter: false,
								formatNoMatches: function(term) {return "Nincs találat";},
								containerCssClass : "show-hide",
								createSearchChoice : function(term, data) {
									if (layout_thebrain.datasetTmp.viewMode === "insert") {
										if ((data.length !== 1) || (term !== data[0].text)) {
											return { id: -1, text: term };
										};
									};
								}
							}
						);

					// Select2 search box listeners
						$("#search").on("select2-selecting", function(e) {
							if (layout_thebrain.datasetTmp.viewMode === "insert") {
								//alert(`val=(${e.val})`);
								//alert(`object=(${JSON.stringify(e.object)})`);
								d3.select("#dragcircle").remove();
								d3.select("#dragpath").remove();
								layout_thebrain.datasetTmp.viewMode = "normal";
								if (e.val > -1) {
									if (layout_thebrain.datasetTmp.newNode.linkType === "friend") {
										dataset.addFriendLink( layout_thebrain.datasetTmp.newNode.sourceNodeID, e.val);
									} else if (layout_thebrain.datasetTmp.newNode.linkType === "parent") {
										dataset.addParentLink( layout_thebrain.datasetTmp.newNode.sourceNodeID, e.val);
									} else if (layout_thebrain.datasetTmp.newNode.linkType === "child") {
										dataset.addChildLink( layout_thebrain.datasetTmp.newNode.sourceNodeID, e.val);
									};
									layout_thebrain.drawVisibles(layout_thebrain.datasetTmp.newNode.sourceNodeID);
								} else {
									var newNodeID;
									if (layout_thebrain.datasetTmp.newNode.linkType === "friend") {
										newNodeID = dataset.addFriendNode( layout_thebrain.datasetTmp.newNode.sourceNodeID, e.object.text);
									} else if (layout_thebrain.datasetTmp.newNode.linkType === "parent") {
										newNodeID = dataset.addParentNode( layout_thebrain.datasetTmp.newNode.sourceNodeID, e.object.text);
									} else if (layout_thebrain.datasetTmp.newNode.linkType === "child") {
										log.DEBUG(`e.val(${e.val}), e.object.text(${e.object.text})`);
										newNodeID = dataset.addChildNode( layout_thebrain.datasetTmp.newNode.sourceNodeID, e.object.text);
									};
									layout_thebrain.drawVisibles(layout_thebrain.datasetTmp.newNode.sourceNodeID);
								};
							} else {
								layout_thebrain.drawVisibles(e.object.id);
							};
						});
						$("#search").on("select2-close", function(e) {
							d3.select("#dragcircle").remove();
							d3.select("#dragpath").remove();
							if (layout_thebrain.datasetTmp.newNode.sourceNodeID !== null) {
								layout_thebrain.setCirclesDisplay(d3.select("#node_"+layout_thebrain.datasetTmp.newNode.sourceNodeID), "showHasLinks")
							};
							layout_thebrain.datasetTmp.viewMode = "normal";
						});

				// Inserting drawing area
					d3.select("#main").append("div")
						.attr("id", "drawingarea")
					;
					// Inserting svg
						svg = d3.select("#drawingarea").append("svg")
							.attr("id", "svg")
							.style("width", "100%")
							.style("height", height - $("#searchdiv").outerHeight(true) - 6)
							.style("stroke", "black")
							.style("stroke-width", 1)
							.style("border", "1px solid black")
							.on("selectstart", function() {d3.event.preventDefault();}) // To prevent text selection.
						;
							layout_thebrain.setZones(0,0,$("#svg").width(),$("#svg").height());
							//log(JSON.stringify(visiblesPlacer));
							//log("placeholder=("+placeholderx+","+placeholdery+")");

							svgBase = svg.append("g")
								.attr("id", "svgBase")
							;
								svgPlaceholder = svgBase.append("g")
									.attr("id", "svgPlaceholder")
									.attr("transform", `translate(${layout_thebrain.datasetTmp.placeholderx},${layout_thebrain.datasetTmp.placeholdery})`)
								;
									var zoomPercent = 33/100;
									svgPlaceholder.append("polygon")
										.attr("id", "placeholder")
										.attr("points", `${0*zoomPercent},${-100*zoomPercent} ${-97*zoomPercent},${22*zoomPercent} ${43*zoomPercent},${90*zoomPercent} ${78*zoomPercent},${-62*zoomPercent} ${-78*zoomPercent},${-62*zoomPercent} ${-43*zoomPercent},${90*zoomPercent} ${97*zoomPercent},${22*zoomPercent}`)
										.style("fill", "lime")
										.style("fill-rule", "evenodd")
										.style("stroke", "purple")
										.style("stroke-width", 3)
										.append("animateTransform")
											.attr("attributeName", "transform")
											.attr("attributeType", "XML")
											.attr("type", "rotate")
											.attr("from", "0 0 0")
											.attr("to", "360 0 0")
											.attr("dur", "7s")
											.attr("repeatCount","indefinite")
											//.attr("repeatCount","1")
									;
								svgLinks = svgBase.append("g")
									.attr("id", "svgLinks")
								;
								svgNodes = svgBase.append("g")
									.attr("id", "svgNodes")
								;
								svgPins = svgBase.append("g")
									.attr("id", "svgPins")
								;
								svgHistory = svgBase.append("g")
									.attr("id", "svgHistory")
								;
	},

	//refreshLayout({"title": "TheBrain view1", "layoutModuleCode": "layout_thebrain", "linkDatasetJson": "dataset_thebrain_view1.json"});
	refreshLayout: function(view) {
		loadJson(view.linkDatasetJson, function(data) {
			layout_thebrain.setDatasetJson(data);

			layout_thebrain.drawVisibles(layout_thebrain.dataset.selectedNodeID);
		});
	},

	resizeLayout: function(width, height) {
		svg = d3.select("#svg")
			.style("height", height - $("#searchdiv").height() - 6)
		;
		layout_thebrain.setZones(0,0,$("#svg").width(),$("#svg").height());

		layout_thebrain.drawVisibles(layout_thebrain.dataset.selectedNodeID);
	},

	destroyLayout: function() {

		d3.select("#main").remove();
	},

	drawVisibles: function(nodeID) {
		log.DEBUG(`clicked(${nodeID})`);

		layout_thebrain.dataset.selectedNodeID = nodeID;

		// A korábbi látható elmek pozícióinak elmentése
			for (var i = 0; i < layout_thebrain.datasetTmp.visibles.nodes.length; i++) {
				var nodeIndex = layout_thebrain.datasetTmp.visibles.nodes[i];
				layout_thebrain.datasetTmp.nodes[`ID${nodeIndex}`].x0 = layout_thebrain.datasetTmp.nodes[`ID${nodeIndex}`].x;
				layout_thebrain.datasetTmp.nodes[`ID${nodeIndex}`].y0 = layout_thebrain.datasetTmp.nodes[`ID${nodeIndex}`].y;
			};

		// A kattintás után látható elmek kikeresése és pozíciójuk meghatározása
			layout_thebrain.datasetTmp.visibles = layout_thebrain.findVisibles(layout_thebrain.dataset.selectedNodeID);
			layout_thebrain.calcVisiblesPositions();
			log.DEBUG("Visible nodeIDs: " + JSON.stringify(layout_thebrain.datasetTmp.visibles.nodes));

		// Placeholder mozgaása
			if (layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.dataset.selectedNodeID}`].x0) {
				var x0 = layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.dataset.selectedNodeID}`].x0;
				var y0 = layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.dataset.selectedNodeID}`].y0;
				svgPlaceholder
					.attr("transform", `translate(${x0},${y0})`)
				;
			};
			svgPlaceholder
				.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
					.attr("transform", `translate(${layout_thebrain.datasetTmp.placeholderx},${layout_thebrain.datasetTmp.placeholdery})`)
			;

		// Változások lekérdezése és átrajzolás (nodes)
			var tmpNodes = svgNodes.selectAll("g")
				.data(layout_thebrain.datasetTmp.visibles.nodes, function(d) {return d; })
			;
			// MODIFY nodes
				tmpNodes.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
					.attr("transform", function(d) {return "translate(" + layout_thebrain.datasetTmp.nodes[`ID${d}`].x + "," + layout_thebrain.datasetTmp.nodes[`ID${d}`].y + ")"; })
					.select(".rectangle")
						.style("fill-opacity", function(d) {
							var node = layout_thebrain.getNode(d);
							//ToDo: Itt valami hiba van. Ha a friendNode-ra eltérő fill-opacity-t állítok, akkor a módosításkor elrontja.
							//log.DEBUG(`d(${d}) ${node.class}Opacity(${layout_thebrain.dataset.preferences.node[node.class+"Opacity"]})`);
							return layout_thebrain.dataset.preferences.node[node.class+"Opacity"];
						})
				;
				tmpNodes.select(".rectangle").transition().duration(layout_thebrain.dataset.preferences.animationDuration)
					.style("fill", function(d) {
						var node = layout_thebrain.getNode(d);
						return layout_thebrain.dataset.preferences.node[node.class+"Color"];
					})
				;
				tmpNodes.select(".child")
					.style("display", function(d) {
						return dataset.hasChildLinks(d) ? "inline" : "none";
					})
				;
				tmpNodes.select(".parent")
					.style("display", function(d) {
						return dataset.hasParentLinks(d) ? "inline" : "none";
					})
				;
				tmpNodes.select(".friend")
					.style("display", function(d) {
						return dataset.hasFriendLinks(d) ? "inline" : "none";
					})
				;

			// APPEND nodes
				var tmpTmpNodes = tmpNodes.enter().append("g")
					.call(layout_thebrain.appendNode)
					.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
						.style("opacity", 1)
						.attr("transform", function(d) {return "translate(" + layout_thebrain.datasetTmp.nodes[`ID${d}`].x + "," + layout_thebrain.datasetTmp.nodes[`ID${d}`].y + ")"; })
				;

			// REMOVE nodes
				tmpNodes.exit()
					.attr("class", function(d) {
						layout_thebrain.datasetTmp.nodes[`ID${d}`].x = null;
						layout_thebrain.datasetTmp.nodes[`ID${d}`].y = null;
						layout_thebrain.datasetTmp.nodes[`ID${d}`].x0 = null;
						layout_thebrain.datasetTmp.nodes[`ID${d}`].y0 = null;
						return "";
					})
					.remove()
				;

		//log.DEBUG(JSON.stringify(layout_thebrain.datasetTmp.visibles.links));

		// Változások lekérdezése és átrajzolás (links)
			var tmpLinks = svgLinks.selectAll("path")
				.data(layout_thebrain.datasetTmp.visibles.links, function(d) {return d.id; })
			;
			// MODIFY links
				tmpLinks.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
					.attr("d", function(d) {
						if (d["type"] === "friend") {
							if (layout_thebrain.datasetTmp.nodes[`ID${d.source}`].x <= layout_thebrain.datasetTmp.nodes[`ID${d.target}`].x) {
								var node;
								node = d3.select("#node_"+d.source);
								node.select(".friend")
									.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
										.attr("cx", function(d) {return +layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
								;
								node = d3.select("#node_"+d.target);
								node.select(".friend")
									.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
										.attr("cx", function(d) {return -layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
								;
							} else {
								var node;
								node = d3.select("#node_"+d.source);
								node.select(".friend")
									.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
										.attr("cx", function(d) {return -layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
								;
								node = d3.select("#node_"+d.target);
								node.select(".friend")
									.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
										.attr("cx", function(d) {return +layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
								;
							};
						};
						return calcPathWithDirs(
							layout_thebrain.datasetTmp.nodes[`ID${d.source}`].x, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].y,
							layout_thebrain.datasetTmp.nodes[`ID${d.source}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].height,
							layout_thebrain.datasetTmp.nodes[`ID${d.target}`].x, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].y,
							layout_thebrain.datasetTmp.nodes[`ID${d.target}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].height,
							d["type"]
						);
					})
				;

			// APPEND links
				tmpLinks.enter().append("path")
					.style("fill", "none")
					.style("opacity", 0)
					.attr("d", function(d) {
						var path = calcPathWithDirs(
							layout_thebrain.datasetTmp.nodes[`ID${d.source}`].x0, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].y0,
							layout_thebrain.datasetTmp.nodes[`ID${d.source}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].height,
							layout_thebrain.datasetTmp.nodes[`ID${d.target}`].x0, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].y0,
							layout_thebrain.datasetTmp.nodes[`ID${d.target}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].height,
							d["type"]
						);
						//log.DEBUG(`source(${d.source}), target(${d.target}), type(${d["type"]}), path(${path})` );
						return calcPathWithDirs(
							layout_thebrain.datasetTmp.nodes[`ID${d.source}`].x0, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].y0,
							layout_thebrain.datasetTmp.nodes[`ID${d.source}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].height,
							layout_thebrain.datasetTmp.nodes[`ID${d.target}`].x0, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].y0,
							layout_thebrain.datasetTmp.nodes[`ID${d.target}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].height,
							d["type"]
						);
					})
					.on("mouseenter", function(d) {
						if (layout_thebrain.datasetTmp.viewMode === "normal") {
							d3.select(this)
								.style("stroke-width", 7)
								.style("stroke", "#f77")
								//.style("stroke-dasharray", ("10, 10"))
							;
						};
					})
					.on("mouseleave", function(d) {
						if (layout_thebrain.datasetTmp.viewMode === "normal") {
							d3.select(this)
								.style("stroke-width", 1)
								.style("stroke", "#000")
								//.style("stroke-dasharray", "none")
							;
						};
					})
					.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
						.style("opacity", 1)
						.attr("d", function(d) {
							if (d["type"] === "friend") {
								if (layout_thebrain.datasetTmp.nodes[`ID${d.source}`].x <= layout_thebrain.datasetTmp.nodes[`ID${d.target}`].x) {
									var node;
									node = d3.select("#node_"+d.source);
									node.select(".friend")
										.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
											.attr("cx", function(d) {return +layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
									;
									node = d3.select("#node_"+d.target);
									node.select(".friend")
										.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
											.attr("cx", function(d) {return -layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
									;
								} else {
									var node;
									node = d3.select("#node_"+d.source);
									node.select(".friend")
										.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
											.attr("cx", function(d) {return -layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
									;
									node = d3.select("#node_"+d.target);
									node.select(".friend")
										.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
											.attr("cx", function(d) {return +layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
									;
								};
							};
							return calcPathWithDirs(
								layout_thebrain.datasetTmp.nodes[`ID${d.source}`].x, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].y,
								layout_thebrain.datasetTmp.nodes[`ID${d.source}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.source}`].height,
								layout_thebrain.datasetTmp.nodes[`ID${d.target}`].x, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].y,
								layout_thebrain.datasetTmp.nodes[`ID${d.target}`].width, layout_thebrain.datasetTmp.nodes[`ID${d.target}`].height,
								d["type"]
							);
						})
					;

			// REMOVE links
				tmpLinks.exit().remove();

		layout_thebrain.appendHistory(nodeID);
	},

	appendNode: function(selection) {
		selection
			.attr("class", "node")
			.attr("id", function(d) { return "node_"+d; })
			.attr("transform", function(d) {
				var node = layout_thebrain.getNode(d);
				if (node.class === "actual") {
					node.x0 = layout_thebrain.datasetTmp.placeholderx;
					node.y0 = layout_thebrain.datasetTmp.placeholdery;
				} else if (node.class === "child") {
					node.x0 = layout_thebrain.datasetTmp.x + layout_thebrain.datasetTmp.w/2;
					node.y0 = layout_thebrain.datasetTmp.y + layout_thebrain.datasetTmp.h;
				} else if (node.class === "parent") {
					node.x0 = layout_thebrain.datasetTmp.x + layout_thebrain.datasetTmp.w/2;
					node.y0 = layout_thebrain.datasetTmp.y;
				} else if (node.class === "sibling") {
					node.x0 = layout_thebrain.datasetTmp.x + layout_thebrain.datasetTmp.w;
					node.y0 = layout_thebrain.datasetTmp.y;
				} else if (node.class === "friend") {
					node.x0 = layout_thebrain.datasetTmp.x;
					node.y0 = layout_thebrain.datasetTmp.y;
				} else {
					node.x0 = layout_thebrain.datasetTmp.x;
					node.y0 = layout_thebrain.datasetTmp.y - nodeHeight/2;
				}
				layout_thebrain.setNode(d,node);
				return "translate(" + node.x0 + "," + node.y0 + ")"; })
			.style("opacity", 0)
			.on("mouseenter", layout_thebrain.eventMouseenterNode)
			.on("mouseleave", layout_thebrain.eventMouseleaveNode)
			.on("click", function(d) {
				log.DEBUG(`eventClickNode(${d})`);
				layout_thebrain.drawVisibles(d);
			})
		;
			var tmpRect = selection.append("rect");
			var tmpText = selection.append("text")
				.attr("class", "text")
				.attr("style", "fill: black; stroke-width: 0")
				.text(function(d) { return dataset.getNode(d).text; })
				.style("text-anchor", "middle")
				.style("alignment-baseline", "central")
			;
			/*var tmpText = selection.append("foreignObject")
				.attr("width", "100%")
				.attr("height", "100%")
				.style("text-align", "left")
				.append("xhtml:div")
					.attr("class", "text")
					.attr("contenteditable", "true")
					.text(function(d) { return dataset.getNode(d).text; })
					.attr("width", "auto")
					.style("text-anchor", "middle")
					.style("alignment-baseline", "central")
			;*/
			tmpRect
				.attr("class", "rectangle")
				.attr("x", function(d) {return this.parentNode.getBBox().x - margo; })
				.attr("y", function(d) {return this.parentNode.getBBox().y - margo; })
				.attr("width", function(d) {
					return layout_thebrain.datasetTmp.nodes[`ID${d}`].width = margo + this.parentNode.getBBox().width + margo;
				})
				.attr("height", function(d) {
					return layout_thebrain.datasetTmp.nodes[`ID${d}`].height = margo + this.parentNode.getBBox().height + margo;
				})
				.attr("rx", 7)
				.attr("ry", 7)
				.style("fill", function(d) {
					var node = layout_thebrain.getNode(d);
					return layout_thebrain.dataset.preferences.node[node.class+"Color"];
				})
				.style("fill-opacity", function(d) {
					var node = layout_thebrain.getNode(d);
					return layout_thebrain.dataset.preferences.node[node.class+"Opacity"];
				})
				.style("stroke", "#666")
				.style("stroke-width", "1")
			;
			selection.append("circle")
				.attr("class", "child")
				.attr("r", margo)
				.attr("cx", 2*margo)
				.attr("cy", function(d) {return layout_thebrain.datasetTmp.nodes[`ID${d}`].height/2;})
				.style("fill", "#f00")
				.style("stroke-width", 2)
				.style("display", function(d) {
					return dataset.hasChildLinks(d) ? "inline" : "none";
				})
				.call(d3.drag()
					.on("start", layout_thebrain.eventDragStartCircle)
					.on("drag", layout_thebrain.eventDragDragCircle)
					.on("end", layout_thebrain.eventDragEndCircle))
			;
			selection.append("circle")
				.attr("class", "parent")
				.attr("r", margo)
				.attr("cx", -2*margo)
				.attr("cy", function(d) {return -layout_thebrain.datasetTmp.nodes[`ID${d}`].height/2;})
				.style("fill", "#0f0")
				.style("stroke-width", 2)
				.style("display", function(d) {
					return dataset.hasParentLinks(d) ? "inline" : "none";
				})
				.call(d3.drag()
					.on("start", layout_thebrain.eventDragStartCircle)
					.on("drag", layout_thebrain.eventDragDragCircle)
					.on("end", layout_thebrain.eventDragEndCircle))
			;
			selection.append("circle")
				.attr("class", "friend")
				.attr("r", margo)
				.attr("cx", function(d) {return -layout_thebrain.datasetTmp.nodes[`ID${d}`].width/2;})
				.attr("cy", 0)
				.style("fill", "#00f")
				.style("stroke-width", 2)
				.style("display", function(d) {
					return dataset.hasFriendLinks(d) ? "inline" : "none";
				})
				.call(d3.drag()
					.on("start", layout_thebrain.eventDragStartCircle)
					.on("drag", layout_thebrain.eventDragDragCircle)
					.on("end", layout_thebrain.eventDragEndCircle))
			;
	},

	findVisibles: function(nodeID) {
		var newNodesDataVisible = [];
		var newLinksDataVisible = [];
		var newNodesDataVisibleFriends = [];
		var newNodesDataVisibleParents = [];
		var newNodesDataVisibleSiblings = [];
		var newNodesDataVisibleActual = null;
		var newNodesDataVisibleChildren = [];
		
		var childLinks, childNodeID, parentLinks, parentNodeID, friendLinks, friendNodeID;
		var allLinks, fromNodeID, toNodeID;
		var link, linkID;

		// Clear the old class values of visible nodes
			for (var i = 0; i < layout_thebrain.datasetTmp.visibles.nodes.length; i++) {
				var nodeIndex = layout_thebrain.datasetTmp.visibles.nodes[i];
				layout_thebrain.datasetTmp.nodes[`ID${nodeIndex}`].class = "";
			}

		// The ACTUAL itself
			// Itt még nem lehet ismétlődés
			if (!layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]) {
				layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = {};
			}
			layout_thebrain.datasetTmp.nodes[`ID${nodeID}`].class = "actual";
			newNodesDataVisible.push(nodeID);
			newNodesDataVisibleActual = nodeID;

		// The CHILD nodes
			childLinks = dataset.getChildLinks(nodeID);
			for (var i in childLinks) {
				childNodeID = childLinks[i].toID;

				if (newNodesDataVisible.indexOf(childNodeID) < 0) {
					if (!layout_thebrain.datasetTmp.nodes[`ID${childNodeID}`]) {
						layout_thebrain.datasetTmp.nodes[`ID${childNodeID}`] = {};
					}
					layout_thebrain.datasetTmp.nodes[`ID${childNodeID}`].class = "child";
					newNodesDataVisible.push(childNodeID);
					newNodesDataVisibleChildren.push(childNodeID);
				};
			};

		// The PARENT nodes
			parentLinks = dataset.getParentLinks(nodeID);
			for (var i in parentLinks) {
				parentNodeID = parentLinks[i].toID;

				if (newNodesDataVisible.indexOf(parentNodeID) < 0) {
					if (!layout_thebrain.datasetTmp.nodes[`ID${parentNodeID}`]) {
						layout_thebrain.datasetTmp.nodes[`ID${parentNodeID}`] = {};
					}
					layout_thebrain.datasetTmp.nodes[`ID${parentNodeID}`].class = "parent";
					newNodesDataVisible.push(parentNodeID);
					newNodesDataVisibleParents.push(parentNodeID);
				};
			};

		// The SIBLING nodes
			// parentLinks = previous dataset.getParentLinks(nodeID);
			for (var i in parentLinks) {
				parentNodeID = parentLinks[i].toID;
				childLinks = dataset.getChildLinks(parentNodeID);
				for (var j in childLinks) {
					childNodeID = childLinks[j].toID;

					if (newNodesDataVisible.indexOf(childNodeID) < 0) {
						if (!layout_thebrain.datasetTmp.nodes[`ID${childNodeID}`]) {
							layout_thebrain.datasetTmp.nodes[`ID${childNodeID}`] = {};
						}
						layout_thebrain.datasetTmp.nodes[`ID${childNodeID}`].class = "sibling";
						newNodesDataVisible.push(childNodeID);
						newNodesDataVisibleSiblings.push(childNodeID);
					};
				};
			};

		// The FRIEND nodes
			friendLinks = dataset.getFriendLinks(nodeID);
			for (var i in friendLinks) {
				friendNodeID = friendLinks[i].toID;

				if (newNodesDataVisible.indexOf(friendNodeID) < 0) {
					if (!layout_thebrain.datasetTmp.nodes[`ID${friendNodeID}`]) {
						layout_thebrain.datasetTmp.nodes[`ID${friendNodeID}`] = {};
					}
					layout_thebrain.datasetTmp.nodes[`ID${friendNodeID}`].class = "friend";
					newNodesDataVisible.push(friendNodeID);
					newNodesDataVisibleFriends.push(friendNodeID);
				};
			};

		// Search for visible links
			for (var i in newNodesDataVisible) {
				fromNodeID = newNodesDataVisible[i];
				allLinks = dataset.getLinks(fromNodeID);

				for (var j in allLinks) {
					toNodeID = allLinks[j].toID;

					if (newNodesDataVisible.indexOf(toNodeID) >= 0) {
						var type = allLinks[j].type;
						//log.DEBUG(`fromNodeID(${fromNodeID}), toNodeID(${toNodeID}), type(${type})`);
						if (fromNodeID <= toNodeID) {
							linkID = "source:"+fromNodeID+"-target:"+toNodeID;
							link = { id: linkID, source: fromNodeID, target: toNodeID, type: type};
						} else {
							linkID = "source:"+toNodeID+"-target:"+fromNodeID;
							if (type === "parent") {
								type = "child";
							} else if (type === "child") {
								type = "parent";
							};
							link = { id: linkID, source: toNodeID, target: fromNodeID, type: type};
						};
						if (newLinksDataVisible.findIndex( function(element) {
								return ((element.id === linkID) && (element.type === type))
							}) === -1)
						{
							newLinksDataVisible.push(link);
						}
					};
				};
			};

		return {nodes: newNodesDataVisible, friends: newNodesDataVisibleFriends, parents: newNodesDataVisibleParents, siblings: newNodesDataVisibleSiblings, actual: newNodesDataVisibleActual, children: newNodesDataVisibleChildren, links: newLinksDataVisible};
	},

	setCirclesDisplay(nodeSelection, mode) {
		nodeSelection.select(".child")
			.style("display", function() {
				return mode === "showAll" ? "inline" : (dataset.hasChildLinks(nodeSelection.data()) ? "inline" : "none");
			});
		nodeSelection.select(".parent")
			.style("display", function() {
				return mode === "showAll" ? "inline" : (dataset.hasParentLinks(nodeSelection.data()) ? "inline" : "none");
			});
		nodeSelection.select(".friend")
			.style("display", function() {
				return mode === "showAll" ? "inline" : (dataset.hasFriendLinks(nodeSelection.data()) ? "inline" : "none");
			});
	},


	addChild: function() {
		layout_thebrain.datasetTmp.viewMode = "insert";
		layout_thebrain.datasetTmp.newNode.sourceNodeID = layout_thebrain.dataset.selectedNodeID;
		layout_thebrain.datasetTmp.newNode.sourceClass = "node";
		layout_thebrain.datasetTmp.newNode.targetNodeID = -1;
		layout_thebrain.datasetTmp.newNode.targetClass = null;
		layout_thebrain.datasetTmp.newNode.linkType = "child"
		$("#search").select2("open");
	},

	addParent: function() {
		layout_thebrain.datasetTmp.viewMode = "insert";
		layout_thebrain.datasetTmp.newNode.sourceNodeID = layout_thebrain.dataset.selectedNodeID;
		layout_thebrain.datasetTmp.newNode.sourceClass = "node";
		layout_thebrain.datasetTmp.newNode.targetNodeID = -1;
		layout_thebrain.datasetTmp.newNode.targetClass = null;
		layout_thebrain.datasetTmp.newNode.linkType = "parent"
		$("#search").select2("open");
	},

	addFriend: function() {
		layout_thebrain.datasetTmp.viewMode = "insert";
		layout_thebrain.datasetTmp.newNode.sourceNodeID = layout_thebrain.dataset.selectedNodeID;
		layout_thebrain.datasetTmp.newNode.sourceClass = "node";
		layout_thebrain.datasetTmp.newNode.targetNodeID = -1;
		layout_thebrain.datasetTmp.newNode.targetClass = null;
		layout_thebrain.datasetTmp.newNode.linkType = "friend"
		$("#search").select2("open");
	},

	deleteNode: function(nodeID) {
		// ToDo: Tovább bővíteni:
		//    - ha van gyereke, barátja, ...
		if (dataset.hasParentLinks(layout_thebrain.dataset.selectedNodeID)) {
			var links = dataset.getParentLinks(layout_thebrain.dataset.selectedNodeID);

			dataset.deleteNode(layout_thebrain.dataset.selectedNodeID);

			layout_thebrain.drawVisibles(links[0].toID);
		};
	},


	eventKeydownBody: function() {
		//log.DEBUG(`d3.event.key(${d3.event.key})`);
		switch (d3.event.key) {
			case "ArrowDown":
				if (d3.event.ctrlKey) {
					log.DEBUG("CTRL+ArrowDown");
					layout_thebrain.addChild();
				} else {
					log.DEBUG("ArrowDown");
				};
				break;
			case "Insert":
				log.DEBUG(`d3.event.key(${d3.event.key})`)
				layout_thebrain.addChild();
				break;
			case "ArrowUp":
				if (d3.event.ctrlKey) {
					log.DEBUG("CTRL+ArrowUp");
					layout_thebrain.addParent();
				} else {
					log.DEBUG("ArrowUp");
				};
				break;
			case "ArrowLeft":
				if (d3.event.ctrlKey) {
					log.DEBUG("CTRL+ArrowLeft");
					layout_thebrain.addFriend();
				} else {
					log.DEBUG("ArrowLeft");
				};
				break;
			case "s":
				if (d3.event.ctrlKey) {
					// ToDo: Ezeket a globális shortcut-okat ki kell majd tanni a
					//    myinfo.js-be, ez ugyanis a program főmenüjéhez tartozik.
					log.DEBUG("CTRL+s");
					d3.event.preventDefault();
					var dataToBeSaved = dataset.getDatasetJson();

					// ToDo: Majd általánosítani kell, h a localhost és az URL 
					//    ne legyen beégetve. A beolvasásnál használt link alapján
					//    kell majd kezelni.
					$.ajax( {
						url: "http://localhost:3000/rest/dataset/save",
						type: "POST",
						data: JSON.stringify(dataToBeSaved),
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function( response ) {
							log.DEBUG('response('+response+')');
						}
					} );
				} else {
					log.DEBUG("s");
				};
				break;
			case "Delete":
				log.DEBUG("Delete");

				layout_thebrain.deleteNode(layout_thebrain.dataset.selectedNodeID)
				break;
			default:
				log.DEBUG(d3.event.key);
		};
	},



	eventMouseenterNode: function(nodeID) {
		log.DEBUG(`eventMouseenterNode(${nodeID},${d3.select(this).attr("class")})`);
		d3.selectAll(`#node_${nodeID}`).select(".rectangle")
			.style("stroke-width", 3)
		;
		layout_thebrain.setCirclesDisplay(d3.select(this), "showAll");

		if (layout_thebrain.datasetTmp.viewMode === "insert") {
			if (layout_thebrain.datasetTmp.newNode.sourceNodeID !== nodeID) {
				layout_thebrain.datasetTmp.newNode.targetNodeID = nodeID;
				layout_thebrain.datasetTmp.newNode.targetClass = d3.select(this).attr("class");
		} else {
				layout_thebrain.datasetTmp.newNode.targetNodeID = null;
				layout_thebrain.datasetTmp.newNode.targetClass = null;
			};
		} else {
			layout_thebrain.datasetTmp.newNode.sourceNodeID = nodeID;
			layout_thebrain.datasetTmp.newNode.sourceClass = d3.select(this).attr("class");
			layout_thebrain.datasetTmp.newNode.targetNodeID = null;
			layout_thebrain.datasetTmp.newNode.targetClass = null;
		};
	},

	eventMouseleaveNode: function(nodeID) {
		//log.DEBUG(`eventMouseleaveNode(${nodeID})`);
		d3.selectAll(`#node_${nodeID}`).select(".rectangle")
			.style("stroke-width", 1)
		;
		if (layout_thebrain.datasetTmp.viewMode === "normal") {
			layout_thebrain.setCirclesDisplay(d3.select(this), "showHasLinks");
			layout_thebrain.datasetTmp.newNode.sourceNodeID = null;
			layout_thebrain.datasetTmp.newNode.sourceClass = null;
			layout_thebrain.datasetTmp.newNode.targetNodeID = null;
			layout_thebrain.datasetTmp.newNode.targetClass = null;
		} else if (layout_thebrain.datasetTmp.viewMode === "insert") {
			if (layout_thebrain.datasetTmp.newNode.sourceNodeID !== nodeID) {
				layout_thebrain.setCirclesDisplay(d3.select(this), "showHasLinks");
			};
			layout_thebrain.datasetTmp.newNode.targetNodeID = -1;
			layout_thebrain.datasetTmp.newNode.targetClass = null;
		};
	},



	eventDragStartCircle: function(nodeID) {
		log.DEBUG(`eventDragStartCircle(${nodeID},${d3.select(this).attr("class")})`);

		layout_thebrain.datasetTmp.viewMode = "insert";
		layout_thebrain.datasetTmp.newNode.linkType = d3.select(this).attr("class");
	},

	eventDragDragCircle: function(nodeID) {
		//log.DEBUG(`eventDragDragCircle.target(${d3.select(this).attr("class")})`);
		var dragcircle = d3.select("#dragcircle");
		var dragpath = d3.select("#dragpath");

		var node = layout_thebrain.getNode(nodeID);
		var sourceClass = layout_thebrain.datasetTmp.newNode.sourceClass;
		var targetClass = layout_thebrain.datasetTmp.newNode.targetClass;

		if ((Math.abs(d3.event.x) > node.width/2) || (Math.abs(d3.event.y) > node.height/2)) {
			// Kiléptünk a nodeból --> valós dragging
			if (!dragcircle.empty()) {
				if ((layout_thebrain.datasetTmp.newNode.targetNodeID === -1) || (layout_thebrain.datasetTmp.newNode.targetNodeID === null)) {
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
									layout_thebrain.datasetTmp.newNode.linkType
								);
							} else if (sourceClass === "nodeHistory") {
								return calcPathWithDirs(
									node.xHistory, node.yHistory, node.width, node.height,
									node.xHistory + d3.event.x, node.yHistory + d3.event.y, 0, 0,
									layout_thebrain.datasetTmp.newNode.linkType
								);
							};
						})
					;
				} else {
					var targetNode = layout_thebrain.getNode(layout_thebrain.datasetTmp.newNode.targetNodeID);
					dragcircle
						.style("opacity", 0)
					;
					dragpath
						.attr("d", function() {
							if (sourceClass === "node") {
								if (targetClass === "node") {
									return calcPathWithDirs(
										node.x, node.y, node.width, node.height,
										targetNode.x, targetNode.y, targetNode.width, targetNode.height,
										layout_thebrain.datasetTmp.newNode.linkType
									);
								} else if (targetClass === "nodeHistory") {
									return calcPathWithDirs(
										node.x, node.y, node.width, node.height,
										targetNode.xHistory, targetNode.yHistory, targetNode.width, targetNode.height,
										layout_thebrain.datasetTmp.newNode.linkType
									);
								};
							} else if (sourceClass === "nodeHistory") {
								if (targetClass === "node") {
									return calcPathWithDirs(
										node.xHistory, node.yHistory, node.width, node.height,
										targetNode.x, targetNode.y, targetNode.width, targetNode.height,
										layout_thebrain.datasetTmp.newNode.linkType
									);
								} else if (targetClass === "nodeHistory") {
									return calcPathWithDirs(
										node.xHistory, node.yHistory, node.width, node.height,
										targetNode.xHistory, targetNode.yHistory, targetNode.width, targetNode.height,
										layout_thebrain.datasetTmp.newNode.linkType
									);
								};
							};
						})
					;
				};
			} else {
				dragcircle = svgNodes.append("circle")
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
						if (layout_thebrain.datasetTmp.newNode.linkType === "child") {
							return "#0f0";
						} else if (layout_thebrain.datasetTmp.newNode.linkType === "parent") {
							return "#f00";
						} else if (layout_thebrain.datasetTmp.newNode.linkType === "friend") {
							return "#00f";
						};
					})
				;

				svgNodes.append("path")
					.attr("id", "dragpath")
					.style("fill", "none")
					.style("pointer-events", "none") // For the event bubbling to work correctly.
					.attr("d", function() {
						if (sourceClass === "node") {
							return calcPathWithDirs(
								node.x, node.y, node.width, node.height,
								node.x + d3.event.x, node.y + d3.event.y, 0, 0,
								layout_thebrain.datasetTmp.newNode.linkType
							);
						} else if (sourceClass === "nodeHistory") {
							return calcPathWithDirs(
								node.xHistory, node.yHistory, node.width, node.height,
								node.xHistory + d3.event.x, node.yHistory + d3.event.y, 0, 0,
								layout_thebrain.datasetTmp.newNode.linkType
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
	},

	eventDragEndCircle: function(nodeID) {
		//log.DEBUG(`eventDragEndCircle(${layout_thebrain.datasetTmp.newNode.sourceNodeID}, ${layout_thebrain.datasetTmp.newNode.targetNodeID}, ${layout_thebrain.datasetTmp.newNode.linkType})`);
		if (layout_thebrain.datasetTmp.newNode.targetNodeID !== null) {
			if (layout_thebrain.datasetTmp.newNode.targetNodeID === -1) {
				$("#search").select2("open");
			} else {
				dataset.addLink(layout_thebrain.datasetTmp.newNode.sourceNodeID, layout_thebrain.datasetTmp.newNode.targetNodeID, layout_thebrain.datasetTmp.newNode.linkType);
				d3.select("#dragcircle").remove();
				d3.select("#dragpath").remove();
				layout_thebrain.datasetTmp.viewMode = "normal";
				layout_thebrain.drawVisibles(layout_thebrain.datasetTmp.newNode.sourceNodeID);
			};
		} else {
			layout_thebrain.datasetTmp.viewMode = "normal";
		};
	},



	getNode: function(nodeID) {

		return (layout_thebrain.datasetTmp.nodes[`ID${nodeID}`]);
	},

	setNode: function(nodeID, nodeData) {
		
		layout_thebrain.datasetTmp.nodes[`ID${nodeID}`] = nodeData;
	},



	appendHistory: function(nodeID) {
		var index = layout_thebrain.datasetTmp.history.indexOf(nodeID);
		if (index > -1) {
			layout_thebrain.datasetTmp.history.splice(index,1);
		};
		layout_thebrain.datasetTmp.history.unshift(nodeID);

		var remainingWidth = layout_thebrain.datasetTmp.w;
		var padding = 30;
		var terminate = false;

		for (var i=1; ((!terminate)&&(i<layout_thebrain.datasetTmp.history.length)); i++) {
			if ((!terminate) && (remainingWidth >=  layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.datasetTmp.history[i]}`].width + padding)) {
				layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.datasetTmp.history[i]}`].xHistory = remainingWidth - (layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.datasetTmp.history[i]}`].width + padding) / 2;
				layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.datasetTmp.history[i]}`].yHistory = layout_thebrain.datasetTmp.h - nodeHeight/2;
				remainingWidth -= layout_thebrain.datasetTmp.nodes[`ID${layout_thebrain.datasetTmp.history[i]}`].width + padding;
			} else {
				terminate = true;
				layout_thebrain.datasetTmp.history = layout_thebrain.datasetTmp.history.slice(0,i);
			};
		};
		log.DEBUG(`history(${JSON.stringify(layout_thebrain.datasetTmp.history)})`);
		var tmpNodes = svgHistory.selectAll("g")
			.data(layout_thebrain.datasetTmp.history.slice(1,layout_thebrain.datasetTmp.history.length) , function(d) {return d; })
		;
		// MODIFY history nodes
			tmpNodes.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
				.attr("transform", function(d) {return `translate(${layout_thebrain.datasetTmp.nodes[`ID${d}`].xHistory}, ${layout_thebrain.datasetTmp.h - nodeHeight/2})`; })
				.select(".rectangle")
					.style("fill-opacity", function(d) {
						var node = layout_thebrain.getNode(d);
						//ToDo: Itt valami hiba van. Ha a friendNode-ra eltérő fill-opacity-t állítok, akkor a módosításkor elrontja.
						//log.DEBUG(`d(${d}) ${node.class}Opacity(${layout_thebrain.dataset.preferences.node[node.class+"Opacity"]})`);
						return layout_thebrain.dataset.preferences.node[node.class+"Opacity"];
					})
			;
			tmpNodes.select(".rectangle").transition().duration(layout_thebrain.dataset.preferences.animationDuration)
				.style("fill", function(d) {
					var node = layout_thebrain.getNode(d);
					//og(DEBUG, `d(${d}) ${node.class}Color(${layout_thebrain.dataset.preferences.node[node.class+"Color"]})`);
					return layout_thebrain.dataset.preferences.node[node.class+"Color"];
				})
			;
			tmpNodes.select(".child")
				.style("display", function(d) {
					return dataset.hasChildLinks(d) ? "inline" : "none";
				})
			;
			tmpNodes.select(".parent")
				.style("display", function(d) {
					return dataset.hasParentLinks(d) ? "inline" : "none";
				})
			;
			tmpNodes.select(".friend")
				.style("display", function(d) {
					return dataset.hasFriendLinks(d) ? "inline" : "none";
				})
			;

		// APPEND nodes
			var tmpTmpNodes = tmpNodes.enter().append("g")
				.call(layout_thebrain.appendNode)
				.attr("class", "nodeHistory")
				.transition().duration(layout_thebrain.dataset.preferences.animationDuration)
					.style("opacity", 1)
					.attr("transform", function(d) {return `translate(${layout_thebrain.datasetTmp.nodes[`ID${d}`].xHistory}, ${layout_thebrain.datasetTmp.nodes[`ID${d}`].yHistory})`; })
			;

		// REMOVE nodes
			tmpNodes.exit().remove();
	}

};


// A modul regisztrálása
log(INFO, "layout_thebrain registering moduleFunctions");
config.setLayoutModuleFunctions("layout_thebrain", layout_thebrain.initLayout, layout_thebrain.refreshLayout, layout_thebrain.resizeLayout, layout_thebrain.destroyLayout);

// --- o --- --- o --- --- o --- --- o --- --- o --- --- o --- --- o --- --- o --- 

// Creates a curved (diagonal) path from parent to the child node or between friend nodes
function calcPathWithDirs(sx, sy, sw, sh, tx, ty, tw, th, type) {
	// arány a:b
	var a = 1, b = 2;
	var minBezDist = 60;
	var sourcePoint, c1Point, c2Point, targetPoint;

	if (type === "friend") {
		if (sx <= tx) {
			sx = sx + sw / 2;
			tx = tx - tw / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${sx + Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${sy} `;
			c2Point = `${tx - Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${ty} `;
			targetPoint = `${tx},${ty}`;
		} else {
			sx = sx - sw / 2;
			tx = tx + tw / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${sx - Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${sy} `;
			c2Point = `${tx + Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${ty} `;
			targetPoint = `${tx},${ty}`;
		};
	} else {
		if (type === "parent") {
			sx = sx - 2*margo;
			if (tw > 0)	{
				tx = tx + 2*margo;
			};
			sy = sy - sh / 2;
			ty = ty + th / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${(sx)},${sy - Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			c2Point = `${tx},${ty + Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			targetPoint = `${tx},${ty}`;
		} else if (type === "child") {
			sx = sx + 2*margo;
			if (tw > 0)	{
				tx = tx - 2*margo;
			};
			sy = sy + sh / 2;
			ty = ty - th / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${(sx)},${sy + Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			c2Point = `${tx},${ty - Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			targetPoint = `${tx},${ty}`;
		};
	};

	return (sourcePoint+c1Point+c2Point+targetPoint);
};





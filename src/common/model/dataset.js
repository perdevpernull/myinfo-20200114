import {log} from "../util/log";
var undefined;


class Dataset {
	constructor(jsonData) {
		if (jsonData === undefined) {
			this._data = {
				nextNodeID: 2,
				nodes: {
					ID0: {
						ID: 0,
						text: "Root node",
						links: [
							{toID: 1, type: "child", tags: [], deleted: false}
						],
						tags: [],
						deleted: false
					},
					ID1: {
						ID: 1,
						text: "Child node",
						links: [
							{toID: 0, type: "parent", tags: [], deleted: false}
						],
						tags: [],
						deleted: false
					}
				},
				tags: {},
				rootNodes: {
					ID0: 0
				},
				pluginData: {}
			}
		} else {
			this._data = jsonData;
		};
	};

	getJsonData() {

		return JSON.stringify(this._data);
	};

	addNode(text) {
		var nodeID = this._data.nextNodeID;
		this._data.nextNodeID = this._data.nextNodeID + 1;
		this._data.nodes[`ID${nodeID}`] = 
			{	ID: nodeID,
				text: text,
				links: [],
				tags: [],
				deleted: false
			};

		this._data.rootNodes[`ID${nodeID}`] = nodeID;

		return nodeID;
	};

	addChildNode(nodeID, text) {
		var childNodeID = this.addNode(text);
		this.addChildLink(nodeID, childNodeID);

		return childNodeID;
	};

	addParentNode(nodeID, text) {
		var parentNodeID = this.addNode(text);
		this.addParentLink(nodeID, parentNodeID);

		return parentNodeID;
	};

	addFriendNode(nodeID, text) {
		var friendNodeID = this.addNode(text);
		this.addFriendLink(nodeID, friendNodeID);

		return friendNodeID;
	};

	getRootNodeIDs() {

		return this._data.rootNodes;
	};

	findOrphanNodeIDs() {
		var possibleOrphanNodes = {};
		var orphanNodeKeys = {};
		var orphanNodeIDs = [];
		var ID;
		var childLinkIDs;
		var childLinks;
		var rootOrHasParentNodes;
		var keys;

		for (var key in this._data.nodes) {
			ID = this._data.nodes[key].ID;
			if (!this.isDeleted(ID)) {
				childLinks = this.getChildLinks(ID);
				childLinkIDs = [];
				for (var i in childLinks) {
					childLinkIDs.push(childLinks[i].toID);
				};
				possibleOrphanNodes[key] = {ID: ID, childLinkIDs: childLinkIDs};
			};
		};

		rootOrHasParentNodes = [];
		for (var key in this._data.rootNodes) {
			rootOrHasParentNodes.push(this._data.rootNodes[key]);
		};

		while (rootOrHasParentNodes.length > 0) {
			ID = rootOrHasParentNodes[0];
			if (possibleOrphanNodes[`ID${ID}`]) {
				for (var i in possibleOrphanNodes[`ID${ID}`].childLinkIDs) {
					rootOrHasParentNodes.push(possibleOrphanNodes[`ID${ID}`].childLinkIDs[i]);
				};
				delete possibleOrphanNodes[`ID${ID}`];
			};
			rootOrHasParentNodes.splice(0,1);
		};

		keys = Object.keys(possibleOrphanNodes);
		while (keys.length > 0) {
			ID = possibleOrphanNodes[keys[0]].ID;
			orphanNodeKeys[`ID${ID}`] = ID;

			rootOrHasParentNodes = [];
			for (var i in possibleOrphanNodes[keys[0]].childLinkIDs) {
				rootOrHasParentNodes.push(possibleOrphanNodes[keys[0]].childLinkIDs[i]);
			};
			delete possibleOrphanNodes[keys[0]];

			while (rootOrHasParentNodes.length > 0) {
				ID = rootOrHasParentNodes[0];
				if (possibleOrphanNodes[`ID${ID}`]) {
					for (var i in possibleOrphanNodes[`ID${ID}`].childLinkIDs) {
						rootOrHasParentNodes.push(possibleOrphanNodes[`ID${ID}`].childLinkIDs[i]);
					};
					delete possibleOrphanNodes[`ID${ID}`];
				};
				rootOrHasParentNodes.splice(0,1);
			};
			keys = Object.keys(possibleOrphanNodes);
		};

		for (key in orphanNodeKeys) {
			orphanNodeIDs.push(this._data.nodes[key].ID);
		}
		return orphanNodeIDs;
	}

	deleteNode(nodeID) {
		var toID;
		var type;
		var typePair;
		var linkIndex;

		if (this._data.nodes[`ID${nodeID}`].deleted) {
			return false;
		} else {
			this._data.nodes[`ID${nodeID}`].deleted = true;

			for (var i in this._data.nodes[`ID${nodeID}`].links) {
				if (!this._data.nodes[`ID${nodeID}`].links[i].deleted) {
					this._data.nodes[`ID${nodeID}`].links[i].deleted = true;

					toID = this._data.nodes[`ID${nodeID}`].links[i].toID;
					type = this._data.nodes[`ID${nodeID}`].links[i].type;
					typePair = (type === "child") ? "parent" : ((type === "parent") ? "child" : type);

					linkIndex = this._data.nodes[`ID${toID}`].links.findIndex( function(link) {
						return ((link.toID === nodeID) && (link.type === typePair));
					});
					this._data.nodes[`ID${toID}`].links[linkIndex].deleted = true;

					if (type === "child") {
						if (!this.hasParentLinks(toID)) {
							this._data.rootNodes[`ID${toID}`] = toID;
						};
					};
				};
			};

			delete this._data.rootNodes[`ID${nodeID}`];

			return true;
		};
	};

	undeleteNode(nodeID) {
		var toID;
		var type;
		var typePair;
		var linkIndex;

		if (this._data.nodes[`ID${nodeID}`].deleted) {
			this._data.nodes[`ID${nodeID}`].deleted = false;

			for (var i in this._data.nodes[`ID${nodeID}`].links) {
				toID = this._data.nodes[`ID${nodeID}`].links[i].toID;
				if (!this.isDeleted(toID)) {
					this._data.nodes[`ID${nodeID}`].links[i].deleted = false;

					type = this._data.nodes[`ID${nodeID}`].links[i].type;
					typePair = (type === "child") ? "parent" : ((type === "parent") ? "child" : type);

					linkIndex = this._data.nodes[`ID${toID}`].links.findIndex( function(link) {
						return ((link.toID === nodeID) && (link.type === typePair));
					});
					this._data.nodes[`ID${toID}`].links[linkIndex].deleted = false;

					if (typePair === "parent") {
						delete this._data.rootNodes[`ID${toID}`];
					};
				};
			};

			if (!this.hasParentLinks(nodeID)) {
				this._data.rootNodes[`ID${nodeID}`] = nodeID;
			};

			return true;
		} else {
			return false;
		};
	};

	purgeNode(nodeID) {
		var toID;
		var type;

		if (this._data.nodes[`ID${nodeID}`].deleted) {
			for (var i in this._data.nodes[`ID${nodeID}`].links) {
				toID = this._data.nodes[`ID${nodeID}`].links[i].toID;
				type = this._data.nodes[`ID${nodeID}`].links[i].type;
				this.purgeLink(nodeID, toID, type);
			};

			delete this._data.nodes[`ID${nodeID}`];

			return true;
		} else {
			// Only deleted nodes can be purged.
			return false;
		};
	};

	isLinked(nodeID1, nodeID2, type) { // Törölt státuszúakat is vizsgálja.
		return (this._data.nodes[`ID${nodeID1}`].links.findIndex( function(link) {
				return ((link.toID === nodeID2) && (link.type === type));
			}) > -1);
	};

	addChildLink(parentNodeID, childNodeID) {
		var deleted = (this._data.nodes[`ID${parentNodeID}`].deleted || this._data.nodes[`ID${childNodeID}`].deleted);

		delete this._data.rootNodes[`ID${childNodeID}`];

		if (this.isLinked(parentNodeID, childNodeID, "child")) {
			return false;
		} else {
			this._data.nodes[`ID${parentNodeID}`].links.push(
				{toID: childNodeID, type: "child", tags: [], deleted: deleted}
			);
			this._data.nodes[`ID${childNodeID}`].links.push(
				{toID: parentNodeID, type: "parent", tags: [], deleted: deleted}
			);

			return true;
		};
	};

	addParentLink(childNodeID, parentNodeID) {
		if (this.isLinked(parentNodeID, childNodeID, "parent")) {
			return false;
		} else {
			this.addChildLink(parentNodeID, childNodeID);

			return true;
		};
	};

	addFriendLink(nodeID1, nodeID2) {
		var deleted = (this._data.nodes[`ID${nodeID1}`].deleted || this._data.nodes[`ID${nodeID2}`].deleted);

		if (this.isLinked(nodeID1, nodeID2, "friend")) {
			return false;
		} else {
			this._data.nodes[`ID${nodeID1}`].links.push(
				{toID: nodeID2, type: "friend", tags: [], deleted: deleted}
			);
			this._data.nodes[`ID${nodeID2}`].links.push(
				{toID: nodeID1, type: "friend", tags: [], deleted: deleted}
			);

			return true;
		};
	};

	addLink(nodeID1, nodeID2, type) {
		switch (type) {
			case "child":
				return this.addChildLink(nodeID1, nodeID2);
				break;
			case "parent":
				return this.addParentLink(nodeID1, nodeID2);
				break;
			case "friend":
				return this.addFriendLink(nodeID1, nodeID2);
				break;
			default:
				return false;
		};
	};

	purgeLink(nodeID1, nodeID2, type) { // Törölt státuszút is lehet véglegesen törölni.
		var linkIndex;
		var typePair = (type === "child") ? "parent" : ((type === "parent") ? "child" : type);

		if (this.isLinked(nodeID1, nodeID2, type)) {
			linkIndex = this._data.nodes[`ID${nodeID1}`].links.findIndex( function(link) {
				return ((link.toID === nodeID2) && (link.type === type));
			});
			this._data.nodes[`ID${nodeID1}`].links.splice(linkIndex, 1);

			linkIndex = this._data.nodes[`ID${nodeID2}`].links.findIndex( function(link) {
				return ((link.toID === nodeID1) && (link.type === typePair));
			});
			this._data.nodes[`ID${nodeID2}`].links.splice(linkIndex, 1);

			switch (type) {
				case "child":
					if (!this.hasParentLinks(nodeID2)) {
						this._data.rootNodes[`ID${nodeID2}`] = nodeID2;
					};
					break;
				case "parent":
					if (!this.hasParentLinks(nodeID1)) {
						this._data.rootNodes[`ID${nodeID1}`] = nodeID1;
					};
					break;
			};

			return true;
		} else {
			return false;
		};
	};

	isDeleted(nodeID) {
		if (this._data.nodes[`ID${nodeID}`].deleted) {
			return true;
		} else {
			return false;
		};
	};

	isTagExists(tag) {
		if (this._data.tags[tag]) {
			return true;
		} else {
			return false;
		}
	};

	isNodeTagged(nodeID, tag) {
		return (this._data.nodes[`ID${nodeID}`].tags.findIndex( function(elmement) {
				return (element === tag);
			}) > -1);
	};

	addNodeTag(nodeID, tag) {
		if (!this.isTagExists(tag)) {
			this._data.tags[tag] = tag;
		};

		if (this.isNodeTagged(nodeID, tag)) {
			return false;
		} else {
			this._data.nodes[`ID${nodeID}`].tags.push(tag);

			return true;
		};
	};

	isLinkTagged(nodeID1, nodeID2, type, tag) {
		var linkIndex = this._data.nodes[`ID${nodeID1}`].links.findIndex( function(link) {
			return ((link.toID === nodeID2) && (link.type === type));
		});

		if ( linkIndex > -1) {
			if (this._data.nodes[`ID${nodeID1}`].links[linkIndex].tags.findIndex( function(element) {
						return (element === tag);
					}
				) > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	addLinkTag(nodeID1, nodeID2, type, tag) {
		var linkIndex;
		var typePair = (type === "child") ? "parent" : ((type === "parent") ? "child" : type);

		if (!this.isLinked(nodeID1, nodeID2, type)) {
			return false;
		};

		if (this.isLinkTagged(nodeID1, nodeID2, type, tag)) {
			return false;
		};

		if (!this.isTagExists(tag)) {
			this._data.tags[tag] = tag;
		};

		linkIndex = this._data.nodes[`ID${nodeID1}`].links.findIndex( function(link) {
				return ((link.toID === nodeID2) && (link.type === type));
			});
		this._data.nodes[`ID${nodeID1}`].links[linkIndex].tags.push(tag);

		linkIndex = this._data.nodes[`ID${nodeID2}`].links.findIndex( function(link) {
				return ((link.toID === nodeID1) && (link.type === typePair));
			});
		this._data.nodes[`ID${nodeID2}`].links[linkIndex].tags.push(tag);

		return true;
	};

	getLinks(nodeID) {
		return this._data.nodes[`ID${nodeID}`].links.filter(function(link) {
				return (link.deleted === false);
			});
	};

	getChildLinks(nodeID) {
		return this._data.nodes[`ID${nodeID}`].links.filter(function(link) {
				return (link.type === "child" && link.deleted === false);
			});
	};

	hasChildLinks(nodeID) {

		return (this.getChildLinks(nodeID).length > 0);
	};

	getParentLinks(nodeID) {
		return this._data.nodes[`ID${nodeID}`].links.filter(function(link) {
				return (link.type === "parent" && link.deleted === false);
			});
	};

	hasParentLinks(nodeID) {

		return (this.getParentLinks(nodeID).length > 0);
	};

	getFriendLinks(nodeID) {
		return this._data.nodes[`ID${nodeID}`].links.filter(function(link) {
				return (link.type === "friend" && link.deleted === false);
			});
	};

	hasFriendLinks(nodeID) {
		//log.DEBUG(`nodeID(${nodeID}).hasFriendLinks() = ${(this.getFriendLinks(nodeID).length > 0)}`);
		return (this.getFriendLinks(nodeID).length > 0);
	};

	getNode(nodeID) {

		return (this._data.nodes[`ID${nodeID}`]);
	};

	searchNodesByText(searchText) {
		var _this = this;

		var keys = Object.keys(this._data.nodes).filter(function(nodeKey) {
			// majd figyelni kell, h a deleted-ek ne szerepeljenek a listában.
			return ((!_this._data.nodes[nodeKey].deleted) && (_this._data.nodes[nodeKey].text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1));
		});
		var result = [];
		for (var i in keys) {
			result.push({
				id: _this._data.nodes[keys[i]].ID,
				text: _this._data.nodes[keys[i]].text
			});
		};

		return result;
	};

	_setNodePluginData(pluginName, nodeID, data) {

		this._data.pluginData[pluginName].nodes[`ID${nodeID}`] = data;
	};

	_getNodePluginData(pluginName, nodeID) {
		
		return this._data.pluginData[pluginName].nodes[`ID${nodeID}`];
	};
};


export {Dataset};

var undefined;


function dp_noteInstall(DatasetClass) {
	var pluginName = "dp_note";
	var pluginVersion = 1;
	var _this = this;

	// A constructor. Uaz a fv neve mint a pluginnév.
	DatasetClass.prototype[pluginName] = function() {
		if (this._data.pluginData[pluginName]) {
			// Itt lenne az upgrade-hez szükséges kód.
			this._data.pluginData[pluginName].version = pluginVersion;
		} else {
			// Itt van az install/setup-hoz szükséges kód.
			this._data.pluginData[pluginName] = {version: pluginVersion, nodes: {}};
		};
		return this._data.pluginData[pluginName].version;
	};

	DatasetClass.prototype.dp_noteSetNote = function(nodeID, noteTxt) {
		var data = {note: noteTxt};
		this._setNodePluginData(pluginName, nodeID, data);
		return data;
	};

	DatasetClass.prototype.dp_noteGetNote = function(nodeID) {
		var data = this._getNodePluginData(pluginName, nodeID);

		if (data === undefined) {
			return "";
		} else {
			return data.note;
		};
	};
};


export {dp_noteInstall};

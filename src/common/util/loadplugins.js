function loadPlugins(plugins, callback) {
	var numOfplugins = Object.keys(plugins).length;
	var itemsProcessed = 0;

	if (numOfplugins > itemsProcessed) {
		for (var key in plugins) {
			$.getScript(plugins[key].link, function() {
				itemsProcessed++;
				if (itemsProcessed === numOfplugins) {
					callback();
				};
			});
		};
	} else {
		callback();
	};
};


export {loadPlugins};

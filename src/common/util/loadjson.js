import {log} from "./log";


function loadJson(jsonFile, callback) {
	log.loginc();
	log.DEBUG(`loadJson(${jsonFile})`);
	log.logdec();
	d3.json(jsonFile, function(error, data) {
		if (error) throw error;

		callback(data);
	});
};


export {loadJson};

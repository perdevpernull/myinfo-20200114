import {log, loginc, logdec, ERROR, WARNING, INFO, DEBUG} from "./log";


function loadJson(jsonFile, callback) {
	loginc();
	log(DEBUG, `loadJson(${jsonFile})`);
	logdec();
	d3.json(jsonFile, function(error, data) {
		if (error) throw error;

		callback(data);
	});
};


export {loadJson};

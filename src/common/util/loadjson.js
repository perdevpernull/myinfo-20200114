import {log} from "./log";


function loadJson(jsonFile) {
	log.loginc();
	log.DEBUG(`loadJson(${jsonFile})`);
	log.logdec();
	return fetch(jsonFile)
		.then( function(response) {
			if (!response.ok) throw new Error(response.status + " " + response.statusText);
			return response.json();
		});
};


export {loadJson};

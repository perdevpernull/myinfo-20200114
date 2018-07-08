import { log, loginc, logdec, ERROR, INFO, DEBUG } from "./log";
import config from '../config.js';

function loadUserData(callback) {
	loginc();
	log(DEBUG, `load userdata from backend. base url: ${config.BACKEND_BASE_URL}`);
	logdec();
	var userdataUrl = `http://${config.BACKEND_BASE_URL}/userdatas/${config.DEFAULT_USERNAME}`;
	log(INFO, `userdata backend url: ${userdataUrl}`);
	$.ajax({
		type: 'GET',
		url: userdataUrl,
		dataType: 'json',
		error: function (xhr, ajaxOptions, thrownError) {
			log(ERROR, `Failed to load userdata from backend. Msg: ${xhr.responseText}`);
			log(ERROR, `${thrownError}`);
		} 
	}).done(function(data) {
		callback(data);
	});
}

export { loadUserData };
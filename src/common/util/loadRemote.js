import { log, loginc, logdec, ERROR, WARNING, INFO, DEBUG } from "./log";
import config from '../config.js';

function loadUserData(callback) {
	loginc();
	log(DEBUG, `load userdata from backend. base url: ${config.BACKEND_BASE_URL}`);
	logdec();
	callback('data');
}

export { loadUserData };
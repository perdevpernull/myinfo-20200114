var apiSettings = require("./apiSettings.js");
var apiUserdata = require("./apiUserdata.js");
var apiDataset = require("./apiDataset.js");

module.exports = function(req, res, next) {
    switch (req.params.function) {
        case "settings":
            apiSettings(req, res, next);
            break;
        case "userdata":
            apiUserdata(req, res, next);
            break;
        case "dataset":
            apiDataset(req, res, next);
            break;
        default:
            console.log(`API Function UNKNOWN (${req.params.function})`);
            break;
    };
};

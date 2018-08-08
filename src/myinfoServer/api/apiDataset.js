var fs = require('fs');
var base_dir = "p:/myinfo/public";

module.exports = function apiDataset(req, res, next) {
    switch (req.params.version) {
        case "v1":
            switch (req.method) {
                case "GET":
                    // ToDo: put base_dir into some config file.
                    res.sendFile(base_dir+"/"+req.session.userID+"/"+req.query.name+"/"+req.query.name+".json");
                    console.log(`dataset: GET`);
                    break;
                case "PUT":
                    console.log(`dataset: PUT`);
                    break;
                default:
                    console.log(`dataset: Method UNKNOWN (${req.method})`);
                    break; 
            };
            break;
        default:
            console.log(`dataset: API Version UNKNOWN (${req.params.version})`);
            break;
    };
};

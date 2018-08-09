var fs = require('fs');
var base_dir = "p:/myinfo/public";

module.exports = function apiSettings(req, res, next) {
    switch (req.params.version) {
        case "v1":
            switch (req.method) {
                case "GET":
                    // ToDo: put base_dir into some config file.
                    res.sendFile(base_dir+"/"+"settings.json");
                    console.log(`settings: GET (${base_dir+"/"+"settings.json"})`);
                    break;
                case "PUT":
                    console.log(`settings: PUT`);
                    break;
                default:
                    console.log(`settings: Method UNKNOWN (${req.method})`);
                    break; 
            };
            break;
        default:
            console.log(`settings: API Version UNKNOWN (${req.params.version})`);
            break;
    };
};

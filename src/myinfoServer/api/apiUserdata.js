var fs = require('fs');
var base_dir = "p:/myinfo/public";

module.exports = function apiUserdata(req, res, next) {
    switch (req.params.version) {
        case "v1":
            switch (req.method) {
                case "GET":
                    // ToDo: put base_dir into some config file.
                    res.sendFile(base_dir+"/"+req.session.userID+"/"+"userdata.json");
                    console.log(`userdata: GET`);
                    break;
                case "PUT":
                    console.log(`userdata: PUT`);
                    break;
                default:
                    console.log(`userdata: Method UNKNOWN (${req.method})`);
                    break; 
            };
            break;
        default:
            console.log(`userdata: API Version UNKNOWN (${req.params.version})`);
            break;
    };
};

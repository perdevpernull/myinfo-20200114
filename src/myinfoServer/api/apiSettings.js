var fs = require('fs');
var base_dir = "p:/myinfo/public";

module.exports = function apiSettings(req, res, next) {
    switch (req.params.version) {
        case "v1":
            switch (req.method) {
                case "GET":
                    // ToDo: put base_dir into some config file.
                    var files = fs.readdirSync(base_dir).filter(item => (item.slice(0,8) === "settings")).sort().reverse();
                    res.sendFile(base_dir+"/"+files[0]);
                    console.log(`settings: GET (${base_dir+"/"+files[0]})`);
                    break;
                case "POST":
                    var data = JSON.stringify(req.body);
                    var now = new Date().toJSON().replace(/:/g,"").replace(/-/g,"");
                    fs.writeFileSync(base_dir+"/settings."+now+".json", data);
                    console.log(`settings: POST`);
                    res.sendStatus(200);
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

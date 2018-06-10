const fs = require("fs");
const config = require("../config/config.js")();

const dbroot = __dirname + "/db";
var default_user_folder;

function Database() {
    //
}

function load_user_data(username) {
    var datapath = default_user_folder + "/userdata-" + username + ".json";
    if (!fs.existsSync(datapath)) {
        // TODO
    }

    return JSON.parse(fs.readFileSync(datapath));
}

function load_user_settings(username) {
    var datapath = default_user_folder + "/userdata-" + username + ".json";
    if (!fs.existsSync(datapath)) {
        // TODO
    }

    return JSON.parse(fs.readFileSync(datapath));
}

Database.prototype.init = () => {
    console.log("Init DB");
    console.log("DB directory root: " + dbroot);
    console.log(`Default user ${config.DEFAULT_USER}`);

    if (!fs.existsSync(dbroot)) {
        fs.mkdirSync(dbroot);
    }

    default_user_folder = dbroot + "/" + config.DEFAULT_USER;
    if (!fs.existsSync(default_user_folder)) {
        fs.mkdirSync(default_user_folder);
    }
};

Database.prototype.load_user_data = (username) => {
    if (username == null) {
        console.log("Load default user data");

        return load_user_data(config.DEFAULT_USER);
    } else {
        console.log(`Load ${username}'s data`);

        return load_user_data(username);
    }

};

Database.prototype.load_user_settings = (username) => {
    if (username == null) {
        console.log("Load default user settings");

        return load_user_settings(config.DEFAULT_USER);
    } else {
        console.log(`Load ${username}'s data`);

        return load_user_settings(username);
    }

};

module.exports = Database;
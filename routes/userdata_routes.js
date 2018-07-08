module.exports = function (app, config, db) {

    app.get(`/api/v${config.VERSION}/userdatas/:username`, function (req, res) {
        var userdata = load_user_data_by_username(req.params['username']);
        res.send(userdata);
        res.end();
    });

    function load_user_data_by_username(username) {
        // Just ignore the username.. for now
        return db.load_user_data(username);
    }

};
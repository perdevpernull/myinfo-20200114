module.exports = function (app, config, db) {

    app.get(`/api/v${config.VERSION}/userdatas/:username`, function(req, res) {
        // Just ignore the username.. for now
        var userdata = db.load_user_data();
        res.send(userdata);
        res.end();
    });

};
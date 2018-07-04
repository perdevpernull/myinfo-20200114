module.exports = function (app, config, db) {

    app.get(`/api/v${config.VERSION}/login/:username/:password`, function(req, res) {
        res.send(req.params['username']);
        res.end();
    });

};
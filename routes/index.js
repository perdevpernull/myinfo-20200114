const noteRoutes = require('./note_routes');
const userdataRoutes = require('./userdata_routes');
const loginRoutes = require('./login_routes');

module.exports = function(app, config, db) {
  noteRoutes(app, db);
  userdataRoutes(app, config, db);
  loginRoutes(app, config, db);
  // Other route groups could go here, in the future
};
const schemas = require('./schemas');

const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);
const User = conn.model('User', schemas.userSchema);

exports.User = User;



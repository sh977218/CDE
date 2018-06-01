const schemas = require('./schemas');

const conn = connHelper.establishConnection(config.database.appData);
const User = conn.model('User', schemas.userSchema);

exports.User = User;



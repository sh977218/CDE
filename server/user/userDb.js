const schemas = require('./schemas');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');

const conn = connHelper.establishConnection(config.database.appData);
const User = conn.model('User', schemas.userSchema);

exports.User = User;

exports.byId = (id, callback) => {
    User.findById(id, {password: 0}, callback);
};

exports.updateUser = (id, fields, callback) => {
    let update = {};
    if (fields.email) update.email = fields.email;
    if (fields.searchSettings) update.searchSettings = fields.searchSettings;
    if (fields.publishedForms) update.email = fields.publishedForms;
    User.update({_id: id}, {$set: update}, callback);
};
exports.avatarByUsername = (username, callback) => {
    User.findOne({'username': new RegExp('^' + username + '$', "i")}, {avatarUrl: 1}, callback);
};

exports.usersByUsername = (username, callback) => {
    User.find({'username': new RegExp(username, 'i')}, {password: 0}, callback);
};

exports.byUsername = (username, callback) => {
    User.findOne({username: username}, callback);
};

exports.save = (user, callback) => {
    new User.save(user, callback);
};



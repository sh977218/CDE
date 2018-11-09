const Schema = require('mongoose').Schema;
const connHelper = require('../system/connections');
const config = require('../system/parseConfig');

const isOrgAdmin = require('../../shared/system/authorizationShared').isOrgAdmin;

let articleSchema = new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()}
});

let conn = connHelper.establishConnection(config.database.appData);
let Article = conn.model('article', articleSchema);


exports.byId = function (id, cb) {
    Article.findById(id, cb);
};

exports.byKey = function (key, cb) {
    Article.findOne({key: key}, cb);
};

exports.update = function (art, cb) {
    Article.findOneAndUpdate({key: art.key}, {$set: {body: art.body, updated: Date.now()}}, {upsert: true}, cb);
};


exports.checkOwnership = function (req, dao, id, cb) {
    if (!req.isAuthenticated()) return cb("You are not authorized.", null);
    dao.byId(id, function (err, elt) {
        if (err || !elt) return cb("Element does not exist.", null);
        if (!authorizationShared.isOrgAdmin(req.user))
            return cb("You do not own this element.", null);
        cb(null, elt);
    });
};
const Schema = require('mongoose').Schema;
const connHelper = require('../system/connections');
const config = require('../system/parseConfig');

let articleSchema = new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()}
});

let conn = connHelper.establishConnection(config.database.appData);
let Article = conn.model('article', articleSchema);

exports.byKey = function (key, cb) {
    Article.findOne({key: key}, cb);
};

exports.save = function (article, cb) {
    article.save(cb);
};

exports.update = function (key, cb) {
    article.findOneAndUpdate({key: key}, {}, cb);
};
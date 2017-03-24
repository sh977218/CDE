var mongoose = require('mongoose')
    , config = require('../../system/node-js/parseConfig')
    , schemas = require('./schemas_article')
    , connHelper = require('../../system/node-js/connections')
;

exports.name = "Help";
        
var connection = connHelper.establishConnection(config.database.appData);

var Article = connection.model('Article', schemas.articleSchema);

exports.byKey = function(key, cb) {
    Article.findOne({key: key, archived: false}).exec(cb);
};

exports.byId = function(id, cb) {
    Article.findOne({_id: id}).exec(cb);
};

exports.newArticle = function (key, cb) {
    exports.byKey(key, function (err, found) {
        if (found) cb("Duplicate", null);
        else {
            var article = new Article(
                {
                    key: key,
                    body: "This article has no content",
                    created: Date.now(),
                    archived: false
                });
            article.save(cb);
        }
    });
};

exports.update = function(article, cb) {
    var id = article._id;
    delete article._id;
    var newArticle = new Article(article);
    exports.byId(id, function(err, oldArticle) {
        oldArticle.archived = true;
        oldArticle.save(function(err, oldArticle) {
            if (err) cb(err);
            else {
                newArticle.history.push(oldArticle._id);
                newArticle.updated = Date.now();
                newArticle.save(cb);
            }
        });
        
    });
};  



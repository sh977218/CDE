var mongoose = require('mongoose')
    , config = require('config')
    , schemas = require('./schemas_article')
    , connHelper = require('../../system/node-js/connections')
;

exports.name = "Help";
        
var mongoUri = config.mongoUri;
var Article;

var connectionEstablisher = connHelper.connectionEstablisher;
var connection = null;

var iConnectionEstablisherCde = new connectionEstablisher(mongoUri, 'CDE');
iConnectionEstablisherCde.connect(function(conn) {
    Article = conn.model('Article', schemas.articleSchema);
    connection = conn;
});

exports.byPath = function(path, cb) {
    Article.findOne({path: path}).exec(cb);
};



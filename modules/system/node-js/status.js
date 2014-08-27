var config = require('config')
    , request = require('request')
    , elastic = require('./elastic');
    
var statusReport = {
    elastic: {
        up: false
        , results: false
        , sync: false
        , updating: false
    }
};    

exports.status = function(req, res) {    
    res.send("es " + JSON.stringify(statusReport));    
};

exports.checkElastic = function() {
    request.post(elastic.elasticCdeUri + "_search", {body: JSON.stringify({})}, function (error, response, bodyStr) {
        if (error || response.statusCode !== 200) { 
            statusReport.elastic.up = false; 
            statusReport.elastic.results = false; 
            statusReport.elastic.sync = false; 
            statusReport.elastic.updating = false; 
            return;
        } else {
            statusReport.elastic.up = true; 
        }
        var body = JSON.parse(bodyStr);     
        if (!body.hits.hits.length>0) {
            statusReport.elastic.results = false; 
            statusReport.elastic.sync = false; 
            statusReport.elastic.updating = false;             
        } else {
            statusReport.elastic.results = true; 
        }
        
    });    
};

setInterval(function() {
    exports.checkElastic();
}, 1000);

//exports.checkMongo = function(res) {
//    var mongoose = require("mongoose");
//    mongoose.connect(config.mongoUri+"/test");
//    var conn = mongoose.createConnection(config.mongoUri+"/admin");
//    conn.on("open",function() {
//        conn.db.command({"replSetGetStatus":1 },function(err,result) {
//            console.log( result );
//            res.send("mongo " + mongo);                 
//        });
//    });
//};
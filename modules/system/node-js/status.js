var config = require('config')
    , request = require('request')
    , mongo = require('../../cde/node-js/mongo-cde') //TODO-remove
    , elastic = require('./elastic');
    
    
var status = this;

status.statusReport = {
    elastic: {
        up: false
        , results: false
        , sync: false
        , updating: false
    }
};    

exports.status = function(req, res) {    
    res.send("es " + JSON.stringify(status.statusReport));    
};



status.checkElastic = function(elasticUrl, mongoCollection) {
    request.post(elasticUrl + "_search", {body: JSON.stringify({})}, function (error, response, bodyStr) {
        status.checkElasticUp(error, response, status.statusReport);
        var body = JSON.parse(bodyStr);     
        if (status.statusReport.elastic.up) status.checkElasticResults(body, status.statusReport);
        if (status.statusReport.elastic.results) status.checkElasticSync(body, status.statusReport, mongoCollection);
    });    
};

status.checkElasticUp = function(error, response, statusReport) {
    if (error || response.statusCode !== 200) { 
        statusReport.elastic.up = false; 
        statusReport.elastic.results = false; 
        statusReport.elastic.sync = false; 
        statusReport.elastic.updating = false; 
        return;
    } else {
        statusReport.elastic.up = true; 
    }    
};

status.checkElasticResults = function(body, statusReport) {
    if (!body.hits.hits.length>0) {
        statusReport.elastic.results = false; 
        statusReport.elastic.sync = false; 
        statusReport.elastic.updating = false;             
    } else {
        statusReport.elastic.results = true; 
    }    
};

status.checkElasticSync = function(body, statusReport, mongoCollection) {
    var elasticElt = body.hits.hits[0]._source;
    mongoCollection.byId(elasticElt._id, function(err, elt) {
        if (err) {
            statusReport.elastic.sync = false; 
            statusReport.elastic.updating = false;      
            return;
        }
        console.log(elasticElt.uuid);
        if (elasticElt.uuid !== elt.uuid) {
            statusReport.elastic.sync = false;      
            return;
        } else {
            statusReport.elastic.sync = true; 
        }
    });
};

setInterval(function() {
    status.checkElastic(elastic.elasticCdeUri, mongo);
}, 1000);
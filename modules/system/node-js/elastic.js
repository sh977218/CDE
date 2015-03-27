var config = require('config')
    , request = require('request')
    , logging = require('../../system/node-js/logging')
;

exports.elasticCdeUri = config.elasticUri;
exports.elasticFormUri = config.elasticFormUri;

exports.elasticsearch = function (query, type, cb) {
    var url = null;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    request.post(url + "_search", {body: JSON.stringify(query)}, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var resp = JSON.parse(body);
            var result = {cdes: []
                , totalNumber: resp.hits.total};
            for (var i = 0; i < resp.hits.hits.length; i++) {
                var thisCde = resp.hits.hits[i]._source;
                thisCde.score = resp.hits.hits[i]._score;
                if (thisCde.valueDomain && thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                thisCde.properties = [];
                thisCde.flatProperties = [];
                thisCde.highlight = resp.hits.hits[i].highlight;
                result.cdes.push(thisCde);
            }
            result.aggregations = resp.aggregations;
            cb(null, result);
        } else {
            if (response.statusCode === 400) {
                logging.errorLogger.error("Error: ElasticSearch Error", 
                    {origin: "system.elastic.elasticsearch", stack: new Error().stack,
                        details: {body: JSON.stringify(query)}});
                cb("Invalid Query");
            } else {
                var querystr = "cannot stringify query";
                var body;
                try {
                    querystr = JSON.stringify(query);
                    body  = JSON.stringify(body);
                } catch (e){}
                logging.errorLogger.error("Error: ElasticSearch Error", 
                    {origin: "system.elastic.elasticsearch", stack: new Error().stack,
                        details: "query " + querystr + ", body " + body});
                cb("Server Error");
            }
        } 
    });  
};

var stringifyCde = function(elasticCde){
    //return {
    //    name: elasticCde.naming[0].designation
    //    , otherNames: elasticCde.naming.slice(1).map(function(n){return n.designation;})
    //    , valueDomainType: elasticCde.valueDomain.datatype
    //    , permissibleValues: elasticCde.valueDomain.permissibleValues.map(function(pv){return pv.valueMeaningName;})
    //    , ids: elasticCde.ids.map(function(id){return id.source+": "+id.id+(id.version?" v"+id.version:"");})
    //};
    //var ids;
    //try {
    //    ids = elasticCde.ids.map(function (id) {
    //        return id.source + ": " + id.id + (id.version ? " v" + id.version : "");
    //    });
    //} catch (e) {
    //    console.log(e);
    //}

    var cde = {
        name: elasticCde.naming[0].designation
        , otherNames: elasticCde.naming.slice(1).map(function(n){return n.designation;})
        , valueDomainType: elasticCde.valueDomain.datatype
        , permissibleValues: elasticCde.valueDomain.permissibleValues.map(function(pv){return pv.valueMeaningName;})
        , ids: elasticCde.ids
        , stewardOrg: elasticCde.stewardOrg
        , registrationStatus: elasticCde.registrationState.registrationStatus
        , adminStatus: elasticCde.registrationState.administrativeStatus
    };
    if (elasticCde.classification) cde.usedBy = elasticCde.classification.map(function(c){return c.stewardOrg.name});
    return cde;
};

exports.elasticSearchExport = function(query, type, cb) {
    var url = null;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    query.size = 99999;
    request.post(url + "_search", {body: JSON.stringify(query)}, function (error, response, body) {
        var time0 = new Date().getTime();
        var elasticCdes = JSON.parse(body).hits.hits;
        var time1 = new Date().getTime();
        var cdes = elasticCdes.map(function(c){return stringifyCde(c._source);});
        var time2 = new Date().getTime();
        console.log(time1 - time0);
        console.log(time2 - time1);
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        cb(error, cdes)
    });
};
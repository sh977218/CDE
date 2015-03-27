var config = require('config')
    , request = require('request')
    , logging = require('../../system/node-js/logging')
    , jsonStream = require('JSONStream')
    , es = require('event-stream')
    , trim = require("trim")
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

var projectCde = function(elasticCde){
    var cde = {
        name: elasticCde.naming[0].designation
        , otherNames: elasticCde.naming.slice(1).map(function(n){return n.designation;})
        , valueDomainType: elasticCde.valueDomain.datatype
        , permissibleValues: elasticCde.valueDomain.permissibleValues.map(function(pv){return pv.valueMeaningName;})
        , ids: elasticCde.ids.map(function(id) {return id.source + ": " + id.id + (id.version ? " v" + id.version : "")})
        , stewardOrg: elasticCde.stewardOrg.name
        , registrationStatus: elasticCde.registrationState.registrationStatus
        , adminStatus: elasticCde.registrationState.administrativeStatus
    };
    if (elasticCde.classification) cde.usedBy = elasticCde.classification.map(function(c){return c.stewardOrg.name});
    return cde;
};

var convertToCsv = function(cde) {
    var row = "";
    Object.keys(cde).forEach(function(key) {
        var value = cde[key];
        if (Array.isArray(value)) row += value.map(function(v){return trim(v).replace(",","");}).join("; ") + ", ";
        else row += value +", ";
    });
    return row+ "\n";
};

exports.elasticSearchExport = function(res, query, type) {
    var url = null;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    query.size = 500;
    res.write("Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By");
    request({uri: url + "_search", body: JSON.stringify(query), method: "POST"})
        .pipe(jsonStream.parse('hits.hits.*'))
        .pipe(es.map(function (de, cb) {
            cdeProjection = projectCde(de._source);
            csvCde = convertToCsv(cdeProjection);
            cb(null, csvCde);
        })).pipe(res);
};
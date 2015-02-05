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
                thisCde.highlight = resp.hits.hits[i].highlight;
                result.cdes.push(thisCde);
            }
            result.aggregations = resp.aggregations;
            cb(null, result);
        } else {
            if (response.statusCode === 400) {
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
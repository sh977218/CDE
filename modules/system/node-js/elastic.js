var config = require('config')
    , request = require('request')
;

exports.elasticCdeUri = config.elasticUri;
exports.elasticFormUri = config.elasticFormUri;

exports.elasticsearch = function (query, type, cb) {
    var url = null;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    var startTime = new Date().getTime();
    request.post(url + "_search", {body: JSON.stringify(query)}, function (error, response, body) {
        var endTime = new Date().getTime();
        console.log("request.post took "+(endTime-startTime));
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
        cb(result);
     } else {
         console.log("es error: " + error + " response: " + response.statusCode);
     } 
    });  
};
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
                var errBody;
                try {
                    querystr = JSON.stringify(query);
                    errBody  = JSON.stringify(body);
                } catch (e){}
                logging.errorLogger.error("Error: ElasticSearch Error", 
                    {origin: "system.elastic.elasticsearch", stack: new Error().stack,
                        details: "query " + querystr + ", body " + errBody});
                cb("Server Error");
            }
        } 
    });  
};

var convertToCsv = function(cde) {
    var sanitize = function(v) {
        return trim(v).replace(/\"/g,"\"\"");
    };
    var row = "";
    Object.keys(cde).forEach(function(key) {
        row += "\"";
        var value = cde[key];
        if (Array.isArray(value)) {
            row += value.map(function (value) {
                return sanitize(value);
            }).join("; ");
        } else if (value) {
            row += sanitize(value);
        }
        row+="\",";
    });
    return row+ "\n";
};

var lock = false;
exports.elasticSearchExport = function(res, query, type, project, header) {
    if (lock) return res.status(503).send("Servers busy");

    lock = true;

    var url;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    query.size = 500;
    res.write(header);

    delete query.aggregations;

    var scrollThrough = function(scrollId) {
        var uri = config.elastic.uri + "/_search/scroll?scroll=1m" + "&size=20&scroll_id=" + scrollId;
        request({uri: uri, method: "GET"}, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                var resp = JSON.parse(body);
                var newScrollId = resp._scroll_id;
                if (resp.hits.hits.length === 0) {
                    lock = false;
                    res.send();
                }
                else {
                    for (var i = 0; i < resp.hits.hits.length; i++) {
                        var thisCde = resp.hits.hits[i]._source;
                        res.write(convertToCsv(project(thisCde)));
                    }
                    scrollThrough(newScrollId);
                }
            } else {
                lock = false;
                res.status(500).send("ES Error");
            }
        });
    };

    request({uri: url + "_search?search_type=scan&scroll=1m", body: JSON.stringify(query), method: "POST"}, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var resp = JSON.parse(body);
            scrollThrough(resp._scroll_id);
        } else {
            lock = false;
            res.status(500).send("ES Error");
        }
    });

};
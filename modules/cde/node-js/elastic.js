var config = require('config')
    , request = require('request')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , logging = require('../../system/node-js/logging.js')
;

var elasticCdeUri = sharedElastic.elasticCdeUri;
var elasticFormUri = sharedElastic.elasticFormUri;

exports.elasticsearch = function (query, cb) {
    if (!config.modules.cde.highlight) {
        Object.keys(query.highlight.fields).forEach(function(field){
            if (field == "primaryNameCopy" || field == "primaryDefinitionCopy") return;
            else delete query.highlight.fields[field];
        });
    }
    sharedElastic.elasticsearch(query, 'cde', cb);
};

var mltConf = {
    "mlt_fields" : [
        "naming.designation",
        "naming.definition",
        "valueDomain.permissibleValues.permissibleValue",
        "valueDomain.permissibleValues.valueMeaningName",
        "valueDomain.permissibleValues.valueMeaningCode",
        "property.concepts.name",
        "property.concepts.originId"
    ],
    "min_term_freq" : 1,
    "min_doc_freq" : 1,
    "min_word_length" : 2
};    


function jsonToUri(object){
    return Object.keys(object).map(function(key){ 
        return encodeURIComponent(key) + '=' + encodeURIComponent(object[key]); 
    }).join('&');
}

exports.morelike = function(id, callback) {
    var from = 0;
    var limit = 20;
    var mltConfUri = jsonToUri(mltConf);
    request.get(elasticCdeUri + "dataelement/" + id + "/_mlt?" + mltConfUri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var resp = JSON.parse(body);
            var result = {cdes: []
                , pages: Math.ceil(resp.hits.total / limit)
                , page: Math.ceil(from / limit)
                , totalNumber: resp.hits.total};
            for (var i = 0; i < resp.hits.hits.length; i++) {
                var thisCde = resp.hits.hits[i]._source;
                if (thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                } 
                result.cdes.push(thisCde);
            }
            callback(result);
        } else {
            logging.errorLogger.error("Error: More Like This", {origin: "cde.elastic.morelike", stack: new Error().stack, details: "mltConfUri " + mltConfUri + ", error: " + error + ", response: " + JSON.stringify(response)});
            callback("Error");
        }        
    }); 
};

exports.DataElementDistinct = function(field, cb) {
    var distinctQuery = {
	"size": 0
        , "aggs" : {
            "aggregationsName" : {
                "terms" : { 
                    "field" : field
                    , "size" : 1000
                }
            }
        }
    };
    request.post(elasticCdeUri + "_search", {body: JSON.stringify(distinctQuery)}, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var resp = JSON.parse(response.body);
            var list = resp.aggregations.aggregationsName.buckets.map(function(b) {return b.key;});
            cb(list);
        } else {
            logging.errorLogger.error("Error DataElementDistinct", {origin: "cde.elastic.DataElementDistinct", stack: new Error().stack, details: "query "+JSON.stringify(distinctQuery)+"error "+error+"respone"+JSON.stringify(response)});
        } 
    });           
};

exports.pVCodeSystemList = [];

exports.fetchPVCodeSystemList = function() {
    var elastic = this;
    this.DataElementDistinct("valueDomain.permissibleValues.valueMeaningCodeSystem", function(result) {
        elastic.pVCodeSystemList = result;
    });
};
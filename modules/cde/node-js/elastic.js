var config = require('config')
    , request = require('request')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , logging = require('../../system/node-js/logging.js')
    , regStatusShared = require('../../system/shared/regStatusShared')
;

var elasticCdeUri = sharedElastic.elasticCdeUri;

var buildElasticSearchQuery = function(settings) {
    this.escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    var queryStuff = {size: settings.resultPerPage?settings.resultPerPage:20};
    var searchQ = settings.searchTerm;

    queryStuff.query =
    {
        bool: {
            must_not: [{
                term: {
                    "isFork": "true"
                }
            }]
        }
    };

    var visibleRegStatuses = settings.visibleRegStatuses;
    regStatusShared.statusList.forEach(function(status){
        if (visibleRegStatuses.indexOf(status)===-1) queryStuff.query.bool.must_not.push({
            term: {"registrationState.registrationStatus": status}
        });
    });

    queryStuff.query.bool.must = [];

    var script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

    queryStuff.query.bool.must.push({
        dis_max: {
            queries: [
                {function_score: {script_score: {script: script}}}
            ]
        }
    });

    if (searchQ !== undefined && searchQ !== "") {
        queryStuff.query.bool.must[0].dis_max.queries[0].function_score.query =
        {
            query_string: {
                query: searchQ
            }
        };
        queryStuff.query.bool.must[0].dis_max.queries.push({function_score: {script_score: {script: script}}});
        queryStuff.query.bool.must[0].dis_max.queries[1].function_score.query =
        {
            query_string: {
                fields: ["naming.designation^5", "naming.definition^2"]
                , query: searchQ
            }
        };
        queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2.5";
        if (searchQ.indexOf("\"") < 0) {
            queryStuff.query.bool.must[0].dis_max.queries.push({function_score: { script_score: {script: script}}});
            queryStuff.query.bool.must[0].dis_max.queries[2].function_score.query =
            {
                query_string: {
                    fields: ["naming.designation^5", "naming.definition^2"]
                    , query: "\"" + searchQ + "\"~4"
                }
            };
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2";
        }
    }

    if (settings.selectedOrg !== undefined) {
        queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": settings.selectedOrg}});
    }

    if (settings.filter !== undefined) {
        if (settings.filter.and !== undefined) {
            if (settings.filter.and.length === 0) {
                delete settings.filter.and;
            }
        }
        if (settings.filter.and === undefined) {
            delete settings.filter;
        }
    }

    if (settings.filter !== undefined) {
        queryStuff.filter = settings.filter;
    }

    var queryBuilder = this;

    var flatSelection = settings.selectedElements.join(";");
    if (flatSelection !== "") {
        queryStuff.query.bool.must.push({term: {flatClassification: settings.selectedOrg + ";" + flatSelection}});
    }

    var flatSelectionAlt = settings.selectedElementsAlt?settings.selectedElementsAlt.join(";"):"";
    if (flatSelectionAlt !== "") {
        queryStuff.query.bool.must.push({term: {flatClassification: settings.selectedOrgAlt + ";" + flatSelectionAlt}});
    }

    if (settings.includeAggregations) {
        queryStuff.aggregations = {
            orgs: {
                filter: settings.filter,
                aggregations: {
                    orgs: {
                        terms: {
                            "field": "classification.stewardOrg.name",
                            "size": 40,
                            order: {
                                "_term": "desc"
                            }
                        }
                    }
                }
            },
            statuses: {
                terms: {
                    field: "registrationState.registrationStatus"
                }
            }
        };

        queryStuff.aggregations.statuses.aggregations = {};

        var flattenClassificationAggregations = function(variableName, orgVariableName, selectionString) {
            var flatClassification = {
                terms: {
                    size: 500,
                    field: "flatClassification"
                }
            };
            if (selectionString === "") {
                flatClassification.terms.include = settings[orgVariableName] + ";[^;]+";
            } else {
                flatClassification.terms.include = settings[orgVariableName] + ';' + queryBuilder.escapeRegExp(selectionString) + ";[^;]+";
            }
            queryStuff.aggregations[variableName] = {
                filter: settings.filter,
                aggs: {}
            };
            queryStuff.aggregations[variableName].aggs[variableName] = flatClassification;
        };
        if (settings.selectedOrg !== undefined) {
            flattenClassificationAggregations('flatClassification', 'selectedOrg',flatSelection);
        }
        if (settings.selectedOrgAlt !== undefined) {
            flattenClassificationAggregations('flatClassificationAlt', 'selectedOrgAlt',flatSelectionAlt);
        }
    }

    if (queryStuff.query.bool.must.length === 0) {
        delete queryStuff.query.bool.must;
    }

    queryStuff.from = (settings.currentPage - 1) * settings.resultPerPage;

    queryStuff.highlight = {
        "order" : "score"
        , "pre_tags" : ["<strong>"]
        , "post_tags" : ["</strong>"]
        , "fields" : {
            "stewardOrgCopy.name" : {}
            , "primaryNameCopy": {}
            , "primaryDefinitionCopy": {}
            , "naming.designation": {}
            , "naming.definition": {}
            , "dataElementConcept.concepts.name": {}
            , "dataElementConcept.concepts.origin": {}
            , "dataElementConcept.concepts.originId": {}
            , "property.concepts.name": {}
            , "property.concepts.origin": {}
            , "property.concepts.originId": {}
            , "objectClass.concepts.name": {}
            , "objectClass.concepts.origin": {}
            , "objectClass.concepts.originId": {}
            , "valueDomain.datatype": {}
            , "flatProperties": {}
            , "flatIds": {}
            , "classification.stewardOrg.name": {}
            , "classification.elements.name": {}
            , "classification.elements.elements.name": {}
            , "classification.elements.elements.elements.name": {}

        }
    };
    return queryStuff;
};

exports.elasticsearch = function (settings, type, cb) {
    //TODO: move this where it belongs!
    //if (!config.modules.cde.highlight) {
    //    Object.keys(query.highlight.fields).forEach(function(field){
    //        if (field == "primaryNameCopy" || field == "primaryDefinitionCopy") return;
    //        else delete query.highlight.fields[field];
    //    });
    //}
    var query = buildElasticSearchQuery(settings);
    sharedElastic.elasticsearch(query, type, cb);
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
    ]
};    

exports.morelike = function(id, callback) {
    var from = 0;
    var limit = 20;
    var mltPost = {
       "query": {
        "filtered": {
           "query": {
              "more_like_this": {
                 "fields": mltConf.mlt_fields,
                 "docs": [
                    {
                       "_id": id
                    }
                 ],
                "min_term_freq" : 1,
                "min_doc_freq" : 1,
                "min_word_length" : 2
              }
           },
           "filter": {
              bool: {
                    must_not: [{
                        term: {
                            "registrationState.registrationStatus": "Retired"
                        }
                    }
                    ,{
                        term: {
                            "isFork": "true"
                        }                    
                    } 
                    ]
                }
           }
         }
        }  
    };
    
    request.post(elasticCdeUri + "_search", {body: JSON.stringify(mltPost)}, function (error, response, body) {
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
            logging.errorLogger.error("Error: More Like This", {origin: "cde.elastic.morelike", stack: new Error().stack, details: "Error: " + error + ", response: " + JSON.stringify(response)});
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
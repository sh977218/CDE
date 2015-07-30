var request = require('request')
    , config = require('./parseConfig')
    , logging = require('../../system/node-js/logging')
    , es = require('event-stream')
    , trim = require("trim")
    , regStatusShared = require('../../system/shared/regStatusShared')
    , exportShared = require('../../system/shared/exportShared')
    ;

exports.elasticCdeUri = config.elasticUri;
exports.elasticFormUri = config.elasticFormUri;

exports.buildElasticSearchQuery = function (settings) {
    this.escapeRegExp = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    var queryStuff = {size: settings.resultPerPage ? settings.resultPerPage : 20};
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
    regStatusShared.statusList.forEach(function (status) {
        if (visibleRegStatuses.indexOf(status) === -1) queryStuff.query.bool.must_not.push({
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
            queryStuff.query.bool.must[0].dis_max.queries.push({function_score: {script_score: {script: script}}});
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

    var buildFilter = function (allowedStatuses, selectedStatuses) {
        var regStatuses = selectedStatuses;
        if (!regStatuses) regStatuses = [];
        var regStatusOr = [];
        for (var i = 0; i < regStatuses.length; i++) {
            var t = regStatuses[i];
            if (t.selected === true) {
                regStatusOr.push({term: {"registrationState.registrationStatus": t.name}});
            }
        }
        if (regStatusOr.length === 0) {
            allowedStatuses.forEach(function (regStatus) {
                regStatusOr.push({term: {"registrationState.registrationStatus": regStatus}});
            });
        }
        var filter = {and: []};
        if (regStatusOr.length > 0) {
            filter.and.push({or: regStatusOr});
        }
        return filter;
    };

    settings.filter = buildFilter(settings.visibleRegStatuses, settings.selectedStatuses);

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

    var flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(";") : "";
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

        var flattenClassificationAggregations = function (variableName, orgVariableName, selectionString) {
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
            flattenClassificationAggregations('flatClassification', 'selectedOrg', flatSelection);
        }
        if (settings.selectedOrgAlt !== undefined) {
            flattenClassificationAggregations('flatClassificationAlt', 'selectedOrgAlt', flatSelectionAlt);
        }
    }

    if (queryStuff.query.bool.must.length === 0) {
        delete queryStuff.query.bool.must;
    }

    queryStuff.from = (settings.currentPage - 1) * settings.resultPerPage;

    queryStuff.highlight = {
        "order": "score"
        , "pre_tags": ["<strong>"]
        , "post_tags": ["</strong>"]
        , "fields": {
            "stewardOrgCopy.name": {}
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

exports.elasticsearch = function (query, type, cb) {
    var url = null;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    request.post(url + "_search", {body: JSON.stringify(query)}, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var resp = JSON.parse(body);
            var result = {
                cdes: []
                , totalNumber: resp.hits.total
            };
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
                    {
                        origin: "system.elastic.elasticsearch", stack: new Error().stack,
                        details: JSON.stringify(query)
                    });
                cb("Invalid Query");
            } else {
                var querystr = "cannot stringify query";
                var errBody;
                try {
                    querystr = JSON.stringify(query);
                    errBody = JSON.stringify(body);
                } catch (e) {
                }
                logging.errorLogger.error("Error: ElasticSearch Error",
                    {
                        origin: "system.elastic.elasticsearch", stack: new Error().stack,
                        details: "query " + querystr + ", body " + errBody
                    });
                cb("Server Error");
            }
        }
    });
};

var lock = false;
exports.elasticSearchExport = function (res, query, type, converter, header) {
    if (lock) return res.status(503).send("Servers busy");

    lock = true;

    var url;
    if (type === "cde") url = exports.elasticCdeUri;
    if (type === "form") url = exports.elasticFormUri;
    query.size = 500;
    res.write(header);

    delete query.aggregations;

    var scrollThrough = function (scrollId) {
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
                        res.write(converter(exportShared.projectCdeForExport(thisCde)));
                    }
                    scrollThrough(newScrollId);
                }
            } else {
                lock = false;
                logging.errorLogger.error("Error: Elastic Search Scroll Access Error",
                    {
                        origin: "system.elastic.elasticsearch", stack: new Error().stack,
                        details: "body " + body
                    });
                res.status(500).send("ES Error");
            }
        });
    };

    request({
        uri: url + "_search?search_type=scan&scroll=1m",
        body: JSON.stringify(query),
        method: "POST"
    }, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var resp = JSON.parse(body);
            scrollThrough(resp._scroll_id);
        } else {
            lock = false;
            logging.errorLogger.error("Error: Elastic Search Scroll Query Error",
                {
                    origin: "system.elastic.elasticsearch", stack: new Error().stack,
                    details: "body " + body + ", query: " + query
                });
            res.status(500).send("ES Error");
        }
    });

    exports.completionSuggest = function (term, cb) {
        var url = config.elasticStoredQueryUri;
        var suggestQuery = {
            "search_suggest": {
                "text": term,
                "completion": {
                    "field": "search_suggest"
                }
            }
        };
        request.post(url + "_suggest", {body: JSON.stringify(suggestQuery)}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var resp = JSON.parse(body);
                cb(resp);
            } else {
                cb(error);
            }
        })
    };

};
var config = require('./parseConfig')
    , logging = require('./logging')
    , regStatusShared = require('../shared/regStatusShared')
    , usersvc = require("./usersrvc")
    , elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    , dbLogger = require('../../system/node-js/dbLogger.js')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.esClient = esClient;

exports.removeElasticFields = function(elt) {
    delete elt.classificationBoost;
    delete elt.flatClassifications;
    delete elt.primaryNameCopy;
    delete elt.stewardOrgCopy;
    delete elt.flatProperties;
    if (elt.valueDomain) delete elt.valueDomain.nbOfPVs;
    delete elt.primaryDefinitionCopy;
    delete elt.flatIds;
    delete elt.usedByOrgs;
    delete elt.registrationState.registrationStatusSortOrder;
    return elt;
};

exports.nbOfCdes = function (cb) {
    esClient.count({index: config.elastic.index.name}, function(err, result){
        cb(err, result.count);
    });
};
exports.nbOfForms = function (cb) {
    esClient.count({index: config.elastic.formIndex.name}, function(err, result){
        cb(err, result.count);
    });
};

function EsInjector(esClient, indexName, documentType) {
    var _esInjector = this;
    this.buffer = [];
    this.injectThreshold = 250;
    this.documentType = documentType;
    this.indexName = indexName;
    this.queueDocument = function (doc, cb) {
        if (!doc) return;
        _esInjector.buffer.push(doc);
        if (_esInjector.buffer.length >= _esInjector.injectThreshold) {
            _esInjector.inject(cb);
        } else {
            cb();
        }
    };
    this.inject = function (cb) {
        if (!cb) cb = function(){};
        var request = {
            body: []
        };
        _esInjector.buffer.forEach(function (elt) {
            request.body.push({
                index: {
                    _index: _esInjector.indexName,
                    _type: _esInjector.documentType,
                    _id: elt.tinyId ? elt.tinyId : elt._id
                }
            });
            delete elt._id;
            request.body.push(elt);
        });
        _esInjector.buffer = [];
        esClient.bulk(request, function (err) {
            if (err) {
                // a few random fails, pause 2 seconds and try again.
                setTimeout(function() {
                    esClient.bulk(request, function (err) {
                        if (err) {
                            dbLogger.logError({
                                message: "Unable to Index in bulk",
                                origin: "system.elastic.inject",
                                stack: err,
                                details: ""
                            });
                            cb();
                        } else {
                            cb();
                            console.log("ingested: " + request.body.length / 2);
                        }
                    });
                }, 2000);
            } else {
                console.log("ingested: " + request.body.length / 2);
                cb();
            }
        });
    };
}

exports.injectDataToIndex = function (indexName, indexMapping, dao, riverFunction, progress, cb) {
    var startTime = new Date().getTime();
    var indexType = Object.keys(indexMapping.mappings)[0];
    // start re-index all
    var injector = new EsInjector(esClient, indexName, indexType);
    var stream = dao.dao.getStream({archived: null});
    dao.count(function (totalCount) {
        stream.on('data', function (elt) {
            stream.pause();
            injector.queueDocument(riverFunction ? riverFunction(elt.toObject()) : elt.toObject(), function () {
                progress.count++;
                progress.total = totalCount;
                cb();
                stream.resume();
            });
        });
        stream.on('end', function () {
            injector.inject(function () {
                console.log("done ingesting in : " + (new Date().getTime() - startTime) / 1000 + " secs.");
                done();
            });
        });
    });
};

function createIndex(indexName, indexMapping, dao, riverFunction) {
    esClient.indices.exists({index: indexName}, function (error, doesIt) {
        if (doesIt) {
            console.log("index already exists.");
        }
        if (!doesIt) {
            console.log("creating index: " + indexName);
            esClient.indices.create({index: indexName, timeout: "10s", body: indexMapping},
                function (error) {
                    if (error) {
                        console.log("error creating index. " + error);
                    } else {
                         console.log("index Created");
                        exports.injectDataToIndex(indexName, indexMapping, dao, riverFunction, {})
                    }
                });
        }
    });
}

var daos = {
    "cde": {
        dao: require("../../cde/node-js/mongo-cde"),
        count: require("../../cde/node-js/mongo-cde").deCount
    },
    "form": {
        dao: require("../../form/node-js/mongo-form"),
        count: require("../../form/node-js/mongo-form").count
    },
    "board": {
        dao: require("../../cde/node-js/mongo-cde").boardsDao,
        count: require("../../cde/node-js/mongo-cde").boardCount
    },
    "storedQuery": {
        dao: require("./dbLogger").storedQueriesDao,
        count: require("./dbLogger").storedQueriesCount
    }
};
exports.daos = daos;

exports.initEs = function () {
    esInit.indices.forEach(function(i) {
        createIndex(i.indexName, i.indexJson, daos[i.name], i.filter);
    });
};

// pass index as defined in elasticSearchInit.indices
exports.reIndex = function (index, progress, done) {
    var indexName = index.indexName;
    var indexMapping = index.indexJson;
    var dao = daos[index.name];
    var riverFunction = index.filter;
    console.log("inject data into index: " + indexName);
    exports.injectDataToIndex(indexName, indexMapping, dao, riverFunction, progress, done)
};

exports.completionSuggest = function (term, cb) {
    var suggestQuery = {
        "search_suggest": {
            "text": term,
            "completion": {
                "field": "search_suggest"
            }
        }
    };
    esClient.suggest({
        index: config.elastic.storedQueryIndex.name,
        body: suggestQuery
    }, function(error, response) {
        if (error) {
            cb(error);
        } else {
            cb(response);
        }
    });
};

exports.buildElasticSearchQuery = function (user, settings) {
    this.escapeRegExp = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    var queryStuff = {size: settings.resultPerPage ? settings.resultPerPage : 20};
    var searchQ = settings.searchTerm;

    // Do not retrieve items marked as forks.
    queryStuff.query =
    {
        "bool": {
            "must_not": [{
                "term": {
                    "isFork": "true"
                }
            }]
        }
    };

    // Increase ranking score for high registration status
    var script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

    queryStuff.query.bool.must = [];

    queryStuff.query.bool.must.push({
        "dis_max": {
            "queries": [
                {"function_score": {"script_score": {"script": script}}}
            ]
        }
    });

    if (searchQ !== undefined && searchQ !== "") {
        // Search for the query term given by user
        queryStuff.query.bool.must[0].dis_max.queries[0].function_score.query =
        {
            "query_string": {
                "query": searchQ
            }
        };
        queryStuff.query.bool.must[0].dis_max.queries.push({function_score: {script_score: {script: script}}});
        // Boost rank if matches are on designation or definition
        queryStuff.query.bool.must[0].dis_max.queries[1].function_score.query =
        {
            "query_string": {
                "fields": ["primaryNameCopy^5", "primaryDefinitionCopy^2"]
                , "query": searchQ
            }
        };
        // Boost rank if we find exact string match, or if terms are in a less than 4 terms apart.
        queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2.5";
        if (searchQ.indexOf("\"") < 0) {
            queryStuff.query.bool.must[0].dis_max.queries.push({function_score: {script_score: {script: script}}});
            queryStuff.query.bool.must[0].dis_max.queries[2].function_score.query =
            {
                "query_string": {
                    "fields": ["primaryNameCopy^5", "primaryDefinitionCopy^2"]
                    , "query": "\"" + searchQ + "\"~4"
                }
            };
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2";
        }
    }
    else {
        //noinspection JSAnnotator
        queryStuff.sort = {"views": {order: "desc"}};
    }

    // Filter by selected org
    if (settings.selectedOrg !== undefined) {
        queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": settings.selectedOrg}});
    }
    if (settings.selectedOrgAlt !== undefined) {
        queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": settings.selectedOrgAlt}});
    }

    // Filter by selected Statuses
    var buildFilter = function (selectedStatuses) {
        var regStatusOr = [];
        selectedStatuses.forEach(function(regStatus) {
            regStatusOr.push({"term": {"registrationState.registrationStatus": regStatus}});
        });
        var filter = {and: []};
        if (regStatusOr.length > 0) {
            filter.and.push({"or": regStatusOr});
        }
        return filter;
    };

    settings.filter = buildFilter(settings.selectedStatuses);

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

    var flatSelection = settings.selectedElements?settings.selectedElements.join(";"):[];
    if (flatSelection !== "") {
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrg + ";" + flatSelection}});
    }

    var flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(";") : "";
    if (flatSelectionAlt !== "") {
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrgAlt + ";" + flatSelectionAlt}});
    }

    if (!settings.visibleStatuses || settings.visibleStatuses.length === 0) {
        settings.visibleStatuses = regStatusShared.statusList.map(function(s) { return s.name; });
    }

    var regStatusAggFilter = {
        "and": [
            {"or": []},
            {"not": {term: {"registrationState.registrationStatus": "Retired"}}}
        ]};
    settings.visibleStatuses.forEach(function(regStatus) {
        regStatusAggFilter.and[0].or.push({"term": {"registrationState.registrationStatus": regStatus}});
    });
    if (user) {
        usersvc.myOrgs(user).forEach(function(myOrg) {
            regStatusAggFilter.and[0].or.push({"term": {"stewardOrg.name": myOrg}});
        });
    }

    // Get aggregations on classifications and statuses
    if (settings.includeAggregations) {
        queryStuff.aggregations = {
            "orgs": {
                "filter": settings.filter,
                "aggregations": {
                    "orgs": {
                        "terms": {
                            "field": "classification.stewardOrg.name",
                            "size": 500,
                            "order": {
                                "_term": "desc"
                            }
                        }
                    }
                }
            },
            "statuses": {
                "filter": regStatusAggFilter,
                "aggregations": {
                    "statuses": {
                        "terms": {
                            "field": "registrationState.registrationStatus"
                        }
                    }
                }
            }
        };

        var flattenClassificationAggregations = function (variableName, orgVariableName, selectionString) {
            var flatClassifications = {
                "terms": {
                    "size": 500,
                    "field": "flatClassifications"
                }
            };
            if (selectionString === "") {
                flatClassifications.terms.include = settings[orgVariableName] + ";[^;]+";
            } else {
                flatClassifications.terms.include = settings[orgVariableName] + ';' + queryBuilder.escapeRegExp(selectionString) + ";[^;]+";
            }
            queryStuff.aggregations[variableName] = {
                "filter": settings.filter,
                "aggs": {}
            };
            queryStuff.aggregations[variableName].aggs[variableName] = flatClassifications;
        };
        if (settings.selectedOrg !== undefined) {
            flattenClassificationAggregations('flatClassifications', 'selectedOrg', flatSelection);
        }
        if (settings.selectedOrgAlt !== undefined) {
            flattenClassificationAggregations('flatClassificationsAlt', 'selectedOrgAlt', flatSelectionAlt);
        }
    }

    if (queryStuff.query.bool.must.length === 0) {
        delete queryStuff.query.bool.must;
    }

    queryStuff.from = (settings.page - 1) * settings.resultPerPage;

    // highlight search results if part of the following fields.
    queryStuff.highlight = {
        "order": "score"
        , "pre_tags": ["<strong>"]
        , "post_tags": ["</strong>"]
        , "fields": {
            "stewardOrgCopy.name": {}
            , "primaryNameCopy": {}
            , "primaryDefinitionCopy": {"number_of_fragments" : 1}
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

var searchTemplate = {
    cde: {
        index: config.elastic.index.name,
        type: "dataelement"
    },
    form: {
        index: config.elastic.formIndex.name,
        type: "form"
    }
};


exports.elasticsearch = function (query, type, cb) {
    var search = searchTemplate[type];
    search.body = query;
    esClient.search(search, function(error, response) {
        if (error) {
            if (response.statusCode === 400) {
                logging.errorLogger.error("Error: ElasticSearch Error",
                    {
                        origin: "system.elastic.elasticsearch", stack: error.stack,
                        details: JSON.stringify(query)
                    });
                cb("Invalid Query");
            } else {
                var querystr = "cannot stringify query";
                try {
                    querystr = JSON.stringify(query);
                } catch (e) {
                }
                logging.errorLogger.error("Error: ElasticSearch Error",
                    {
                        origin: "system.elastic.elasticsearch", stack: error.stack,
                        details: "query " + querystr
                    });
                cb("Server Error");
            }
        } else {
            if (response.hits.total === 0 && config.name.indexOf("Production") === -1) {
                console.log("No response. QUERY: " + JSON.stringify(query));
                console.log("----");
            }

            var result = {
                totalNumber: response.hits.total
                , maxScore: response.hits.max_score
                , took: response.took
            };
            result[type + 's'] = [];
            for (var i = 0; i < response.hits.hits.length; i++) {
                var thisCde = response.hits.hits[i]._source;
                thisCde.score = response.hits.hits[i]._score;
                if (thisCde.valueDomain && thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                thisCde.properties = [];
                thisCde.flatProperties = [];
                thisCde.highlight = response.hits.hits[i].highlight;
                result[type + 's'].push(thisCde);
            }
            result.aggregations = response.aggregations;
            cb(null, result);
        }
    });
};

var lock = false;

exports.elasticSearchExport = function (dataCb, query, type) {
    if (lock) return dataCb("Servers busy");

    lock = true;

    query.size = 500;
    delete query.aggregations;

    var search = JSON.parse(JSON.stringify(searchTemplate[type]));
    search.scroll = '1m';
    search.search_type = 'scan';
    search.body = query;

    var scrollThrough = function (scrollId) {
        esClient.scroll({scrollId: scrollId, scroll: '1m'},
            function (err, response) {
                if (err) {
                    lock = false;
                    logging.errorLogger.error("Error: Elastic Search Scroll Access Error",
                        {
                            origin: "system.elastic.elasticsearch", stack: new Error().stack
                        });
                    dataCb("ES Error");
                } else {
                    var newScrollId = response._scroll_id;
                    if (response.hits.hits.length === 0) {
                        lock = false;
                        dataCb();
                    }
                    else {
                        for (var i = 0; i < response.hits.hits.length; i++) {
                            var thisCde = response.hits.hits[i]._source;
                            dataCb(null, thisCde);
                        }
                        scrollThrough(newScrollId);
                    }
                }
        });
    };

    esClient.search(search, function (err, response) {
        if (err) {
            lock = false;
            logging.errorLogger.error("Error: Elastic Search Scroll Query Error",
                {
                    origin: "system.elastic.elasticsearch", stack: new Error().stack,
                    details: ", query: " + query
                });
            dataCb("ES Error");
        } else {
            scrollThrough(response._scroll_id);
        }
    });

};
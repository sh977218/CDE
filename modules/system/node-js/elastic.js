var async = require('async')
    , config = require('./parseConfig')
    , logging = require('./logging')
    , regStatusShared = require('../shared/regStatusShared') //jshint ignore:line
    , usersvc = require("./usersrvc")
    , elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    , dbLogger = require('../../system/node-js/dbLogger.js')
    , mongo_cde = require("../../cde/node-js/mongo-cde")
    , mongo_form = require("../../form/node-js/mongo-form")
    , mongo_board = require("../../board/node-js/mongo-board")
    , mongo_storedQuery = require("../../cde/node-js/mongo-storedQuery")
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
    delete elt.flatMeshSimpleTrees;
    delete elt.flatMeshTrees;
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

exports.daoMap = {
    "cde": {
        condition: {archived: false},
        dao: mongo_cde
    },
    "form": {
        condition: {archived: false},
        dao: mongo_form
    },
    "board": {
        condition: {archived: null},
        dao: mongo_board
    },
    "storedQuery": {
        condition: {archived: null},
        dao: mongo_storedQuery
    }
};


exports.reIndex = function (index, cb) {
    var riverFunction = index.filter;
    if (!riverFunction) {
        riverFunction = function (elt, cb) {
            cb(elt);
        };
    }
    var startTime = new Date().getTime();
    var indexType = Object.keys(index.indexJson.mappings)[0];
    // start re-index all
    var injector = new EsInjector(esClient, index.indexName, indexType);
    var condition = exports.daoMap[index.name].condition;
    index.count = 0;
    exports.daoMap[index.name].dao.count(condition, function (err, totalCount) {
        if (err) {
            console.log("Error getting count: " + err);
        }
        console.log("Total count for " + index.name + " is " + totalCount);
        index.totalCount = totalCount;
        var stream = exports.daoMap[index.name].dao.getStream(condition);
        stream.on('data', function (elt) {
            stream.pause();
            riverFunction(elt.toObject(), function (afterRiverElt) {
                injector.queueDocument(afterRiverElt, function () {
                    index.count++;
                    stream.resume();
                });
            });
        });
        stream.on('end', function () {
            injector.inject(function () {
                console.log("done ingesting " + index.name + " in : " + (new Date().getTime() - startTime) / 1000 + " secs.");
                if (cb) cb();
            });
        });
        stream.on('error', function(err) {
           console.log("Error getting stream: " + err);
        });
    });
};

function createIndex(index, cb) {
    var indexName = index.indexName;
    var indexMapping = index.indexJson;
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
                        exports.reIndex(index, cb);
                    }
                });
        }
    });
}

exports.initEs = function (cb) {
    async.forEach(esInit.indices, function (index, doneOneIndex) {
        createIndex(index, doneOneIndex);
    }, function doneAllIndices() {
        if (cb) cb();
    });
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


    // last resort, we sort.
    var sort = true;

    queryStuff.query.bool.must = [];

    if (searchQ !== undefined && searchQ !== "") {
        sort = false;
        // Increase ranking score for high registration status
        var script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";
        queryStuff.query.bool.must.push({
            "dis_max": {
                "queries": [
                    {"function_score": {"script_score": {"script": script}}}
                ]
            }
        });

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

    // Filter by selected org
    if (settings.selectedOrg !== undefined) {
        queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": settings.selectedOrg}});
    }
    if (settings.selectedOrgAlt !== undefined) {
        queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": settings.selectedOrgAlt}});
    }

    // filter by topic
    if (settings.meshTree) {
        sort = false;
        // boost for those with fewer mesh trees
        var flatMeshScript = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) / (doc['flatMeshTrees'].values.size() + 1) ";
        queryStuff.query.bool.must.push({
            "dis_max": {
                "queries": [
                    {"function_score": {"script_score": {"script": flatMeshScript}}}
                ]
            }
        });
        queryStuff.query.bool.must.push({term: {"flatMeshTrees": settings.meshTree}});
    }

    // Filter by selected Statuses
    var buildFilter = function (selectedStatuses) {
        var regStatusOr = [];
        selectedStatuses.forEach(function(regStatus) {
            regStatusOr.push({"term": {"registrationState.registrationStatus": regStatus}});
        });


        if (user ) {
            var curatorOf = [].concat(user.orgAdmin).concat(user.orgCurator);
            curatorOf.forEach(function (o) {
                regStatusOr.push({"term": {"stewardOrg": o}});
            });
        }

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
        sort = false;
        // boost for those elts classified fewer times
        var flatClassifScript = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) / (doc['flatClassifications'].values.size() + 1) ";
        queryStuff.query.bool.must.push({
            "dis_max": {
                "queries": [
                    {"function_score": {"script_score": {"script": flatClassifScript}}}
                ]
            }
        });
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrg + ";" + flatSelection}});
    }

    var flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(";") : "";
    if (flatSelectionAlt !== "") {
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrgAlt + ";" + flatSelectionAlt}});
    }

    if (!settings.visibleStatuses || settings.visibleStatuses.length === 0) {
        settings.visibleStatuses = regStatusShared.orderedList;
    }

    // show statuses that either you selected, or it's your org and it's not retired.
    var regStatusAggFilter = {
        "or": [
            {"or": []} // any status you select,
        ]
    };

    settings.visibleStatuses.forEach(function(regStatus) {
        regStatusAggFilter.or[0].or.push({"term": {"registrationState.registrationStatus": regStatus}});
    });
    if (usersvc.myOrgs(user).length > 0) {
        var and = {"and": [
            {or: []}, // your org
            {"not": {term: {"registrationState.registrationStatus": "Retired"}}}
        ]};
        regStatusAggFilter.or.push(and);

        usersvc.myOrgs(user).forEach(function(myOrg) {
            and.and[0].or.push({"term": {"stewardOrg.name": myOrg}});
        });
    }

    if (sort) {
        //noinspection JSAnnotator
        queryStuff.sort = {
            "views": {
                order: 'desc'
            }
        };
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

        queryStuff.aggregations.meshTrees = {
            "filter": settings.filter,
            aggs: {
                "meshTrees": {
                    terms: {
                        size: 50,
                        field: "flatMeshTrees",
                        include: "[^;]+"
                    }
                }
            }
        };

        if (settings.meshTree && settings.meshTree.length > 0) {
            queryStuff.aggregations.meshTrees.aggs.meshTrees.terms.include = queryBuilder.escapeRegExp(settings.meshTree) + ";[^;]+";
        }

        queryStuff.aggregations.twoLevelMesh = {
            "filter": settings.filter,
            aggs: {
                twoLevelMesh: {
                    terms: {
                        size: 500,
                        field: "flatMeshTrees",
                        //include: "[^;]+"
                        include: "[^;]+;[^;]+"
                    }
                }
            }
        };

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

exports.syncWithMesh = function(allMappings) {
    exports.meshSyncStatus = {
        dataelement: {done: 0},
        form: {done: 0}
    };

    var classifToTrees = {};
    allMappings.forEach(function(m) {
        // from a;b;c to a a;b a;b;c
        classifToTrees[m.flatClassification] = [];
        m.flatTrees.forEach(function (treeNode) {
            classifToTrees[m.flatClassification].push(treeNode);
            while(treeNode.indexOf(";") > -1) {
                treeNode = treeNode.substr(0, treeNode.lastIndexOf(";"));
                classifToTrees[m.flatClassification].push(treeNode);
            }
        });
    });

    var classifToSimpleTrees = {};
    allMappings.forEach(function(m) {
        classifToSimpleTrees[m.flatClassification] = m.flatTrees;
    });

    var searches = [JSON.parse(JSON.stringify(searchTemplate.cde)), JSON.parse(JSON.stringify(searchTemplate.form))];
    searches.forEach(function (search) {
        search.scroll = '1m';
        search.search_type = 'scan';
        search.body = {};
    });

    var scrollThrough = function (scrollId, s) {
        esClient.scroll({scrollId: scrollId, scroll: '1m'},
            function (err, response) {
                if (err) {
                    lock = false;
                    logging.errorLogger.error("Error: Elastic Search Scroll Access Error",
                        {
                            origin: "system.elastic.syncWithMesh", stack: new Error().stack
                        });
                } else {
                    var newScrollId = response._scroll_id;
                    exports.meshSyncStatus[s.type].total = response.hits.total;
                    if (response.hits.hits.length > 0) {
                        response.hits.hits.forEach(function (hit) {
                            var thisElt = hit._source;
                            var trees = new Set();
                            var simpleTrees = new Set();
                            if (!thisElt.flatClassifications) thisElt.flatClassifications = [];
                            thisElt.flatClassifications.forEach(function (fc) {
                                if (classifToTrees[fc]) {
                                    classifToTrees[fc].forEach(function (node) {
                                        trees.add(node);
                                    });
                                }
                                if (classifToSimpleTrees[fc]) {
                                    classifToSimpleTrees[fc].forEach(function (node) {
                                        simpleTrees.add(node);
                                    });
                                }
                            });
                            if (trees.size > 0) {
                                esClient.update({
                                    index: s.index,
                                    type: s.type,
                                    id: thisElt.tinyId,
                                    body: {
                                        doc: {
                                            flatMeshTrees: Array.from(trees),
                                            flatMeshSimpleTrees: Array.from(simpleTrees)
                                        }
                                    }
                                }, function (err) {
                                    if (err) console.log("ERR: " + err);
                                });
                            }
                            exports.meshSyncStatus[s.type].done++;
                        });
                        scrollThrough(newScrollId, s);
                    } else {
                        console.log("done syncing " + s.index + " with MeSH");
                    }
                }
            });
    };

    searches.forEach(function (search) {
        esClient.search(search, function (err, response) {
            if (err) {
                lock = false;
                logging.errorLogger.error("Error: Elastic Search Scroll Query Error",
                    {
                        origin: "system.elastic.syncWithMesh", stack: new Error().stack,
                        details: ""
                    });
            } else {
                scrollThrough(response._scroll_id, search);
            }
        });
    })

};


exports.elasticsearch = function (query, type, cb) {
    var search = searchTemplate[type];
    if (!search) return cb("Invalid query");
    search.body = query;
    esClient.search(search, function(error, response) {
        if (error) {
            if (response.status === 400) {
                if (response.error.type !== 'search_phase_execution_exception') {
                    logging.errorLogger.error("Error: ElasticSearch Error",
                        {
                            origin: "system.elastic.elasticsearch", stack: error.stack,
                            details: JSON.stringify(query)
                        });
                }
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

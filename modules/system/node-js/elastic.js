const async = require('async')
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
    , noDbLogger = require("../../system/node-js/noDbLogger")
    ;

let esClient = new elasticsearch.Client({
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
    let _esInjector = this;
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
        let request = {
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
                            dbLogger.consoleLog("ingested: " + request.body.length / 2);
                        }
                    });
                }, 2000);
            } else {
                dbLogger.consoleLog("ingested: " + request.body.length / 2);
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
        condition: {},
        dao: mongo_board
    },
    "storedQuery": {
        condition: {},
        dao: mongo_storedQuery
    }
};


exports.reIndex = function (index, cb) {
    let riverFunction = index.filter;
    if (!riverFunction) {
        riverFunction = function (elt, cb) {
            cb(elt);
        };
    }
    let startTime = new Date().getTime();
    let indexType = Object.keys(index.indexJson.mappings)[0];
    // start re-index all
    let injector = new EsInjector(esClient, index.indexName, indexType);
    let condition = exports.daoMap[index.name].condition;
    index.count = 0;
    exports.daoMap[index.name].dao.count(condition, function (err, totalCount) {
        if (err) {
            dbLogger.consoleLog("Error getting count: " + err, 'error');
        }
        dbLogger.consoleLog("Total count for " + index.name + " is " + totalCount);
        index.totalCount = totalCount;
        let stream = exports.daoMap[index.name].dao.getStream(condition);
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
                noDbLogger.noDbLogger.info("done ingesting " + index.name + " in : " + (new Date().getTime() - startTime) / 1000 + " secs.");
                dbLogger.consoleLog("done ingesting " + index.name + " in : " + (new Date().getTime() - startTime) / 1000 + " secs.");
                if (cb) cb();
            });
        });
        stream.on('error', function(err) {
            dbLogger.consoleLog("Error getting stream: " + err);
        });
    });
};

function createIndex(index, cb) {
    let indexName = index.indexName;
    let indexMapping = index.indexJson;
    esClient.indices.exists({index: indexName}, function (error, doesIt) {
        if (doesIt) {
            dbLogger.consoleLog("index already exists.");
        }
        if (!doesIt) {
            dbLogger.consoleLog("creating index: " + indexName);
            esClient.indices.create({index: indexName, timeout: "10s", body: indexMapping},
                function (error) {
                    if (error) {
                        dbLogger.consoleLog("error creating index. " + error, 'error');
                    } else {
                        dbLogger.consoleLog("index Created");
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
    let suggestQuery = {
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
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    // Increase ranking score for high registration status
    let script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

    // Search for the query term given by user
    let hasSearchTerm = settings.searchTerm !== undefined && settings.searchTerm !== "";

    // last resort, we sort.
    let sort = !hasSearchTerm;

    (function setFilters() {
        // Filter by selected Statuses
        let filterRegStatusTerms = settings.selectedStatuses.map(regStatus => {
            return {"term": {"registrationState.registrationStatus": regStatus}};
        });

        // Filter by Steward
        if (user) {
            let curatorOf = [].concat(user.orgAdmin).concat(user.orgCurator);
            filterRegStatusTerms = filterRegStatusTerms.concat(curatorOf.map(o => {
                return {"term": {"stewardOrg": o}};
            }));
        }

        // Filter by selected Datatypes
        let filterDatatypeTerms = settings.selectedDatatypes && settings.selectedDatatypes.map(datatype => {
            return {"term": {"valueDomain.datatype": datatype}};
        });

        settings.filter = {
            bool: {
                filter: [
                    {bool: {should: filterDatatypeTerms}},
                    {bool: {should: filterRegStatusTerms}}
                ]
            }
        };
        settings.filterDatatype = {
            bool: {should: filterRegStatusTerms}
        };
    })();


    let queryStuff = {
        post_filter: settings.filter,
        query: {
            // Do not retrieve items marked as forks.
            bool: {
                must_not: [{
                    term: {
                        isFork: "true"
                    }
                }],
                must: [
                    {
                        dis_max: {
                            queries: [
                                {
                                    function_score: {
                                        query: hasSearchTerm ? {
                                                query_string: {
                                                    analyze_wildcard: true,
                                                    query: settings.searchTerm
                                                }
                                            } : undefined,
                                        script_score: {script: script}
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        size: settings.resultPerPage ? settings.resultPerPage : 20
    };

    if (hasSearchTerm) {
        queryStuff.query.bool.must[0].dis_max.queries.push({
            function_score: {
                boost: "2.5",
                query: { // Boost rank if matches are on designation or definition
                    query_string: {
                        fields: ["primaryNameCopy^5", "primaryDefinitionCopy^2"],
                        analyze_wildcard: true,
                        query: settings.searchTerm
                    }
                },
                script_score: {script: script}
            }
        });

        // Boost rank if we find exact string match, or if terms are in a less than 4 terms apart.
        if (settings.searchTerm.indexOf("\"") < 0) {
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2";
            queryStuff.query.bool.must[0].dis_max.queries.push({
                function_score: {
                    query: {
                        "query_string": {
                            "fields": ["primaryNameCopy^5", "primaryDefinitionCopy^2"],
                            "analyze_wildcard": true,
                            "query": "\"" + settings.searchTerm + "\"~4"
                        }
                    },
                    script_score: {script: script}
                }
            });
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
        queryStuff.query.bool.must.push({
            dis_max: {
                queries: [{
                    function_score: {
                        script_score: {
                            script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) / (doc['flatMeshTrees'].values.size() + 1)"
                        }
                    }
                }]
            }
        });
        queryStuff.query.bool.must.push({term: {flatMeshTrees: settings.meshTree}});
    }

    let flatSelection = settings.selectedElements?settings.selectedElements.join(";"):[];
    if (flatSelection !== "") {
        sort = false;
        // boost for those elts classified fewer times
        queryStuff.query.bool.must.push({
            dis_max: {
                queries: [{
                    function_score: {
                        script_score: {
                            script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) / (doc['flatClassifications'].values.size() + 1)"
                        }
                    }
                }]
            }
        });
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrg + ";" + flatSelection}});
    }

    let flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(";") : "";
    if (flatSelectionAlt !== "") {
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrgAlt + ";" + flatSelectionAlt}});
    }

    if (!settings.visibleStatuses || settings.visibleStatuses.length === 0)
        settings.visibleStatuses = regStatusShared.orderedList;

    // show statuses that either you selected, or it's your org and it's not retired.
    let regStatusAggFilter = {"bool": {"should": [
        {
            "bool": {
                "should": settings.visibleStatuses.map(regStatus => {return {"term": {"registrationState.registrationStatus": regStatus}};})
            }
        }
    ]}};
    if (usersvc.myOrgs(user).length > 0)
        regStatusAggFilter.bool.should.push({
            "bool": {
                "must_not": {term: {"registrationState.registrationStatus": "Retired"}},
                "should": usersvc.myOrgs(user).map(org => {return {"term": {"stewardOrg.name": org}};})
            }
        });

    if (sort) {
        //noinspection JSAnnotator
        queryStuff.sort = {
            "_score" : 'desc',
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
                "aggs": {
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
                "aggs": {
                    "statuses": {
                        "terms": {
                            "field": "registrationState.registrationStatus"
                        }
                    }
                }
            }
        };

        let flattenClassificationAggregations = function (variableName, orgVariableName, selectionString) {
            let flatClassifications = {
                "terms": {
                    "size": 500,
                    "field": "flatClassifications"
                }
            };
            if (selectionString === "") {
                flatClassifications.terms.include = settings[orgVariableName] + ";[^;]+";
            } else {
                flatClassifications.terms.include = settings[orgVariableName] + ';' + escapeRegExp(selectionString) + ";[^;]+";
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
            queryStuff.aggregations.meshTrees.aggs.meshTrees.terms.include = escapeRegExp(settings.meshTree) + ";[^;]+";
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
    if (!queryStuff.from)
        queryStuff.from = 0;

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

let searchTemplate = {
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

    let classifToTrees = {};
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

    let classifToSimpleTrees = {};
    allMappings.forEach(function(m) {
        classifToSimpleTrees[m.flatClassification] = m.flatTrees;
    });

    let searches = [JSON.parse(JSON.stringify(searchTemplate.cde)), JSON.parse(JSON.stringify(searchTemplate.form))];
    searches.forEach(search => {
        search.scroll = '1m';
        search.body = {};
    });

    let scrollThrough = function (scrollId, s) {
        esClient.scroll({scrollId: scrollId, scroll: '1m'}, (err, response) => {
            if (err) {
                lock = false;
                logging.errorLogger.error("Error: Elastic Search Scroll Access Error",
                    {origin: "system.elastic.syncWithMesh", stack: new Error().stack});
            } else {
                let newScrollId = response._scroll_id;
                exports.meshSyncStatus[s.type].total = response.hits.total;
                if (response.hits.hits.length > 0) {
                    let request = {body: []};
                    response.hits.hits.forEach(hit => {
                        let thisElt = hit._source;
                        let trees = new Set();
                        let simpleTrees = new Set();
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
                            request.body.push({
                                update: {
                                    _index: s.index,
                                    _type: s.type,
                                    _id: thisElt.tinyId
                                }});
                            request.body.push({doc: {
                                    flatMeshTrees: Array.from(trees),
                                    flatMeshSimpleTrees: Array.from(simpleTrees)
                                }
                            });
                        }
                        exports.meshSyncStatus[s.type].done++;
                    });
                    if (request.body.length > 0) {
                        esClient.bulk(request, err => {
                            if (err) dbLogger.consoleLog("ERR: " + err, 'error');
                            scrollThrough(newScrollId, s);
                        });
                    } else {
                        scrollThrough(newScrollId, s);
                    }
                } else {
                    dbLogger.consoleLog("done syncing " + s.index + " with MeSH");
                }
            }
        });
    };

    searches.forEach(search => {
        esClient.search(search, (err, response) => {
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
    });

};


exports.elasticsearch = function (query, type, cb) {
    let search = searchTemplate[type];
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
                let querystr = "cannot stringify query";
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
            if (response.hits.total === 0 && config.name.indexOf("Prod") === -1) {
                dbLogger.consoleLog("No response. QUERY: " + JSON.stringify(query), 'debug');
            }

            let result = {
                totalNumber: response.hits.total
                , maxScore: response.hits.max_score
                , took: response.took
            };
            result[type + 's'] = [];
            for (let i = 0; i < response.hits.hits.length; i++) {
                let thisCde = response.hits.hits[i]._source;
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

let lock = false;

exports.elasticSearchExport = function (dataCb, query, type) {
    if (lock) return dataCb("Servers busy");

    lock = true;

    query.size = 500;
    delete query.aggregations;

    let search = JSON.parse(JSON.stringify(searchTemplate[type]));
    search.scroll = '1m';
    search.body = query;

    function scrollThrough(response) {
        esClient.scroll({scrollId: response._scroll_id, scroll: '1m'},
            function (err, response) {
                if (err) {
                    lock = false;
                    logging.errorLogger.error("Error: Elastic Search Scroll Access Error",
                        {
                            origin: "system.elastic.elasticsearch", stack: new Error().stack
                        });
                    dataCb("ES Error");
                } else {
                    processScroll(response);
                }
            }
        );
    }

    function processScroll(response) {
        if (response.hits.hits.length === 0) {
            lock = false;
            dataCb();
        }
        else {
            for (let i = 0; i < response.hits.hits.length; i++) {
                let thisCde = response.hits.hits[i]._source;
                dataCb(null, thisCde);
            }
            scrollThrough(response);
        }
    }

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
            processScroll(response);
        }
    });
};

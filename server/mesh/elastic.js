const _ = require('lodash');
const ElasticSearch = require('elasticsearch');
const config = require('../system/parseConfig');
const meshDb = require('./meshDb');
const logging = require('../system/logging');
const dbLogger = require('../log/dbLogger.js');

let esClient = new ElasticSearch.Client({
    hosts: config.elastic.hosts
});

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

exports.syncWithMesh = function () {
    meshDb.findAll((err, allMappings) => doSyncWithMesh(allMappings));
};

let lock = false;

function doSyncWithMesh(allMappings) {
    exports.meshSyncStatus = {
        dataelement: {done: 0},
        form: {done: 0}
    };

    let classifToTrees = {};
    allMappings.forEach(mapping => {
        // from a;b;c to a a;b a;b;c
        classifToTrees[mapping.flatClassification] = [];
        mapping.flatTrees.forEach(treeNode => {
            classifToTrees[mapping.flatClassification].push(treeNode);
            while (treeNode.indexOf(";") > -1) {
                treeNode = treeNode.substr(0, treeNode.lastIndexOf(";"));
                classifToTrees[mapping.flatClassification].push(treeNode);
            }
        });
    });

    let classifToSimpleTrees = {};
    allMappings.forEach(m => classifToSimpleTrees[m.flatClassification] = m.flatTrees);

    let searches = [_.cloneDeep(searchTemplate.cde), _.cloneDeep(searchTemplate.form)];
    searches.forEach(search => {
        search.scroll = '1m';
        search.body = {};
    });

    let scrollThrough = function (scrollId, s) {
        esClient.scroll({scrollId: scrollId, scroll: '1m'}, (err, response) => {
            if (err) {
                lock = false;
                logging.errorLogger.error("Error: Elastic Search Scroll Access Error",
                    {origin: "system.elastic.syncWithMesh", stack: err.stack});
            } else {
                let newScrollId = response._scroll_id;
                processScroll(newScrollId, s, response);
            }
        });
    };

    function processScroll(newScrollId, s, response) {
        exports.meshSyncStatus[s.type].total = response.hits.total;
        if (response.hits.hits.length > 0) {
            let request = {body: []};
            response.hits.hits.forEach(hit => {
                let thisElt = hit._source;
                let trees = new Set();
                let simpleTrees = new Set();
                if (!thisElt.flatClassifications) thisElt.flatClassifications = [];
                thisElt.flatClassifications.forEach(fc => {
                    if (classifToTrees[fc]) {
                        classifToTrees[fc].forEach(node => trees.add(node));
                    }
                    if (classifToSimpleTrees[fc]) {
                        classifToSimpleTrees[fc].forEach(node => simpleTrees.add(node));
                    }
                });
                if (trees.size > 0) {
                    request.body.push({
                        update: {
                            _index: s.index,
                            _type: s.type,
                            _id: thisElt.tinyId
                        }
                    });
                    request.body.push({
                        doc: {
                            flatMeshTrees: Array.from(trees),
                            flatMeshSimpleTrees: Array.from(simpleTrees)
                        }
                    });
                }
                exports.meshSyncStatus[s.type].done++;
            });
            if (request.body.length > 0)
                esClient.bulk(request, err => {
                    if (err) dbLogger.consoleLog("ERR: " + err, 'error');
                    scrollThrough(newScrollId, s);
                });
            else scrollThrough(newScrollId, s);
        } else dbLogger.consoleLog("done syncing " + s.index + " with MeSH");
    }

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
                processScroll(response._scroll_id, search, response);
            }
        });
    });

}
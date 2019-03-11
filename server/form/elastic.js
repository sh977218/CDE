const config = require('../system/parseConfig');
const dbLogger = require('../log/dbLogger.js');
const elasticsearch = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

let esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.updateOrInsert = function (elt) {
    esInit.riverFunction(elt.toObject(), doc => {
        if (doc) {
            delete doc._id;
            esClient.index({
                index: config.elastic.formIndex.name,
                type: "form",
                id: doc.tinyId,
                body: doc
            }, err => {
                if (err) {
                    dbLogger.logError({
                        message: "Unable to Re-Index document: " + doc.tinyId,
                        origin: "form.elastic.updateOrInsert",
                        stack: err,
                        details: ""
                    });
                }
            });
            esInit.suggestRiverFunction(elt, sugDoc => {
                esClient.index({
                    index: config.elastic.formSuggestIndex.name,
                    type: "suggest",
                    id: doc.tinyId,
                    body: sugDoc
                })
            });

        }
    });
};

exports.byTinyIdList = function (idList, size, cb) {
    idList = idList.filter(id => !!id);
    esClient.search({
        index: config.elastic.formIndex.name,
        type: "form",
        body: {
            "query": {
                "ids": {
                    "values": idList
                }
            },
            "size": size
        }
    }, function (error, response) {
        if (error) {
            dbLogger.errorLogger.error("Error FormDistinct", {
                origin: "form.elastic.byTinyIdList",
                stack: new Error().stack,
                details: "Error " + error + "response" + JSON.stringify(response)
            });
            cb(error);
        } else {
            // @TODO possible to move this sort to elastic search?
            response.hits.hits.sort((a, b) => {
                return idList.indexOf(a._id) - idList.indexOf(b._id);
            });
            cb(null, response.hits.hits.map(h => h._source));
        }
    });
};

exports.FormDistinct = function (field, cb) {
    let distinctQuery = {
        "size": 0,
        "aggs": {
            "aggregationsName": {
                "terms": {
                    "field": field,
                    "size": 1000
                }
            }
        }
    };
    esClient.search({
        index: config.elastic.index.name,
        type: "form",
        body: distinctQuery
    }, function (error, response) {
        if (error) {
            dbLogger.errorLogger.error("Error FormDistinct", {
                origin: "cde.elastic.FormDistinct",
                stack: new Error().stack,
                details: "query " + JSON.stringify(distinctQuery) + "error " + error + "response" + JSON.stringify(response)
            });
        } else {
            cb(response.aggregations.aggregationsName.buckets.map(b => b.key));
        }
    });
};

exports.syncLinkedFormsProgress = {done: 0, todo: 0};

async function syncLinkedForms () {
    exports.syncLinkedFormsProgress = {done: 0, todo: 0};
    const cdeCursor = mongo_cde.getStream({archived: false});
    exports.syncLinkedFormsProgress.todo = await mongo_cde.count({archived: false});
    for (let cde = await cdeCursor.next(); cde != null; cde = await cdeCursor.next()) {
        let esResult = await elastic.esClient.search({
            index: config.elastic.formIndex.name,
            q: cde.tinyId,
            size: 200
        });

        const linkedForms = {
            "Retired": 0,
            "Incomplete": 0,
            "Candidate": 0,
            "Recorded": 0,
            "Qualified": 0,
            "Standard": 0,
            "Preferred Standard": 0,
            "forms": []
        };

        esResult.hits.hits.forEach(h => {
            linkedForms.forms.push({
                tinyId: h._source.tinyId,
                registrationStatus: h._source.registrationState.registrationStatus,
                primaryName: h._source.primaryNameCopy
            });
            linkedForms[h._source.registrationState.registrationStatus]++;
        });

        linkedForms.Standard += linkedForms["Preferred Standard"];
        linkedForms.Qualified += linkedForms.Standard;
        linkedForms.Recorded += linkedForms.Qualified;
        linkedForms.Candidate += linkedForms.Recorded;
        linkedForms.Incomplete += linkedForms.Candidate;
        linkedForms.Retired += linkedForms.Incomplete;

        await elastic.esClient.update({
            index: config.elastic.index.name,
            type: "dataelement",
            id: cde.tinyId,
            body: {doc: {linkedForms: linkedForms}}
        });
        exports.syncLinkedFormsProgress.done++;
    }
}

exports.syncLinkedForms = syncLinkedForms;


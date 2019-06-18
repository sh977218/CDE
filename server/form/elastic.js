const _ = require('lodash');
const config = require('../system/parseConfig');
const dbLogger = require('../log/dbLogger.js');
const elasticsearch = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

let esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.updateOrInsert = function (elt, cb = _.noop) {
    esInit.riverFunction(elt.toObject(), doc => {
        if (doc) {
            let doneCount = 0;
            let doneError;
            const done = err => {
                if (err) {
                    dbLogger.logError({
                        message: 'Unable to Index document: ' + doc.tinyId,
                        origin: 'form.elastic.updateOrInsert',
                        stack: err,
                        details: ""
                    });
                }
                if (doneCount >= 1) {
                    cb(err || doneError);
                    return;
                }
                doneCount++;
                doneError = err;
            };
            delete doc._id;
            esClient.index({
                index: config.elastic.formIndex.name,
                type: 'form',
                id: doc.tinyId,
                body: doc
            }, done);
            esInit.suggestRiverFunction(elt, sugDoc => {
                esClient.index({
                    index: config.elastic.formSuggestIndex.name,
                    type: 'suggest',
                    id: doc.tinyId,
                    body: sugDoc
                }, done);
            });
        } else {
            cb();
        }
    });
};

exports.byTinyIdList = function (idList, size, cb) {
    idList = idList.filter(id => !!id);
    esClient.search({
        index: config.elastic.formIndex.name,
        type: 'form',
        body: {
            query: {
                ids: {
                    values: idList
                }
            },
            size: size
        }
    }, (error, response) => {
        if (error) {
            dbLogger.errorLogger.error('Error Form.byTinyIdList', {
                origin: 'form.elastic.byTinyIdList',
                stack: new Error().stack,
                details: 'Error ' + error + 'response' + JSON.stringify(response)
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

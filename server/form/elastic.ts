import { config } from '../system/parseConfig';
import { forwardError, handleError } from 'server/errorHandler/errorHandler';

const dbLogger = require('../log/dbLogger');
const elasticsearch = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

const esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

export function updateOrInsert(elt) {
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
                        details: ''
                    });
                }
                if (doneCount >= 1) {
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
        }
    });
}

export function byTinyIdList(idList, size, cb) {
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
            size
        }
    }, forwardError(cb, response => {
        // @TODO possible to move this sort to elastic search?
        response.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
        cb(null, response.hits.hits.map(h => h._source));
    }));
}

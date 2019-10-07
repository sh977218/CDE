import { splitError } from 'server/errorHandler/errorHandler';
import { CdeFormDocument } from 'server/form/mongo-form';
import { config } from 'server/system/parseConfig';
import { CdeFormElastic } from 'shared/form/form.model';
import { CbError, ElasticQueryResponseForm } from 'shared/models.model';

const dbLogger = require('../log/dbLogger');
const elasticsearch = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

const esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

export function updateOrInsert(elt: CdeFormDocument) {
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

export function byTinyIdList(idList: string[], size: number, cb: CbError<CdeFormElastic[]>) {
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
    }, splitError<ElasticQueryResponseForm>(cb, response => {
        // @TODO possible to move this sort to elastic search?
        if (!response) {
            cb(undefined, []);
            return;
        }
        response.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
        cb(undefined, response.hits.hits.map(h => h._source));
    }));
}

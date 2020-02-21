import { splitError } from 'server/errorHandler/errorHandler';
import { logError } from 'server/log/dbLogger';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { config } from 'server/system/parseConfig';
import { CdeFormElastic } from 'shared/form/form.model';
import { CbError } from 'shared/models.model';
import { esClient } from 'server/system/elastic';

export function updateOrInsert(elt) {
    riverFunction(elt.toObject(), doc => {
        if (doc) {
            let doneCount = 0;
            let doneError;
            const done = err => {
                if (err) {
                    logError({
                        message: 'Unable to Index document: ' + doc.elementType + ' ' + doc.tinyId,
                        origin: 'form.elastic.updateOrInsert',
                        stack: err.toString(),
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
                type: '_doc',
                id: doc.tinyId,
                body: doc
            }, done);
            suggestRiverFunction(elt, sugDoc => {
                esClient.index({
                    index: config.elastic.formSuggestIndex.name,
                    type: '_doc',
                    id: doc.tinyId,
                    body: sugDoc
                }, done);
            });
        }
    });
}

export function byTinyIdList(idList: string[], size: number, cb: CbError<CdeFormElastic[]>) {
    idList = idList.filter(id => !!id);
    // @ts-ignore
    esClient.search({
            index: config.elastic.formIndex.name,
            body: {
                query: {
                    ids: {
                        values: idList
                    }
                },
                size
            }
        },
        // @ts-ignore
        splitError(cb, response => {
            // @TODO possible to move this sort to elastic search?
            if (!response) {
                cb(undefined, []);
                return;
            }
            // @ts-ignore
            response.body.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
            // @ts-ignore
            cb(undefined, response.body.hits.hits.map(h => h._source));
        }));
}

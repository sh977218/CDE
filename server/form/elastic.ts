import { splitError } from 'server/errorHandler/errorHandler';
import { CdeFormDocument } from 'server/form/mongo-form';
import { logError } from 'server/log/dbLogger';
import { esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { config } from 'server/system/parseConfig';
import { CdeFormElastic } from 'shared/form/form.model';
import { CbError1, ElasticQueryResponse } from 'shared/models.model';

export function updateOrInsert(elt: CdeFormDocument) {
    riverFunction(elt.toObject(), doc => {
        if (doc) {
            let doneCount = 0;
            let doneError;
            const done = (err: Error | null) => {
                /* istanbul ignore if */
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

export function byTinyIdList(idList: string[], size: number, cb: CbError1<CdeFormElastic[] | void>) {
    idList = idList.filter(id => !!id);
    esClient.search(
        {
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
        splitError<{body: ElasticQueryResponse<CdeFormElastic>}>(err => cb(err), response => {
            // TODO: possible to move this sort to elastic search?
            if (!response) {
                cb(null, []);
                return;
            }
            response.body.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
            cb(null, response.body.hits.hits.map(h => h._source));
        })
    );
}

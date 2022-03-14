import { config } from 'server';
import { CdeFormDocument } from 'server/form/mongo-form';
import { logError } from 'server/log/dbLogger';
import { esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { CdeForm } from 'shared/form/form.model';
import { copyShallow } from 'shared/util';

export function updateOrInsert(elt: CdeForm): CdeForm {
    updateOrInsertImpl(copyShallow(elt));
    return elt;
}

export function updateOrInsertDocument(elt: CdeFormDocument) {
    return updateOrInsertImpl(elt.toObject());
}

export function updateOrInsertImpl(elt: CdeForm): void {
    riverFunction(elt, doc => {
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

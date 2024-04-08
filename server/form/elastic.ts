import { config } from 'server';
import { CdeFormDocument } from 'server/form/mongo-form';
import { logError } from 'server/log/dbLogger';
import { buildElasticSearchQueryForm } from 'server/system/buildElasticSearchQuery';
import { elasticsearchPromise as elasticSearchShared, esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { CdeForm } from 'shared/form/form.model';
import { copyShallow } from 'shared/util';
import { CbError1, SearchResponseAggregationForm, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { storeQuery } from '../log/storedQueryDb';

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
            const done = (err: Error | null) => {
                /* istanbul ignore if */
                if (err) {
                    logError({
                        message: 'Unable to Index document: ' + doc.elementType + ' ' + doc.tinyId,
                        origin: 'form.elastic.updateOrInsert',
                        stack: err.toString(),
                        details: '',
                    });
                }
                if (doneCount >= 1) {
                    return;
                }
                doneCount++;
            };
            delete doc._id;
            esClient.index(
                {
                    index: config.elastic.formIndex.name,
                    type: '_doc',
                    id: doc.tinyId,
                    body: doc,
                },
                done
            );
            suggestRiverFunction(elt, sugDoc => {
                esClient.index(
                    {
                        index: config.elastic.formSuggestIndex.name,
                        type: '_doc',
                        id: doc.tinyId,
                        body: sugDoc,
                    },
                    done
                );
            });
        }
    });
}

export function elasticsearchForm(
    user: User,
    settings: SearchSettingsElastic,
    cb: CbError1<SearchResponseAggregationForm | void>
) {
    const query = buildElasticSearchQueryForm(user, settings);
    elasticSearchShared('form', query, settings).then(result => {
        if (result && result.forms && result.forms.length > 0) {
            storeQuery(settings);
        }
        cb(null, result);
    }, cb);
}

import { config } from 'server';
import { logError } from 'server/log/dbLogger';
import { storeQuery } from 'server/log/storedQueryDb';
import { DataElementDocument } from 'server/mongo/mongoose/dataElement.mongoose';
import { elasticsearchPromise as elasticSearchShared, esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { DataElement, ElasticResponseDataDe } from 'shared/de/dataElement.model';
import { CbError, CbError1, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { buildElasticSearchQueryCde } from 'server/system/buildElasticSearchQuery';
import { copyShallow } from 'shared/util';

export function updateOrInsert(elt: DataElement): DataElement {
    updateOrInsertImpl(copyShallow(elt));
    return elt;
}

export function updateOrInsertDocument(elt: DataElementDocument) {
    return updateOrInsertImpl(elt.toObject());
}

export function updateOrInsertImpl(elt: DataElement): void {
    riverFunction(elt, doc => {
        if (doc) {
            let doneCount = 0;
            const done = (err: Error | null) => {
                if (err) {
                    logError({
                        message: 'Unable to Index document: ' + doc.elementType + ' ' + doc.tinyId,
                        origin: 'cde.elastic.updateOrInsert',
                        stack: err.message + ' ' + err.stack,
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
                    index: config.elastic.index.name,
                    id: doc.tinyId,
                    type: '_doc',
                    body: doc,
                },
                done
            );
            suggestRiverFunction(elt, sugDoc => {
                esClient.index(
                    {
                        index: config.elastic.cdeSuggestIndex.name,
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

export function elasticsearch(user: User, settings: SearchSettingsElastic, cb: CbError1<ElasticResponseDataDe | void>) {
    const query = buildElasticSearchQueryCde(user, settings);
    elasticSearchShared('cde', query).then(result => {
        if (result && result.cdes && result.cdes.length > 0) {
            storeQuery(settings);
        }
        cb(null, result);
    }, cb as CbError);
}

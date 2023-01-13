import { config } from 'server';
import { logError } from 'server/log/dbLogger';
import { storeQuery } from 'server/log/storedQueryDb';
import { DataElementDocument } from 'server/mongo/mongoose/dataElement.mongoose';
import { elasticsearchPromise as elasticSearchShared, esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { DataElement } from 'shared/de/dataElement.model';
import { CbError1, SearchResponseAggregationDe, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';
import { copyShallow } from 'shared/util';
import { isOrgAuthority } from 'shared/security/authorizationShared';

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
            esClient.index({
                index: config.elastic.index.name,
                id: doc.tinyId,
                type: '_doc',
                body: doc
            }, done);
            suggestRiverFunction(elt, sugDoc => {
                esClient.index({
                    index: config.elastic.cdeSuggestIndex.name,
                    type: '_doc',
                    id: doc.tinyId,
                    body: sugDoc
                }, done);
            });
        }
    });
}

export function elasticsearch(user: User, settings: SearchSettingsElastic, cb: CbError1<SearchResponseAggregationDe | void>) {
    if (!Array.isArray(settings.selectedElements)) {
        settings.selectedElements = [];
    }
    if (!Array.isArray(settings.selectedElementsAlt)) {
        settings.selectedElementsAlt = [];
    }
    const query = buildElasticSearchQuery(user, settings);

    if (!isOrgAuthority(user)) {
        query.query.bool.must_not.push({term: {noRenderAllowed: true}})
    }

    if ((query.from + query.size) > 10000) {
        return cb(new Error('page size exceeded'));
    }
    if (settings.includeAggregations) {
        query.aggregations.datatype = {
            filter: settings.filterDatatype,
            aggs: {
                datatype: {
                    terms: {
                        field: 'valueDomain.datatype',
                        size: 500,
                        order: {
                            _key: 'desc'
                        }
                    }
                }
            }
        };
    }

    if (!settings.fullRecord) {
        query._source = {excludes: ['flatProperties', 'properties', 'classification.elements', 'formElements']};
    }

    elasticSearchShared('cde', query, settings).then(result => {
        if (result && result.cdes && result.cdes.length > 0) {
            storeQuery(settings);
        }
        cb(null, result);
    }, cb);
}

import { DataElementDocument } from 'server/cde/mongo-cde';
import { handleNotFound } from 'server/errorHandler/errorHandler';
import { logError } from 'server/log/dbLogger';
import { storeQuery } from 'server/log/storedQueryDb';
import { elasticsearch as elasticSearchShared, esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { config } from 'server/system/parseConfig';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { CbError1, ElasticQueryResponse, SearchResponseAggregationDe, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';

export function updateOrInsert(elt: DataElementDocument) {
    riverFunction(elt.toObject(), doc => {
        if (doc) {
            let doneCount = 0;
            let doneError;
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
                doneError = err;
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

export function byTinyIdList(idList: string[], size: number, cb: CbError1<DataElementElastic[]>) {
    idList = idList.filter(id => !!id);
    esClient.search({
        index: config.elastic.index.name,
        body: {
            query: {
                ids: {
                    values: idList
                }
            },
            size,
        }
    }, handleNotFound<{body: ElasticQueryResponse<DataElementElastic>}>({}, response => {
        // @TODO possible to move this sort to elastic search?
        response.body.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
        cb(null, response.body.hits.hits.map(h => h._source));
    }));
}

export function elasticsearch(user: User, settings: SearchSettingsElastic, cb: CbError1<SearchResponseAggregationDe | void>) {
    const query = buildElasticSearchQuery(user, settings);
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

    elasticSearchShared('cde', query, settings, (err, result) => {
        if (result && result.cdes && result.cdes.length > 0) {
            storeQuery(settings);
        }
        cb(err, result);
    });
}

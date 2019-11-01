import * as elastic from 'elasticsearch';
import { handleNotFound } from 'server/errorHandler/errorHandler';
import { logError } from 'server/log/dbLogger';
import { buildElasticSearchQuery, elasticsearch as elasticSearchShared } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { config } from 'server/system/parseConfig';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { CbError, ElasticQueryResponse, SearchResponseAggregationDe, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { storeQuery } from 'server/log/storedQueryDb';

export const esClient = new elastic.Client({
    hosts: config.elastic.hosts
});

export function updateOrInsert(elt) {
    riverFunction(elt.toObject(), doc => {
        if (doc) {
            let doneCount = 0;
            let doneError;
            const done = err => {
                if (err) {
                    logError({
                        message: 'Unable to Index document: ' + doc.tinyId,
                        origin: 'cde.elastic.updateOrInsert',
                        stack: err,
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
                type: 'dataelement',
                id: doc.tinyId,
                body: doc
            }, done);
            suggestRiverFunction(elt, sugDoc => {
                esClient.index({
                    index: config.elastic.cdeSuggestIndex.name,
                    type: 'suggest',
                    id: doc.tinyId,
                    body: sugDoc
                }, done);
            });
        }
    });
}

export function elasticsearch(user: User, settings: SearchSettingsElastic, cb: CbError<SearchResponseAggregationDe>) {
    const query = buildElasticSearchQuery(user, settings);
    if (query.size > 100) {
        return cb(new Error('size exceeded'));
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
                            _term: 'desc'
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

const mltConf = {
    mlt_fields: [
        'designations.designation',
        'definitions.definition',
        'valueDomain.permissibleValues.permissibleValue',
        'valueDomain.permissibleValues.valueMeaningName',
        'valueDomain.permissibleValues.valueMeaningCode',
        'property.concepts.name'
    ]
};

export function morelike(id, callback) {
    const from = 0;
    const limit = 20;
    esClient.search<DataElementElastic>({
        index: config.elastic.index.name,
        type: 'dataelement',
        body: {
            query: {
                bool: {
                    must: {
                        more_like_this: {
                            fields: mltConf.mlt_fields,
                            like: [
                                {
                                    _id: id
                                }
                            ],
                            min_term_freq: 1,
                            min_doc_freq: 1,
                            min_word_length: 2
                        }
                    },
                    filter: {
                        bool: {
                            must_not: [
                                {
                                    term: {
                                        'registrationState.registrationStatus': 'Retired'
                                    }
                                },
                                {
                                    term: {
                                        isFork: 'true'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
    }, handleNotFound({}, response => {
            const result: any = {
                cdes: [],
                pages: Math.ceil(response.hits.total / limit),
                page: Math.ceil(from / limit),
                totalNumber: response.hits.total,
            };
            response.hits.hits.forEach(hit => {
                const thisCde = hit._source;
                if (thisCde.valueDomain && thisCde.valueDomain.datatype === 'Value List' && thisCde.valueDomain.permissibleValues
                    && thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                result.cdes.push(thisCde);
            });
            callback(result);
        })
    );
}

export function byTinyIdList(idList, size, cb) {
    idList = idList.filter(id => !!id);
    esClient.search({
        index: config.elastic.index.name,
        type: 'dataelement',
        body: {
            query: {
                ids: {
                    values: idList
                }
            },
            size,
        }
    }, handleNotFound<ElasticQueryResponse>({}, response => {
        // @TODO possible to move this sort to elastic search?
        response.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
        cb(null, response.hits.hits.map(h => h._source));
    }));
}

import { handleNotFound } from 'server/errorHandler/errorHandler';
import { config } from 'server/system/parseConfig';
import { CbErr, ElasticQueryResponse, ElasticQueryResponseDe, SearchResponseAggregationDe, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

const sharedElastic = require('../system/elastic');
const dbLogger = require('../log/dbLogger');
const logging = require('../system/logging');
const elastic = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

export const esClient = new elastic.Client({
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
                        origin: 'cde.elastic.updateOrInsert',
                        stack: err,
                        details: ""
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
            esInit.suggestRiverFunction(elt, sugDoc => {
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

export function elasticsearch(user: User, settings: SearchSettingsElastic, cb: CbErr<SearchResponseAggregationDe>) {
    const query = sharedElastic.buildElasticSearchQuery(user, settings);
    if (query.size > 100) return cb('size exceeded');
    if ((query.from + query.size) > 10000) return cb('page size exceeded');
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

    sharedElastic.elasticsearch('cde', query, settings, (err, result) => {
        if (result && result.cdes && result.cdes.length > 0) {
            dbLogger.storeQuery(settings);
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
    let from = 0;
    let limit = 20;
    let mltPost = {
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
    };

    esClient.search({
        index: config.elastic.index.name,
        type: 'dataelement',
        body: mltPost
    }, handleNotFound<ElasticQueryResponseDe>({}, response => {
            const result = {
                cdes: []
                , pages: Math.ceil(response.hits.total / limit)
                , page: Math.ceil(from / limit)
                , totalNumber: response.hits.total
            };
            for (let i = 0; i < response.hits.hits.length; i++) {
                const thisCde = response.hits.hits[i]._source;
                if (thisCde.valueDomain && thisCde.valueDomain.datatype === 'Value List' && thisCde.valueDomain.permissibleValues
                    && thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                result.cdes.push(thisCde);
            }
            callback(result);
        }));
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
            size: size
        }
    }, handleNotFound<ElasticQueryResponse>({}, response => {
        // @TODO possible to move this sort to elastic search?
        response.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
        cb(null, response.hits.hits.map(h => h._source));
    }));
}

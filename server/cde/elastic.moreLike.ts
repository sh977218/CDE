import { config } from 'server';
import { handleNotFound } from 'server/errorHandler/errorHandler';
import { esClient } from 'server/system/elastic';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { Cb1, ElasticQueryResponse } from 'shared/models.model';

interface MoreLike {
    cdes: DataElementElastic[];
    page: number;
    pages: number;
    totalNumber: number;
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

export function moreLike(id: string, callback: Cb1<MoreLike>) {
    const from = 0;
    const limit = 20;

    const query = {
        index: config.elastic.index.name,
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
        }
    };
    esClient.search(query, handleNotFound<{ body: ElasticQueryResponse<DataElementElastic> }>({}, response => {
            const body = response.body;
            const result: MoreLike = {
                cdes: [],
                pages: Math.ceil(body.hits.total / limit),
                page: Math.ceil(from / limit),
                totalNumber: body.hits.total,
            };
            // @TODO remove after full migration to ES7
            if ((result.totalNumber as any).value) {
                result.totalNumber = (result.totalNumber as any).value;
            }
            body.hits.hits.forEach(hit => {
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

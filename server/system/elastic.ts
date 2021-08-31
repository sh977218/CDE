import { eachOf, filter, forEach } from 'async';
import { Client } from '@elastic/elasticsearch';
import { Agent } from 'https';
import { noop } from 'lodash';
import { Cursor } from 'mongodb';
import { Document } from 'mongoose';
import fetch from 'node-fetch';
import * as boardDb from 'server/board/boardDb';
import * as mongo_cde from 'server/cde/mongo-cde';
import { respondError } from 'server/errorHandler/errorHandler';
import * as mongo_form from 'server/form/mongo-form';
import { consoleLog, logError } from 'server/log/dbLogger';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { ElasticIndex, indices } from 'server/system/elasticSearchInit';
import { errorLogger } from 'server/system/logging';
import { noDbLogger } from 'server/system/noDbLogger';
import { config } from 'server/system/parseConfig';
import { concat } from 'shared/array';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { handleErrors, json } from 'shared/fetch';
import { CdeFormElastic } from 'shared/form/form.model';
import {
    Cb, Cb1, CbError1, CurationStatus, ElasticQueryResponse, ElasticQueryResponseAggregations, Item, ItemElastic,
    ModuleItem, SearchResponseAggregationDe,
    SearchResponseAggregationForm, SearchResponseAggregationItem, User
} from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { hasRolePrivilege } from 'shared/security/authorizationShared';

export type ElasticCondition = any;
export type MongoCondition = any;

interface DbItem {
    dao: Document;
    name: ModuleItem;
    count: (query: MongoCondition, cb: CbError1<number>) => void;
    getStream: (query: MongoCondition) => Cursor;
}

interface DbQuery {
    condition: MongoCondition;
    dao: DbItem;
}

interface DbStream {
    query: DbQuery;
    indexes: ElasticIndex[];
}

export const esClient = new Client(config.elastic.options);

export function removeElasticFields(elt: DataElementElastic): DataElementElastic;
export function removeElasticFields(elt: CdeFormElastic): CdeFormElastic;
export function removeElasticFields(elt: ItemElastic): Item {
    delete elt.classificationBoost;
    delete elt.flatClassifications;
    delete (elt as any).primaryNameCopy;
    delete elt.stewardOrgCopy;
    delete elt.flatProperties;
    if (elt.valueDomain) {
        delete elt.valueDomain.nbOfPVs;
    }
    delete elt.primaryDefinitionCopy;
    delete elt.flatMeshSimpleTrees;
    delete elt.flatMeshTrees;
    delete elt.flatIds;
    delete elt.usedByOrgs;
    delete elt.registrationState.registrationStatusSortOrder;
    return elt;
}

const queryDe: DbQuery = {
    condition: {archived: false},
    dao: mongo_cde as any
};
const queryForm: DbQuery = {
    condition: {archived: false},
    dao: mongo_form as any
};
export const daoMap: { [key: string]: DbQuery } = {
    cde: queryDe,
    form: queryForm,
    board: {
        condition: {},
        dao: boardDb as any
    },
    cdeSuggest: queryDe,
    formSuggest: queryForm
};

export function reIndex(index: ElasticIndex, cb: Cb) {
    reIndexStream({query: daoMap[index.name], indexes: [index]}, cb);
}

const BUFFER_MAX_SIZE = 10000000; // ~10MB
const DOC_MAX_SIZE = BUFFER_MAX_SIZE;

const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

export function reIndexStream(dbStream: DbStream, cb?: Cb) {
    createIndex(dbStream, () => {
        const riverFunctions = dbStream.indexes.map(index => index.filter || ((elt: ItemElastic, cb: Cb1<ItemElastic>) => cb(elt)));
        const buffers = Array.apply(null, new Array(dbStream.indexes.length)).map(() => Buffer.alloc(BUFFER_MAX_SIZE));
        const bufferOffsets = new Array(dbStream.indexes.length).fill(0);
        const nextCommandBuffer = Buffer.alloc(DOC_MAX_SIZE);
        let nextCommandOffset = 0;
        const startTime = new Date().getTime();
        const indexTypes = dbStream.indexes.map(index => Object.keys(index.indexJson.mappings)[0]);

        dbStream.indexes.forEach(index => {
            index.count = 0;
        });

        const inject = (i: number, cb = noop) => {
            (function bulkIndex(req, cb, retries = 1) {
                fetch(config.elastic.hosts[0] + '/_bulk', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-ndjson'},
                    agent: /^https:\/\//i.test(config.elastic.hosts[0]) ? httpsAgent : undefined,
                    body: req,
                })
                    .then(handleErrors)
                    .then(json)
                    .then(body => {
                        if (body.errors) {
                            errorHandler(body.err);
                            return;
                        }
                        consoleLog(`ingested  ${dbStream.indexes[i].indexJson}: ${dbStream.indexes[i].count}`);
                        cb();
                    }, errorHandler);

                function errorHandler(err?: string) {
                    if (retries) {
                        setTimeout(() => {
                            bulkIndex(req, cb, --retries);
                        }, 2000);
                    } else {
                        logError({
                            message: 'Unable to Index in bulk',
                            origin: 'system.elastic.inject',
                            stack: undefined,
                            details: err
                        });
                        cb();
                    }
                }
            })(buffers[i].toString(undefined, 0, bufferOffsets[i]), cb);
            // reset
            bufferOffsets[i] = 0;
        };

        dbStream.query.dao.count(dbStream.query.condition, (err: Error | null, totalCount: number) => {
            if (err) {
                consoleLog(`Error getting count: ${err}`, 'error');
            }
            consoleLog('Total count for ' + dbStream.query.dao.name + ' is ' + totalCount);
            dbStream.indexes.forEach(index => {
                index.totalCount = totalCount;
            });
        });
        const cursor = dbStream.query.dao.getStream(dbStream.query.condition);

        (function processOneDocument(cursor) {
            cursor.next((err: Error | undefined, doc) => {
                if (err) {
                    // err
                    consoleLog('Error getting cursor: ' + err);
                    return;
                }
                if (!doc) {
                    // end
                    eachOf(dbStream.indexes, (index: ElasticIndex, i, doneOne) => {
                        inject(i as number, () => {
                            const info = 'done ingesting ' + index.name + ' ' + index.indexName + ' in : '
                                + (new Date().getTime() - startTime) / 1000 + ' secs. count: ' + index.count;
                            noDbLogger.info(info);
                            consoleLog(info);
                            doneOne();
                        });
                    }, () => {
                        if (cb) {
                            cb();
                        }
                    });
                    return;
                }
                // data
                const docObj = doc.toObject();
                dbStream.indexes.forEach((index, i) => {
                    riverFunctions[i](docObj, (doc: Item | void) => {
                        if (!doc) {
                            return;
                        }

                        function nextCommand(json: any) {
                            nextCommandOffset += nextCommandBuffer.write(JSON.stringify(json) + '\n', nextCommandOffset);
                        }

                        nextCommandOffset = 0;
                        nextCommand({
                            index: {
                                _index: index.indexName,
                                _type: '_doc',
                                _id: doc.tinyId || doc._id
                            }
                        });
                        delete doc._id;
                        nextCommand(doc);
                        if (bufferOffsets[i] + nextCommandOffset > BUFFER_MAX_SIZE) {
                            inject(i);
                        }
                        bufferOffsets[i] += nextCommandBuffer.copy(buffers[i], bufferOffsets[i], 0, nextCommandOffset);
                        index.count++;
                    });
                });
                setTimeout(() => {
                    processOneDocument(cursor);
                }, 0);
            });
        })(cursor);
    });
}

function createIndex(dbStream: DbStream, cb: Cb) {
    filter(dbStream.indexes, (index: ElasticIndex, doneOne) => {
        esClient.indices.exists({index: index.indexName}, (err, response) => {
            if (err) {
                return doneOne(err);
            }
            if (response.body) {
                consoleLog('index already exists: ' + index.indexName);
                doneOne(undefined, false);
            } else {
                consoleLog('creating index: ' + index.indexName);
                esClient.indices.create({
                    index: index.indexName,
                    include_type_name: false,
                    timeout: '10s',
                    body: index.indexJson
                }, err => {
                    if (err) {
                        respondError(err);
                        doneOne(err);
                    } else {
                        consoleLog('index Created: ' + index.indexName);
                        doneOne(undefined, true);
                    }
                });
            }
        });
    }, (err, matches) => {
        if (err) {
            respondError(err);
        }
        if (matches && matches.length) {
            reIndexStream({query: dbStream.query, indexes: matches as ElasticIndex[]}, cb);
        } else {
            cb();
        }
    });
}

export function initEs(cb: Cb = () => {
}) {
    const dbStreams: DbStream[] = [];
    indices.forEach((index: ElasticIndex) => {
        const match = dbStreams.filter(s => s.query === daoMap[index.name])[0];
        if (match) {
            match.indexes.push(index);
        } else {
            dbStreams.push({query: daoMap[index.name], indexes: [index]});
        }
    });
    forEach(dbStreams, createIndex, () => {
        cb();
    });
}

export function completionSuggest(term: ElasticCondition, user: User, settings: SearchSettingsElastic,
                                  indexName: string, cb: CbError1<ElasticQueryResponse<ItemElastic> | void>) {
    const allowedStatuses = getAllowedStatuses(user, settings);
    const suggestQuery = {
        query: {
            match: {
                nameSuggest: {
                    query: term
                }
            }
        },
        post_filter: {
            bool: {
                filter: [
                    {bool: {should: regStatusFilter(user, settings, allowedStatuses)}}
                ]
            }
        }
    };

    esClient.search({
        index: indexName,
        body: suggestQuery
    }, (error, response) => {
        if (error) {
            cb(error);
        } else {
            cb(null, response.body as ElasticQueryResponse<ItemElastic>);
        }
    });
}

export function termRegStatus(regStatus: CurationStatus) {
    return {term: {'registrationState.registrationStatus': regStatus}};
}

export function getAllowedStatuses(user: User, settings: SearchSettingsElastic): CurationStatus[] {
    return concat(
        ['Preferred Standard', 'Standard', 'Qualified'],
        user && user.viewDrafts ? ['Recorded', 'Candidate'] : [],
        settings.includeRetired ? ['Retired'] : []
    )
}

export function regStatusFilter(user: User, settings: SearchSettingsElastic, allowedStatuses: CurationStatus[]): { term: any }[] {
    if (hasRolePrivilege(user, 'universalSearch')) {
        return ((settings.includeRetired
            ? ['Preferred Standard', 'Standard', 'Qualified', 'Recorded', 'Candidate', 'Incomplete', 'Retired']
            : ['Preferred Standard', 'Standard', 'Qualified', 'Recorded', 'Candidate', 'Incomplete']
        ) as CurationStatus[]).map(termRegStatus);
    }
    return concat<{term: any}>(
        allowedStatuses.map(termRegStatus),
        myOrgs(user).map(org => ({term: {'stewardOrg.name': org}}))
    );
}

export function isSearch(settings: SearchSettingsElastic) {
    return settings && (settings.searchTerm || settings.selectedOrg || settings.meshTree);
}

const searchTemplate: { [key: string]: any } = {
    cde: {
        index: config.elastic.index.name,
    },
    form: {
        index: config.elastic.formIndex.name,
    }
};

export function elasticsearch(type: 'cde', query: any, settings: any, cb: CbError1<SearchResponseAggregationDe>): void;
export function elasticsearch(type: 'form', query: any, settings: any, cb: CbError1<SearchResponseAggregationForm>): void;
export function elasticsearch(type: ModuleItem, query: any, settings: any,
                              callback: CbError1<SearchResponseAggregationDe> | CbError1<SearchResponseAggregationForm>): void {
    const cb = callback as CbError1<SearchResponseAggregationItem | void>;
    const search = searchTemplate[type];
    if (!search) {
        return cb(new Error('Invalid query'));
    }
    search.body = query;
    search.body.track_total_hits = true;
    esClient.search(search, (error: any, resp: any) => {
        if (error) {
            const response = resp as any;
            if (response && response.statusCode) {
                const errorObj = {
                    origin: 'system.elastic.elasticsearch',
                    badInput: response.body.error.type === 'search_phase_execution_exception',
                    stack: error.stack,
                    details: JSON.stringify(query)
                };
                errorLogger.error('Error: ElasticSearch Error', errorObj);
                cb(new Error('Invalid Query'));
            } else {
                let querystr = 'cannot stringify query';
                try {
                    querystr = JSON.stringify(query);
                } catch (e) {
                }
                errorLogger.error('Error: ElasticSearch Error',
                    {
                        origin: 'system.elastic.elasticsearch',
                        stack: error.stack,
                        details: 'query ' + querystr
                    });
                cb(new Error('Server Error'));
            }
        } else {
            const response = resp.body as ElasticQueryResponseAggregations<ItemElastic>;
            if (response.hits.total === 0 && config.name.indexOf('Prod') === -1) {
                consoleLog('No response. QUERY: ' + JSON.stringify(query), 'debug');
            }

            const items: ItemElastic[] = [];
            type t = typeof type;
            const result = {
                _shards: {
                    failed: 0,
                    successful: 0,
                    total: 0,
                },
                aggregations: response.aggregations,
                hits: {hits: [], max_score: 0, total: 0},
                timed_out: false,
                totalNumber: response.hits.total,
                maxScore: response.hits.max_score,
                took: response.took,
                cdes: type === 'cde' ? items as DataElementElastic[] : undefined,
                forms: type === 'form' ? items as CdeFormElastic[] : undefined,
            } as SearchResponseAggregationItem;
            // @TODO remove after full migration to ES7
            if ((result.totalNumber as any).value > -1) {
                result.totalNumber = (result.totalNumber as any).value;
            }
            for (const hit of response.hits.hits) {
                const thisCde = hit._source as DataElementElastic;
                thisCde.score = hit._score;
                if (thisCde.valueDomain && thisCde.valueDomain.datatype === 'Value List' && thisCde.valueDomain.permissibleValues
                    && thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                thisCde.properties = [];
                thisCde.flatProperties = [];
                thisCde.highlight = hit.highlight;
                items.push(thisCde);
            }
            cb(null, result);
        }
    });
}

let lock = false;

function releaseElasticSearchExportLock() {
    lock = false;
}

function lockElasticSearchExportLock() {
    lock = true;
}

export function elasticSearchExport(type: 'cde', query: any, dataCb: CbError1<DataElementElastic | void>): void;
export function elasticSearchExport(type: 'form', query: any, dataCb: CbError1<CdeFormElastic | void>): void;
export async function elasticSearchExport(type: ModuleItem, query: any,
                                          dataCb: CbError1<DataElementElastic | void> | CbError1<CdeFormElastic | void>) {
    setTimeout(releaseElasticSearchExportLock, 60 * 60 * 5);
    const streamCb = dataCb as CbError1<ItemElastic | void>;
    if (lock) {
        return streamCb(new Error('Servers busy'));
    }

    lockElasticSearchExportLock();

    query.size = 500;
    delete query.aggregations;

    const search = JSON.parse(JSON.stringify(searchTemplate[type]));
    search.scroll = '1m';
    search.body = query;

    function scrollThrough(response: any) {
        esClient.scroll({scrollId: response._scroll_id, scroll: '1m'} as any, (err: Error | null, response: any) => {
            if (err) {
                releaseElasticSearchExportLock();
                errorLogger.error('Error: Elastic Search Scroll Access Error',
                    {
                        origin: 'system.elastic.elasticsearch',
                        stack: new Error().stack
                    });
                streamCb(new Error('ES Error'));
            } else {
                processScroll(response.body);
            }
        });
    }

    function processScroll(response: any) {
        if (response.hits.hits.length === 0) {
            releaseElasticSearchExportLock();
            streamCb(null);
        } else {
            for (const hit of response.hits.hits) {
                streamCb(null, hit._source);
            }
            scrollThrough(response);
        }
    }

    const response = await esClient.search(search);
    processScroll(response.body);
}

export function scrollExport(query: any, type: ModuleItem, cb: CbError1<any>) {
    query.size = 100;
    delete query.aggregations;

    const search = JSON.parse(JSON.stringify(searchTemplate[type]));
    search.scroll = '1m';
    search.body = query;

    esClient.search(search, cb);
}

export function scrollNext(scrollId: string, cb: CbError1<any>) {
    esClient.scroll({scrollId, scroll: '1m'} as any, cb);
}

export const queryMostViewed = {
    size: 10,
    query: {
        bool: {
            filter: [
                {
                    bool: {
                        should: [
                            termRegStatus('Standard'),
                            termRegStatus('Qualified'),
                        ]
                    }
                }
            ]
        }
    },
    sort: {
        views: 'desc'
    }
};

export const queryNewest = {
    size: 10,
    query: {
        bool: {
            filter: [
                {
                    bool: {
                        should: [
                            termRegStatus('Standard'),
                            termRegStatus('Qualified'),
                        ]
                    }
                }
            ]
        }
    },
    sort: {
        _script: {
            type: 'number',
            script: "doc['updated'].value > 0 ? doc['updated'].value : (doc['created'].value > 0 ? doc['created'].value" +
                " : doc['imported'].value)",
            order: 'desc'
        }
    }
};

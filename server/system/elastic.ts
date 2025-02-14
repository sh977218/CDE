import {
    QueryDslQueryContainer,
    ScrollRequest,
    ScrollResponse,
    SearchRequest,
    SearchResponse,
} from '@elastic/elasticsearch/api/types';
import { Client } from '@elastic/elasticsearch';
import { ApiResponse, Client as ClientNewType } from '@elastic/elasticsearch/api/new';
import { eachOf, filter, forEach } from 'async';
import { Agent } from 'https';
import { Cursor, QueryOptions } from 'mongoose';
import fetch from 'node-fetch';
import { config, dbPlugins } from 'server';
import { respondError } from 'server/errorHandler';
import { consoleLog, logError } from 'server/log/dbLogger';
import { BoardDocument, getStream as boardStream } from 'server/mongo/mongoose/board.mongoose';
import { DataElementDocument, getStream as dataElementStream } from 'server/mongo/mongoose/dataElement.mongoose';
import { FormDocument, getStream as formStream } from 'server/mongo/mongoose/form.mongoose';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { ElasticIndex, indices } from 'server/system/elasticSearchInit';
import { errorLogger } from 'server/system/logging';
import { noDbLogger } from 'server/system/noDbLogger';
import { concat } from 'shared/array';
import { Board } from 'shared/board.model';
import { DataElement, DataElementElastic, ElasticResponseDataDe } from 'shared/de/dataElement.model';
import {
    ElasticSearchResponse,
    ElasticSearchResponseAggregations,
    ElasticSearchResponseBody,
    esqBoolFilter,
    esqBoolMustNot,
    esqBoolShould,
    esqTerm,
    responseHitsTotal,
} from 'shared/elastic';
import { handleErrors, json } from 'shared/fetch';
import { CdeForm, CdeFormElastic, ElasticResponseDataForm } from 'shared/form/form.model';
import { Item, ItemElastic } from 'shared/item';
import { Cb, Cb1, CbError1, CopyrightStatus, CurationStatus, ModuleItem, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { hasRolePrivilege, isOrgAuthority } from 'shared/security/authorizationShared';
import { copyDeep, noop } from 'shared/util';

export type ElasticCondition = any;
export type MongoCondition = any;

interface DbQuery {
    condition: MongoCondition;
    dao:
        | {
              name: 'board';
              count: (query: any) => Promise<number>;
              getStream: (query: MongoCondition) => Cursor<BoardDocument, QueryOptions<Board>>;
          }
        | {
              name: 'cde';
              count: (query: any) => Promise<number>;
              getStream: (query: MongoCondition) => Cursor<DataElementDocument, QueryOptions<DataElement>>;
          }
        | {
              name: 'form';
              count: (query: any) => Promise<number>;
              getStream: (query: MongoCondition) => Cursor<FormDocument, QueryOptions<CdeForm>>;
          };
}

interface DbStream {
    query: DbQuery;
    indexes: ElasticIndex[];
}

export const esClient: ClientNewType = new Client(config.elastic.options) as any;

export function removeElasticFields(eltElastic: DataElementElastic): DataElement;
export function removeElasticFields(eltElastic: CdeFormElastic): CdeForm;
export function removeElasticFields(eltElastic: ItemElastic): Item {
    const elt: Partial<ItemElastic> = eltElastic;
    delete elt.flatClassifications;
    delete elt.highlight;
    delete elt.primaryDefinitionCopy;
    delete elt.primaryNameCopy;
    delete elt.score;

    delete elt.classificationBoost;
    delete elt.flatIds;
    delete elt.flatProperties;
    if (elt.registrationState) {
        delete elt.registrationState.registrationStatusSortOrder;
    }
    delete elt.stewardOrgCopy;

    // de only
    delete (elt as Partial<DataElementElastic>).linkedForms;
    if ((elt as DataElementElastic).valueDomain) {
        delete (elt as DataElementElastic).valueDomain.nbOfPVs;
    }

    // form only
    delete (elt as CdeFormElastic).numQuestions;

    // delete elt.usedByOrgs; // in the object to index but not in the elastic index
    // delete elt.flatMeshSimpleTrees; // not currently used
    // delete elt.flatMeshTrees; // not currently used

    return elt as Item;
}

function daoMap(key: 'cde' | 'form' | 'board' | 'cdeSuggest' | 'formSuggest'): DbQuery {
    const queryDe: DbQuery = {
        condition: { archived: false },
        dao: {
            name: 'cde',
            count: dbPlugins.dataElement.count.bind(dbPlugins.dataElement),
            getStream: dataElementStream,
        },
    };
    const queryForm: DbQuery = {
        condition: { archived: false },
        dao: {
            name: 'form',
            count: dbPlugins.form.count.bind(dbPlugins.form),
            getStream: formStream,
        },
    };
    const queryBoard: DbQuery = {
        condition: {},
        dao: {
            name: 'board',
            count: dbPlugins.board.count.bind(dbPlugins.board),
            getStream: boardStream,
        },
    };
    return {
        cde: queryDe,
        form: queryForm,
        board: queryBoard,
        cdeSuggest: queryDe,
        formSuggest: queryForm,
    }[key];
}

export function deleteIndex(index: ElasticIndex, cb: Cb) {
    esClient.indices.delete({ index: index.indexName, timeout: '6s' }, cb);
}

export function reIndex(index: ElasticIndex, cb: Cb) {
    reIndexStream({ query: daoMap(index.name), indexes: [index] }, cb);
}

const BUFFER_MAX_SIZE = 10000000; // ~10MB
const DOC_MAX_SIZE = BUFFER_MAX_SIZE;

const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

export function reIndexStream(dbStream: DbStream, cb?: Cb) {
    createIndex(dbStream, () => {
        const riverFunctions = dbStream.indexes.map(
            index => index.filter || ((elt: ItemElastic, cb: Cb1<ItemElastic>) => cb(elt))
        );
        const buffers = Array.apply(null, new Array(dbStream.indexes.length)).map(() => Buffer.alloc(BUFFER_MAX_SIZE));
        const bufferOffsets = new Array(dbStream.indexes.length).fill(0);
        const nextCommandBuffer = Buffer.alloc(DOC_MAX_SIZE);
        let nextCommandOffset = 0;
        const startTime = new Date().getTime();

        dbStream.indexes.forEach(index => {
            index.count = 0;
        });

        const inject = (i: number, cb = noop) => {
            (function bulkIndex(req, cb, retries = 1) {
                fetch(config.elastic.hosts[0] + '/_bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-ndjson' },
                    agent: /^https:\/\//i.test(config.elastic.hosts[0]) ? httpsAgent : undefined,
                    body: req,
                })
                    .then(handleErrors)
                    .then<{ errors: boolean; err: string }>(json)
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
                            details: err,
                        });
                        cb();
                    }
                }
            })(buffers[i].toString(undefined, 0, bufferOffsets[i]), cb);
            // reset
            bufferOffsets[i] = 0;
        };

        dbStream.query.dao.count(dbStream.query.condition).then(
            (totalCount: number) => {
                consoleLog('Total count for ' + dbStream.query.dao.name + ' is ' + totalCount);
                dbStream.indexes.forEach(index => {
                    index.totalCount = totalCount;
                });
            },
            (err: Error | null) => {
                if (err) {
                    consoleLog(`Error getting count: ${err}`, 'error');
                }
            }
        );
        const cursor = dbStream.query.dao.getStream(dbStream.query.condition);

        (function processOneDocument(cursor) {
            cursor.next().then(
                doc => {
                    if (!doc) {
                        // end
                        eachOf(
                            dbStream.indexes,
                            (index: ElasticIndex, i, doneOne) => {
                                inject(i as number, () => {
                                    const info =
                                        'done ingesting ' +
                                        index.name +
                                        ' ' +
                                        index.indexName +
                                        ' in : ' +
                                        (new Date().getTime() - startTime) / 1000 +
                                        ' secs. count: ' +
                                        index.count;
                                    noDbLogger.info(info);
                                    consoleLog(info);
                                    doneOne();
                                });
                            },
                            () => {
                                if (cb) {
                                    cb();
                                }
                            }
                        );
                        return;
                    }
                    // data
                    const docObj: ItemElastic = doc.toObject() as any;
                    dbStream.indexes.forEach((index, i) => {
                        riverFunctions[i](docObj, (doc: Item | void) => {
                            if (!doc) {
                                return;
                            }

                            function nextCommand(json: any) {
                                nextCommandOffset += nextCommandBuffer.write(
                                    JSON.stringify(json) + '\n',
                                    nextCommandOffset
                                );
                            }

                            nextCommandOffset = 0;
                            nextCommand({
                                index: {
                                    _index: index.indexName,
                                    _type: '_doc',
                                    _id: doc.tinyId || doc._id,
                                },
                            });
                            delete doc._id;
                            nextCommand(doc);
                            if (bufferOffsets[i] + nextCommandOffset > BUFFER_MAX_SIZE) {
                                inject(i);
                            }
                            bufferOffsets[i] += nextCommandBuffer.copy(
                                buffers[i],
                                bufferOffsets[i],
                                0,
                                nextCommandOffset
                            );
                            index.count++;
                        });
                    });
                    setTimeout(() => {
                        processOneDocument(cursor);
                    }, 0);
                },
                err => {
                    consoleLog('Error getting cursor: ' + err);
                }
            );
        })(cursor);
    });
}

function createIndex(dbStream: DbStream, cb: Cb) {
    filter(
        dbStream.indexes,
        (index: ElasticIndex, doneOne) => {
            esClient.indices.exists({ index: index.indexName }, (err, response) => {
                if (err) {
                    return doneOne(err);
                }
                if (response.body) {
                    consoleLog('index already exists: ' + index.indexName);
                    doneOne(undefined, false);
                } else {
                    consoleLog('creating index: ' + index.indexName);
                    esClient.indices.create(
                        {
                            index: index.indexName,
                            include_type_name: false,
                            timeout: '10s',
                            body: index.indexJson,
                        },
                        (err: Error | null) => {
                            if (err) {
                                respondError()(err);
                                doneOne(err);
                            } else {
                                consoleLog('index Created: ' + index.indexName);
                                doneOne(undefined, true);
                            }
                        }
                    );
                }
            });
        },
        (err, matches) => {
            if (err) {
                respondError()(err);
            }
            if (matches && matches.length) {
                reIndexStream({ query: dbStream.query, indexes: matches as ElasticIndex[] }, cb);
            } else {
                cb();
            }
        }
    );
}

export function initEs(cb: Cb = () => {}) {
    const dbStreams: DbStream[] = [];
    indices.forEach((index: ElasticIndex) => {
        const match = dbStreams.filter(s => s.query === daoMap(index.name))[0];
        if (match) {
            match.indexes.push(index);
        } else {
            dbStreams.push({ query: daoMap(index.name), indexes: [index] });
        }
    });
    forEach(dbStreams, createIndex, () => {
        cb();
    });
}

export function completionSuggest(
    term: ElasticCondition,
    user: User,
    settings: SearchSettingsElastic,
    index: ElasticIndex,
    cb: CbError1<ElasticSearchResponseBody<ItemElastic> | void>
) {
    const postFilterFilters: QueryDslQueryContainer[] = [esqBoolShould(regStatusFilter(user, settings))];
    const suggestQuery: SearchRequest['body'] = {
        query: {
            match: {
                nameSuggest: {
                    query: term,
                },
            },
        },
        post_filter: esqBoolFilter(postFilterFilters),
    };

    if (index.name === 'cdeSuggest') {
        postFilterFilters.push(esqBoolMustNot(esqTerm('noRenderAllowed', true)));
    }

    esClient.search<ItemElastic>(
        {
            index: index.name,
            body: suggestQuery,
        },
        (error: Error | null, response) => {
            if (error) {
                cb(error);
            } else {
                cb(null, response.body);
            }
        }
    );
}

export function termAdminStatus(adminStatus: string): QueryDslQueryContainer {
    return esqTerm('registrationState.administrativeStatus', adminStatus);
}

export function termDatatype(dataType: string): QueryDslQueryContainer {
    return esqTerm('valueDomain.datatype', dataType);
}

export function termRegStatus(regStatus: CurationStatus): QueryDslQueryContainer {
    return esqTerm('registrationState.registrationStatus', regStatus);
}

export function termCopyrightStatus(copyrightStatus: CopyrightStatus): QueryDslQueryContainer {
    return esqTerm('copyrightStatus', copyrightStatus);
}

export function termStewardOrg(org: string): QueryDslQueryContainer {
    return esqTerm('stewardOrg.name', org);
}

export function hideRetired(settings: SearchSettingsElastic, user?: User) {
    return (!settings.includeRetired && settings.selectedStatuses.indexOf('Retired') === -1) || !isOrgAuthority(user);
}

export function getAllowedStatuses(user: User | undefined, settings: SearchSettingsElastic): CurationStatus[] {
    const allowedStatusesSet = new Set<CurationStatus>(['Preferred Standard', 'Standard', 'Qualified']);

    if (hasRolePrivilege(user, 'universalSearch')) {
        if (user && user.viewDrafts) {
            allowedStatusesSet.add('Recorded');
            allowedStatusesSet.add('Candidate');
        }
        allowedStatusesSet.add('Incomplete');
    }

    if (settings.includeRetired) {
        allowedStatusesSet.add('Retired');
    }

    return Array.from(allowedStatusesSet);
}

export function regStatusFilter(user: User | undefined, settings: SearchSettingsElastic): QueryDslQueryContainer[] {
    const allowedStatuses = getAllowedStatuses(user, settings);
    return concat<QueryDslQueryContainer>(allowedStatuses.map(termRegStatus), myOrgs(user).map(termStewardOrg));
}

export function copyrightStatusFilter(): QueryDslQueryContainer[] {
    return [
        termCopyrightStatus('Public domain, free to use'),
        termCopyrightStatus('Copyrighted, but free to use'),
        termCopyrightStatus('Copyrighted, with restrictions'),
    ];
}

const searchTemplate: Record<ModuleItem, SearchRequest> = {
    cde: {
        index: config.elastic.index.name,
    },
    form: {
        index: config.elastic.formIndex.name,
    },
};

export async function elasticsearchInfo() {
    const esResponse = await esClient.info();
    return esResponse.body;
}

export function elasticsearchPromise<T extends ModuleItem>(
    type: T,
    query: SearchRequest['body']
): Promise<T extends 'cde' ? ElasticResponseDataDe : ElasticResponseDataForm> {
    return new Promise((resolve, reject) => {
        elasticsearch(type, query, (err, result) => (err || !result ? reject(err) : resolve(result)));
    });
}

export function elasticsearch<T extends ModuleItem>(
    type: T,
    query: SearchRequest['body'],
    cb: CbError1<(T extends 'cde' ? ElasticResponseDataDe : ElasticResponseDataForm) | void>
): void {
    const search = searchTemplate[type];
    if (!search) {
        return cb(new Error('Invalid query'));
    }
    search.body = query;
    search.track_total_hits = true;
    esClient.search<ItemElastic>(search, (error, resp) => {
        if (error) {
            if (resp && resp.statusCode) {
                const errorObj = {
                    origin: 'system.elastic.elasticsearch',
                    badInput: (resp.body as any).error.type === 'search_phase_execution_exception',
                    stack: error.stack,
                    details: JSON.stringify(query),
                };
                errorLogger.error('Error: ElasticSearch Error', errorObj);
                return cb(new Error('Invalid Query'));
            }
            let querystr = 'cannot stringify query';
            try {
                querystr = JSON.stringify(query);
            } catch (e) {}
            errorLogger.error('Error: ElasticSearch Error', {
                origin: 'system.elastic.elasticsearch',
                stack: error.stack,
                details: 'query ' + querystr,
            });
            return cb(new Error('Server Error'));
        }

        const response: ElasticSearchResponseBody<ItemElastic> = resp.body;
        if (responseHitsTotal(response) === 0 && config.name.indexOf('Prod') === -1) {
            consoleLog('No response. QUERY: ' + JSON.stringify(query), 'debug');
        }

        const items: ItemElastic[] = [];
        for (const hit of response.hits.hits) {
            const thisCde = hit._source as DataElementElastic;
            thisCde.score = hit._score ?? 0;
            thisCde.properties = [];
            thisCde.flatProperties = [];
            thisCde.highlight = hit.highlight;
            items.push(thisCde);
        }

        return cb(
            null,
            type === 'cde'
                ? ({
                      aggregations: response.aggregations as ElasticSearchResponseAggregations<DataElementElastic>,
                      cdes: items as DataElementElastic[],
                      maxScore: response.max_score ?? 0,
                      took: response.took,
                      totalItems: responseHitsTotal(response),
                  } as T extends 'cde' ? ElasticResponseDataDe : never)
                : ({
                      aggregations: response.aggregations as ElasticSearchResponseAggregations<CdeFormElastic>,
                      forms: items as CdeFormElastic[],
                      maxScore: response.max_score ?? 0,
                      took: response.took,
                      totalItems: responseHitsTotal(response),
                  } as T extends 'cde' ? never : ElasticResponseDataForm)
        );
    });
}

let lock = false;

function releaseElasticSearchExportLock() {
    lock = false;
}

function lockElasticSearchExportLock() {
    lock = true;
}

export function elasticSearchExport(
    type: 'cde',
    query: NonNullable<SearchRequest['body']>,
    dataCb: CbError1<DataElementElastic | void>
): void;
export function elasticSearchExport(
    type: 'form',
    query: NonNullable<SearchRequest['body']>,
    dataCb: CbError1<CdeFormElastic | void>
): void;
export async function elasticSearchExport(
    type: ModuleItem,
    query: NonNullable<SearchRequest['body']>,
    dataCb: CbError1<DataElementElastic | void> | CbError1<CdeFormElastic | void>
) {
    setTimeout(releaseElasticSearchExportLock, 60 * 60 * 5);
    const streamCb = dataCb as CbError1<ItemElastic | void>;
    if (lock) {
        return streamCb(new Error('Servers busy'));
    }

    lockElasticSearchExportLock();

    query.size = 500;
    delete query.aggregations;

    const search = copyDeep(searchTemplate[type]);
    search.scroll = '1m';
    search.body = query;

    function scrollThrough(responsePrevious: SearchResponse<ItemElastic>) {
        esClient.scroll(
            { scrollId: responsePrevious._scroll_id, scroll: '1m' } as ScrollRequest,
            (err: Error | null, response: ApiResponse<ScrollResponse>) => {
                if (err) {
                    releaseElasticSearchExportLock();
                    errorLogger.error('Error: Elastic Search Scroll Access Error', {
                        origin: 'system.elastic.elasticsearch',
                        stack: new Error().stack,
                    });
                    streamCb(new Error('ES Error'));
                } else {
                    processScroll(response.body as any);
                }
            }
        );
    }

    function processScroll(response: SearchResponse<ItemElastic>) {
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

    const response = await esClient.search<ItemElastic>(search);
    processScroll(response.body);
}

export function scrollExport(
    query: NonNullable<SearchRequest['body']>,
    type: ModuleItem,
    cb: CbError1<ElasticSearchResponse<ElasticSearchResponseBody<ItemElastic>>>
) {
    query.size = 100;
    delete query.aggregations;

    const search = copyDeep(searchTemplate[type]);
    search.scroll = '1m';
    search.body = query;

    esClient.search<ItemElastic>(search, cb);
}

export function scrollNext(scrollId: string, cb: CbError1<ApiResponse<ScrollResponse<CdeFormElastic>>>) {
    esClient.scroll({ scrollId, scroll: '1m' } as any, cb);
}

export const queryMostViewed = {
    size: 10,
    query: esqBoolFilter(esqBoolShould([termRegStatus('Standard'), termRegStatus('Qualified')])),
    sort: {
        views: 'desc',
    },
};

export const queryNewest = {
    size: 10,
    query: esqBoolFilter(esqBoolShould([termRegStatus('Standard'), termRegStatus('Qualified')])),
    sort: {
        _script: {
            type: 'number',
            script:
                "doc['updated'].value > 0 ? doc['updated'].value : (doc['created'].value > 0 ? doc['created'].value" +
                " : doc['imported'].value)",
            order: 'desc',
        },
    },
};

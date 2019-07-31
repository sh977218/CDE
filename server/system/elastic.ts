import { eachOf, filter, forEach } from 'async';
import { Client, SearchResponse } from 'elasticsearch';
import { Document } from 'mongoose';
import { handleError, respondError } from '../errorHandler/errorHandler';
import { config } from '../system/parseConfig';
import { DataElementElastic } from 'shared/de/dataElement.model';
import {
    Cb, Cb1, CbErr, CbError, CbError1, ElasticQueryResponse, ItemElastic, ModuleItem, User
} from 'shared/models.model';
import { ElasticIndex } from '../system/elasticSearchInit';
import { Cursor } from 'mongodb';
import { SearchSettingsElastic } from 'search/search.model';
import { orderedList } from 'shared/system/regStatusShared';
import { arrayFill } from 'shared/system/util';

const _ = require('lodash');
const request = require('request');
const logging = require('./logging');
const usersvc = require('./usersrvc');
const esInit = require('./elasticSearchInit');
const dbLogger = require('../log/dbLogger');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const boardDb = require('../board/boardDb');
const noDbLogger = require('./noDbLogger');

type ElasticCondition = any;
type MongoCondition = any;

interface DbItem {
    dao: Document,
    name: ModuleItem,
    count: (query: MongoCondition, cb: CbError1<number>) => void;
    getStream: (query: MongoCondition) => Cursor
}

interface DbQuery {
    condition: MongoCondition,
    dao: DbItem,
}

interface DbStream {
    query: DbQuery,
    indexes: ElasticIndex[]
}

export const esClient = new Client({
    hosts: config.elastic.hosts
});

export function removeElasticFields(elt: ItemElastic) {
    delete elt.classificationBoost;
    delete elt.flatClassifications;
    delete elt.primaryNameCopy;
    delete elt.stewardOrgCopy;
    delete elt.flatProperties;
    if (elt.valueDomain) { delete elt.valueDomain.nbOfPVs; }
    delete elt.primaryDefinitionCopy;
    delete elt.flatMeshSimpleTrees;
    delete elt.flatMeshTrees;
    delete elt.flatIds;
    delete elt.usedByOrgs;
    delete elt.registrationState.registrationStatusSortOrder;
    return elt;
}

export function nbOfCdes(cb: CbError<number>) {
    esClient.count({index: config.elastic.index.name}, function(err, result) {
        cb(err, result.count);
    });
}

export function nbOfForms(cb: CbError<number>) {
    esClient.count({index: config.elastic.formIndex.name}, (err, result) => cb(err, result.count));
}

const queryDe = {
    condition: {archived: false},
    dao: mongo_cde
};
const queryForm = {
    condition: {archived: false},
    dao: mongo_form
};
export const daoMap: { [key: string]: DbQuery } = {
    cde: queryDe,
    form: queryForm,
    board: {
        condition: {},
        dao: boardDb
    },
    cdeSuggest: queryDe,
    formSuggest: queryForm
};

export function reIndex(index: ElasticIndex, cb: CbError) {
    reIndexStream({query: daoMap[index.name], indexes: [index]}, cb);
}

const BUFFER_MAX_SIZE = 10000000; // ~10MB
const DOC_MAX_SIZE = BUFFER_MAX_SIZE;

export function reIndexStream(dbStream: DbStream, cb?: Cb) {
    createIndex(dbStream, handleError({}, () => {
        const riverFunctions = dbStream.indexes.map(index => index.filter || ((elt: ItemElastic, cb: Cb1<ItemElastic>) => cb(elt)));
        const buffers: Buffer[] = arrayFill<Buffer>(dbStream.indexes.length, () => Buffer.alloc(BUFFER_MAX_SIZE));
        const bufferOffsets = new Array(dbStream.indexes.length).fill(0);
        const nextCommandBuffer = Buffer.alloc(DOC_MAX_SIZE);
        let nextCommandOffset = 0;
        const startTime = new Date().getTime();
        const indexTypes = dbStream.indexes.map(index => Object.keys(index.indexJson.mappings)[0]);

        dbStream.indexes.forEach(index => {
            index.count = 0;
        });

        const inject = (i: number, cb = _.noop) => {
            (function bulkIndex(req, cb, retries = 1) {
                request.post(config.elastic.hosts + '/_bulk', {
                    headers: {'Content-Type': 'application/x-ndjson'},
                    agentOptions: {
                        rejectUnauthorized: false
                    },
                    body: req
                }, (err: Error | undefined) => {
                    if (err) {
                        if (retries) {
                            setTimeout(function() {
                                bulkIndex(req, cb, --retries);
                            }, 2000);
                        } else {
                            dbLogger.logError({
                                message: 'Unable to Index in bulk',
                                origin: 'system.elastic.inject',
                                stack: err,
                                details: ''
                            });
                            cb();
                        }
                    } else {
                        dbLogger.consoleLog('ingested: ' + dbStream.indexes[i].count);
                        cb();
                    }
                });
            })(buffers[i].toString(undefined, 0, bufferOffsets[i]), cb);
            // reset
            bufferOffsets[i] = 0;
        };

        dbStream.query.dao.count(dbStream.query.condition, (err: Error | undefined, totalCount: number) => {
            if (err) { dbLogger.consoleLog(`Error getting count: ${err}`, 'error'); }
            dbLogger.consoleLog('Total count for ' + dbStream.query.dao.name + ' is ' + totalCount);
            dbStream.indexes.forEach(index => {
                index.totalCount = totalCount;
            });
        });
        const cursor = dbStream.query.dao.getStream(dbStream.query.condition);

        (function processOneDocument(cursor) {
            cursor.next((err: Error | undefined, doc) => {
                if (err) {
                    // err
                    dbLogger.consoleLog('Error getting cursor: ' + err);
                    return;
                }
                if (!doc) {
                    // end
                    eachOf(dbStream.indexes, (index: ElasticIndex, i, doneOne) => {
                        inject(i as number, () => {
                            const info = `done ingesting ${index.name} in : ` + (new Date().getTime() - startTime) / 1000
                                + ` secs. count: ${index.count}`;
                            noDbLogger.noDbLogger.info(info);
                            dbLogger.consoleLog(info);
                            doneOne();
                        });
                    }, () => {
                        if (cb) { cb(); }
                    });
                    return;
                }
                // data
                const docObj = doc.toObject();
                dbStream.indexes.forEach((index, i) => {
                    riverFunctions[i](docObj, (doc: ItemElastic) => {
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
                                _type: indexTypes[i],
                                _id: doc.tinyId || doc._id
                            }
                        });
                        delete doc._id;
                        nextCommand(doc);
                        if (bufferOffsets[i] + nextCommandOffset > BUFFER_MAX_SIZE) {
                            inject(i);
                        }
                        bufferOffsets[i] += nextCommandBuffer.copy(buffers[i], bufferOffsets[i], 0, nextCommandOffset);
                        index.count!++;
                    });
                });
                setTimeout(() => {
                    processOneDocument(cursor);
                }, 0);
            });
        })(cursor);
    }));
}

function createIndex(dbStream: DbStream, cb: Cb) {
    filter(dbStream.indexes, (index: ElasticIndex, doneOne) => {
        esClient.indices.exists({index: index.indexName}, (err, indiceExists) => {
            if (err) {
                return doneOne(err);
            }
            if (indiceExists) {
                dbLogger.consoleLog('index already exists: ' + index.indexName);
                doneOne(undefined, false);
            } else {
                dbLogger.consoleLog('creating index: ' + index.indexName);
                esClient.indices.create({
                    index: index.indexName,
                    timeout: '10s',
                    body: index.indexJson
                }, err => {
                    if (err) {
                        respondError(err);
                    } else {
                        dbLogger.consoleLog('index Created: ' + index.indexName);
                    }
                    doneOne(undefined, true);
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
    esInit.indices.forEach((index: ElasticIndex) => {
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

export function completionSuggest(term: ElasticCondition, user: User,
                                  settings: SearchSettingsElastic, indexName: string, cb: Cb<SearchResponse<ItemElastic>>) {
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
                    {bool: {should: regStatusFilter(user, settings)}}
                ]
            }
        }
    };

    esClient.search<ItemElastic>({
        index: indexName,
        body: suggestQuery
    }, (error, response) => {
        if (error) {
            cb(error);
        } else {
            cb(response);
        }
    });
}


export function regStatusFilter(user: User, settings: SearchSettingsElastic) {
    // Filter by selected Statuses
    if (settings.selectedStatuses.length > 0) {
        return settings.selectedStatuses.map(
            regStatus => ({term: {'registrationState.registrationStatus': regStatus}})
        );
    } else {
        let filterRegStatusTerms: ElasticCondition = settings.visibleStatuses!.map(
            regStatus => ({term: {'registrationState.registrationStatus': regStatus}})
        );
        // Filter by Steward
        if (user) {
            const curatorOf = user.orgAdmin.concat(user.orgCurator);
            filterRegStatusTerms = filterRegStatusTerms.concat(
                curatorOf.map(o => ({term: {'stewardOrg.name': o}}))
            );
        }
        return filterRegStatusTerms;
    }
}

export function buildElasticSearchQuery(user: User, settings: SearchSettingsElastic) {
    function escapeRegExp(str: string) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace('<', '');
    }

    // Increase ranking score for high registration status
    const script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

    // Search for the query term given by user
    const hasSearchTerm = !!settings.searchTerm;

    // last resort, we sort.
    let sort = !hasSearchTerm;

    // (function setFilters() {
    const filterRegStatusTerms = regStatusFilter(user, settings);

    // Filter by selected Datatypes
    const filterDatatypeTerms = settings.selectedDatatypes && settings.selectedDatatypes.map(datatype => {
        return {term: {'valueDomain.datatype': datatype}};
    });

    settings.filter = {
        bool: {
            filter: [
                {bool: {should: filterRegStatusTerms}}
            ]
        }
    };

    if (filterDatatypeTerms && filterDatatypeTerms.length > 0) {
        settings.filter.bool.filter.push({bool: {should: filterDatatypeTerms}});
    }

    if (settings.visibleStatuses
        && settings.visibleStatuses.indexOf('Retired') === -1
        && settings.selectedStatuses.indexOf('Retired') === -1) {
        settings.filter.bool.filter.push({bool: {must_not: {term: {'registrationState.registrationStatus': 'Retired'}}}});
    }

    settings.filterDatatype = {
        bool: {should: filterRegStatusTerms}
    };

    const queryStuff: ElasticCondition = {
        post_filter: settings.filter,
        query: {
            bool: {
                must: [
                    {
                        dis_max: {
                            queries: [
                                {
                                    function_score: {
                                        query: hasSearchTerm ? {
                                            query_string: {
                                                analyze_wildcard: true,
                                                query: settings.searchTerm
                                            }
                                        } : undefined,
                                        script_score: {script}
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        size: settings.resultPerPage ? settings.resultPerPage : 20
    };

    if (hasSearchTerm) {
        queryStuff.query.bool.must[0].dis_max.queries.push({
            function_score: {
                boost: '2.5',
                query: { // Boost rank if matches are on designation or definition
                    query_string: {
                        fields: ['primaryNameCopy^5', 'primaryDefinitionCopy^2'],
                        analyze_wildcard: true,
                        query: settings.searchTerm
                    }
                },
                script_score: {script}
            }
        });

        // Boost rank if we find exact string match, or if terms are in a less than 4 terms apart.
        if (settings.searchTerm!.indexOf('"') < 0) {
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = '2';
            queryStuff.query.bool.must[0].dis_max.queries.push({
                function_score: {
                    boost: 4,
                    query: {
                        query_string: {
                            fields: ['primaryNameCopy^5', 'primaryDefinitionCopy^2'],
                            analyze_wildcard: true,
                            query: '"' + settings.searchTerm + '"~4'
                        }
                    },
                    script_score: {script}
                }
            });
        }
    }

    // Filter by selected org
    if (settings.selectedOrg) {
        queryStuff.query.bool.must.push({term: {'classification.stewardOrg.name': settings.selectedOrg}});
    }
    if (settings.selectedOrgAlt) {
        queryStuff.query.bool.must.push({term: {'classification.stewardOrg.name': settings.selectedOrgAlt}});
    }
    if (settings.excludeAllOrgs) {
        queryStuff.query.bool.must.push({term: {classificationSize: 1}});
    } else {
        if (settings.excludeOrgs && settings.excludeOrgs.length > 0) {
            settings.excludeOrgs.forEach(o => {
                queryStuff.query.bool.must_not = {term: {'classification.stewardOrg.name': o}};
            });
        }
    }

    // filter by topic
    if (settings.meshTree) {
        sort = false;
        // boost for those with fewer mesh trees
        queryStuff.query.bool.must.push({
            dis_max: {
                queries: [{
                    function_score: {
                        script_score: {
                            script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) / (doc['flatMeshTrees'].values.size() + 1)"
                        }
                    }
                }]
            }
        });
        queryStuff.query.bool.must.push({term: {flatMeshTrees: settings.meshTree}});
    }

    const flatSelection = settings.selectedElements ? settings.selectedElements.join(';') : '';
    if (settings.selectedOrg && flatSelection !== '') {
        sort = false;
        // boost for those elts classified fewer times
        queryStuff.query.bool.must.push({
            dis_max: {
                queries: [{
                    function_score: {
                        script_score: {
                            script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) / (doc['flatClassifications'].values.size() + 1)"
                        }
                    }
                }]
            }
        });
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrg + ';' + flatSelection}});
    }

    const flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(';') : '';
    if (settings.selectedOrgAlt && flatSelectionAlt !== '') {
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrgAlt + ';' + flatSelectionAlt}});
    }

    if (!settings.visibleStatuses || settings.visibleStatuses.length === 0) {
        settings.visibleStatuses = orderedList;
    }

    // show statuses that either you selected, or it's your org and it's not retired.
    const regStatusAggFilter: ElasticCondition = {
        bool: {
            filter: [
                {
                    bool: {
                        should: settings.visibleStatuses!.concat(settings.selectedStatuses).map(regStatus => {
                            return {term: {'registrationState.registrationStatus': regStatus}};
                        })
                    }
                }
            ]
        }
    };
    if (usersvc.myOrgs(user).length > 0) {
        usersvc.myOrgs(user).map((org: string) => {
            regStatusAggFilter.bool.filter[0].bool.should.push({term: {'stewardOrg.name': org}});
        });
    }

    if (settings.visibleStatuses!.indexOf('Retired') === -1 && settings.selectedStatuses.indexOf('Retired') === -1) {
        regStatusAggFilter.bool.filter.push({bool: {must_not: {term: {'registrationState.registrationStatus': 'Retired'}}}});
    }

    if (sort) {
        queryStuff.sort = {
            'registrationState.registrationStatusSortOrder': 'asc',
            classificationBoost: 'desc',
            'primaryNameCopy.raw': 'asc'
        };
    }

    // Get aggregations on classifications and statuses
    if (settings.includeAggregations) {
        queryStuff.aggregations = {
            orgs: {
                filter: settings.filter,
                aggs: {
                    orgs: {
                        terms: {
                            field: 'classification.stewardOrg.name',
                            size: 500,
                            order: {
                                _term: 'desc'
                            }
                        }
                    }
                }
            },
            statuses: {
                filter: regStatusAggFilter,
                aggs: {
                    statuses: {
                        terms: {
                            field: 'registrationState.registrationStatus'
                        }
                    }
                }
            }
        };

        const flattenClassificationAggregations = function(variableName: string, orgVariableName: string, selectionString: string) {
            const flatClassifications: ElasticCondition = {
                terms: {
                    size: 500,
                    field: 'flatClassifications'
                }
            };
            if (selectionString === '') {
                flatClassifications.terms.include = escapeRegExp(settings[orgVariableName]) + ';[^;]+';
            } else {
                flatClassifications.terms.include = escapeRegExp(settings[orgVariableName]) + ';' + escapeRegExp(selectionString) + ';[^;]+';
            }
            queryStuff.aggregations[variableName] = {
                filter: settings.filter,
                aggs: {}
            };
            queryStuff.aggregations[variableName].aggs[variableName] = flatClassifications;
        };
        if (settings.selectedOrg) {
            flattenClassificationAggregations('flatClassifications', 'selectedOrg', flatSelection);
        }
        if (settings.selectedOrgAlt) {
            flattenClassificationAggregations('flatClassificationsAlt', 'selectedOrgAlt', flatSelectionAlt);
        }

        queryStuff.aggregations.meshTrees = {
            filter: settings.filter,
            aggs: {
                meshTrees: {
                    terms: {
                        size: 50,
                        field: 'flatMeshTrees',
                        include: '[^;]+'
                    }
                }
            }
        };

        if (settings.meshTree && settings.meshTree.length > 0) {
            queryStuff.aggregations.meshTrees.aggs.meshTrees.terms.include = escapeRegExp(settings.meshTree) + ';[^;]+';
        }

        queryStuff.aggregations.twoLevelMesh = {
            filter: settings.filter,
            aggs: {
                twoLevelMesh: {
                    terms: {
                        size: 500,
                        field: 'flatMeshTrees',
                        // include: '[^;]+'
                        include: '[^;]+;[^;]+'
                    }
                }
            }
        };

    }

    if (queryStuff.query.bool.must.length === 0) {
        delete queryStuff.query.bool.must;
    }

    queryStuff.from = (settings.page! - 1) * settings.resultPerPage!;
    if (!queryStuff.from || queryStuff.from < 0) {
        queryStuff.from = 0;
    }

    // highlight search results if part of the following fields.
    queryStuff.highlight = {
        require_field_match: false,
        fragment_size: 150,
        order: 'score',
        pre_tags: ['<strong>'],
        post_tags: ['</strong>'],
        fields: {
            'stewardOrgCopy.name': {},
            primaryNameCopy: {},
            primaryDefinitionCopy: {number_of_fragments: 1},
            'designations.designation': {},
            'definitions.definition': {},
            'dataElementConcept.concepts.name': {},
            'dataElementConcept.concepts.origin': {},
            'dataElementConcept.concepts.originId': {},
            'property.concepts.name': {},
            'property.concepts.origin': {},
            'property.concepts.originId': {},
            'objectClass.concepts.name': {},
            'objectClass.concepts.origin': {},
            'objectClass.concepts.originId': {},
            'valueDomain.datatype': {},
            'valueDomain.permissibleValues.permissibleValue': {},
            'valueDomain.permissibleValues.valueMeaningName': {},
            'valueDomain.permissibleValues.valueMeaningCode': {},
            flatProperties: {},
            flatIds: {},
            'classification.stewardOrg.name': {},
            'classification.elements.name': {},
            'classification.elements.elements.name': {},
            'classification.elements.elements.elements.name': {},
        },
    };
    return queryStuff;
}

export function isSearch(settings: SearchSettingsElastic) {
    return settings && (settings.searchTerm || settings.selectedOrg || settings.meshTree);
}

const searchTemplate: { [key: string]: any } = {
    cde: {
        index: config.elastic.index.name,
        type: 'dataelement'
    },
    form: {
        index: config.elastic.formIndex.name,
        type: 'form'
    }
};


export function elasticsearch(type: ModuleItem, query: any, settings: any, cb: CbErr<any>) {
    const search = searchTemplate[type];
    if (!search) { return cb('Invalid query'); }
    search.body = query;
    esClient.search(search, (error, resp) => {
        const response = resp as ElasticQueryResponse;
        if (error) {
            if (response && response.status === 400) {
                if (response.error!.type !== 'search_phase_execution_exception') {
                    logging.errorLogger.error('Error: ElasticSearch Error',
                        {
                            origin: 'system.elastic.elasticsearch',
                            stack: error.stack,
                            details: JSON.stringify(query)
                        });
                }
                cb('Invalid Query');
            } else {
                let querystr = 'cannot stringify query';
                try {
                    querystr = JSON.stringify(query);
                } catch (e) {
                }
                logging.errorLogger.error('Error: ElasticSearch Error',
                    {
                        origin: 'system.elastic.elasticsearch',
                        stack: error.stack,
                        details: 'query ' + querystr
                    });
                cb('Server Error');
            }
        } else {
            if (response.hits.total === 0 && config.name.indexOf('Prod') === -1) {
                dbLogger.consoleLog('No response. QUERY: ' + JSON.stringify(query), 'debug');
            }

            const result: any = {
                totalNumber: response.hits.total
                , maxScore: response.hits.max_score
                , took: response.took
            };
            result[type + 's'] = [];
            for (let i = 0; i < response.hits.hits.length; i++) {
                const thisCde: DataElementElastic = response.hits.hits[i]._source;
                thisCde.score = response.hits.hits[i]._score;
                if (thisCde.valueDomain && thisCde.valueDomain.permissibleValues
                    && thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                thisCde.properties = [];
                thisCde.flatProperties = [];
                thisCde.highlight = response.hits.hits[i].highlight;
                result[type + 's'].push(thisCde);
            }
            result.aggregations = response.aggregations;
            cb(undefined, result);
        }
    });
}

let lock = false;

export function elasticSearchExport(dataCb: CbErr<ItemElastic>, query: any, type: ModuleItem) {
    if (lock) { return dataCb('Servers busy'); }

    lock = true;

    query.size = 500;
    delete query.aggregations;

    const search = JSON.parse(JSON.stringify(searchTemplate[type]));
    search.scroll = '1m';
    search.body = query;

    function scrollThrough(response: SearchResponse<ItemElastic>) {
        esClient.scroll<ItemElastic>({scrollId: response._scroll_id!, scroll: '1m'}, (err, response) => {
            if (err) {
                lock = false;
                logging.errorLogger.error('Error: Elastic Search Scroll Access Error',
                    {
                        origin: 'system.elastic.elasticsearch',
                        stack: new Error().stack
                    });
                dataCb('ES Error');
            } else {
                processScroll(response);
            }
        });
    }

    function processScroll(response: SearchResponse<ItemElastic>) {
        if (response.hits.hits.length === 0) {
            lock = false;
            dataCb();
        } else {
            for (let i = 0; i < response.hits.hits.length; i++) {
                dataCb(undefined, response.hits.hits[i]._source);
            }
            scrollThrough(response);
        }
    }

    esClient.search<ItemElastic>(search, (err, response) => {
        if (err) {
            lock = false;
            logging.errorLogger.error('Error: Elastic Search Scroll Query Error',
                {
                    origin: 'system.elastic.elasticsearch',
                    stack: new Error().stack,
                    details: query
                });
            dataCb('ES Error');
        } else {
            processScroll(response);
        }
    });
}

export function scrollExport(query: any, type: ModuleItem, cb: CbError<SearchResponse<ItemElastic>>) {
    query.size = 100;
    delete query.aggregations;

    const search = JSON.parse(JSON.stringify(searchTemplate[type]));
    search.scroll = '1m';
    search.body = query;

    esClient.search(search, cb);
}

export function scrollNext(scrollId: string, cb: CbError<SearchResponse<ItemElastic>>) {
    esClient.scroll({scrollId, scroll: '1m'}, cb);
}

export const queryMostViewed = {
    size: 10,
    query: {
        bool: {
            filter: [
                {
                    bool: {
                        should: [
                            {term: {'registrationState.registrationStatus': 'Standard'}},
                            {term: {'registrationState.registrationStatus': 'Qualified'}}
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
                            {term: {'registrationState.registrationStatus': 'Standard'}},
                            {term: {'registrationState.registrationStatus': 'Qualified'}}
                        ]
                    }
                }
            ]
        }
    },
    sort: {
        _script: {
            type: 'number',
            script: "doc['updated'].value > 0 ? doc['updated'].value : (doc['created'].value > 0 ? doc['created'].value : doc['imported'].value)",
            order: 'desc'
        }
    }
};

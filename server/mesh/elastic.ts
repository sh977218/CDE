import { Dictionary, each, ErrorCallback } from 'async';
import * as _ from 'lodash';
import { consoleLog } from 'server/log/dbLogger';
import { findAll, MeshClassificationDocument } from 'server/mesh/meshDb';
import { errorLogger } from 'server/system/logging';
import { config } from 'server/system/parseConfig';
import { esClient } from 'server/system/elastic';
import { CbError, ElasticQueryResponse, ItemElastic } from 'shared/models.model';

interface IndexType {
    index: string;
    type: string;
}

const searchTemplate = {
    cde: {
        index: config.elastic.index.name,
        type: '_doc',
    },
    form: {
        index: config.elastic.formIndex.name,
        type: '_doc',
    }
};

export function syncWithMesh(cb?: ErrorCallback) {
    findAll((err, allMappings) => doSyncWithMesh(allMappings, cb));
}

let lock = false;

export let meshSyncStatus: any = {
    dataelement: {done: 0},
    form: {done: 0}
};

function doSyncWithMesh(allMappings: MeshClassificationDocument[], callback: ErrorCallback = () => {}) {
    meshSyncStatus = {
        dataelement: {done: 0},
        form: {done: 0}
    };

    const classifToTrees: Dictionary<string[]> = {};
    allMappings.forEach(mapping => {
        // from a;b;c to a a;b a;b;c
        classifToTrees[mapping.flatClassification] = [];
        mapping.flatTrees.forEach(treeNode => {
            classifToTrees[mapping.flatClassification].push(treeNode);
            while (treeNode.indexOf(';') > -1) {
                treeNode = treeNode.substr(0, treeNode.lastIndexOf(';'));
                classifToTrees[mapping.flatClassification].push(treeNode);
            }
        });
    });

    const classifToSimpleTrees: Dictionary<string[]> = {};
    allMappings.forEach(m => classifToSimpleTrees[m.flatClassification] = m.flatTrees);

    const searches: IndexType[] = [_.cloneDeep(searchTemplate.cde), _.cloneDeep(searchTemplate.form)];
    searches.forEach((search: any) => {
        search.scroll = '2m';
        search.body = {};
    });

    function scrollThrough(scrollId: string, s: IndexType, cb: CbError) {
        esClient.scroll({scrollId, scroll: '1m'} as any, (err: Error | null, response: {body: ElasticQueryResponse<ItemElastic>}) => {
            /* istanbul ignore if */
            if (err) {
                lock = false;
                errorLogger.error('Error: Elastic Search Scroll Access Error',
                    {origin: 'system.elastic.syncWithMesh', stack: err.stack});
                cb(err);
            } else {
                processScroll((response.body as any)._scroll_id, s, response.body, cb);
            }
        });
    }

    async function processScroll(newScrollId: string, s: IndexType, response: ElasticQueryResponse<ItemElastic>, cb: CbError) {
        const sName = s.index === config.elastic.index.name ? 'dataelement' : 'form';
        // @TODO remove after ES7 upgrade
        let total = response.hits.total;
        if ((total as any).value > -1) {
            total = (total as any).value;
        }
        meshSyncStatus[sName].total = total;
        if (response.hits.hits.length > 0) {
            const request: any = {body: []};
            response.hits.hits.forEach(hit => {
                const thisElt = hit._source;
                const trees: Set<string> = new Set();
                const simpleTrees: Set<string> = new Set();
                if (!thisElt.flatClassifications) {
                    thisElt.flatClassifications = [];
                }
                thisElt.flatClassifications.forEach(fc => {
                    if (classifToTrees[fc]) {
                        classifToTrees[fc].forEach(node => trees.add(node));
                    }
                    if (classifToSimpleTrees[fc]) {
                        classifToSimpleTrees[fc].forEach(node => simpleTrees.add(node));
                    }
                });
                if (trees.size > 0) {
                    request.body.push({
                        update: {
                            _index: s.index,
                            _id: thisElt.tinyId,
                            _type: '_doc'
                        }
                    });
                    request.body.push({
                        doc: {
                            flatMeshTrees: Array.from(trees),
                            flatMeshSimpleTrees: Array.from(simpleTrees)
                        }
                    });
                }
                meshSyncStatus[sName].done++;
            });
            if (request.body.length > 0) {
                esClient.bulk(request, (err: Error | null) => {
                    if (err) {
                        consoleLog('ERR: ' + err, 'error');
                    }
                    scrollThrough(newScrollId, s, cb);
                });
            } else {
                scrollThrough(newScrollId, s, cb);
            }
        } else {
            consoleLog('done syncing ' + s.index + ' with MeSH');
            if (cb) {
                cb(null);
            }
        }
    }

    each(searches, async search  => {
        const response = await esClient.search(search);
        await new Promise(resolve => processScroll(response.body._scroll_id, search,
            response.body as ElasticQueryResponse<ItemElastic>, resolve));
    }, callback);
}

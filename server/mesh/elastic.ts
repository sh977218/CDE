import { each, ErrorCallback } from 'async';
import { Client } from '@elastic/elasticsearch';
import * as _ from 'lodash';
import { consoleLog } from 'server/log/dbLogger';
import { findAll } from 'server/mesh/meshDb';
import { errorLogger } from 'server/system/logging';
import { config } from 'server/system/parseConfig';
import { Cb, CbError } from 'shared/models.model';
import { esClient } from 'server/system/elastic';

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

function doSyncWithMesh(allMappings, callback: ErrorCallback = () => {}) {
    meshSyncStatus = {
        dataelement: {done: 0},
        form: {done: 0}
    };

    const classifToTrees = {};
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

    const classifToSimpleTrees = {};
    allMappings.forEach(m => classifToSimpleTrees[m.flatClassification] = m.flatTrees);

    const searches: any = [_.cloneDeep(searchTemplate.cde), _.cloneDeep(searchTemplate.form)];
    searches.forEach((search: any) => {
        search.scroll = '2m';
        search.body = {};
    });

    function scrollThrough(scrollId, s, cb) {
        // @ts-ignore
        esClient.scroll({scrollId, scroll: '1m'}, (err, response) => {
            if (err) {
                lock = false;
                errorLogger.error('Error: Elastic Search Scroll Access Error',
                    {origin: 'system.elastic.syncWithMesh', stack: err.stack});
                cb(err);
            } else {
                processScroll(response.body._scroll_id, s, response.body, cb);
            }
        });
    }

    async function processScroll(newScrollId: string, s, response, cb) {
        const sName = s.index === config.elastic.index.name ? 'dataelement' : 'form';
        meshSyncStatus[sName].total = response.hits.total;
        if (response.hits.hits.length > 0) {
            const request: any = {body: []};
            response.hits.hits.forEach(hit => {
                const thisElt = hit._source;
                const trees = new Set();
                const simpleTrees = new Set();
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
                esClient.bulk(request, err => {
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
                cb();
            }
        }
    }

    each(searches, async search  => {
        const response = await esClient.search(search);
        await new Promise(resolve => processScroll(response.body._scroll_id, search, response.body, resolve));
    }, callback);
}

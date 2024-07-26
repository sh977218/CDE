import { config } from 'server';
import { umlsServerRequestJson } from 'server/uts/utsSvc';
import { filter } from 'shared/dictionary';
import { meshLevel1Map } from 'shared/mesh/mesh';
import { isT } from 'shared/util';

// type UtsMeshNonpaginatedReponse = UtsNode[]; // blindly returns only the first 5 results if no pageNumber is included

interface UtsNode {
    _id: string;
    childAui: string;
    paui: string;
    cui: string;
    rootSource: 'MSH';
    relationship: unknown;
    parentTree: UtsNodeParent[];
    children: unknown[];
}

interface UtsNodeParent {
    rootSource: 'MSH';
    ui: string;
    name: string;
}

interface UtsMeshPaginatedResponse {
    pageSize: number;
    pageNumber: number;
    totalCount: number;
    result: UtsNode[];
}

export function getTreeForDescriptor(descriptor: string): Promise<UtsNode[]> {
    if (!descriptor || !descriptor.startsWith('D')) {
        return Promise.resolve([]);
    }

    const nodes: UtsNode[] = [];
    // TODO: missing caching for repeated descriptors

    function fetchNodes(descriptor: string, page: number): Promise<void> {
        return getPage(descriptor, page).then(pageDoc => {
            pageDoc.result.forEach(node => {
                nodes.push(node);
            });
            if (nodes.length < pageDoc.totalCount && pageDoc.result.length) {
                return fetchNodes(descriptor, ++page);
            }
        });
    }

    return fetchNodes(descriptor, 1).then(() => nodes);
}

export function getTreePaths(descriptor: string): Promise<UtsNodeParent[][]> {
    return getTreeForDescriptor(descriptor).then(nodes => {
        return nodes
            .map(node => {
                if (node.rootSource !== 'MSH') {
                    return null;
                }
                const parents: UtsNodeParent[] = [];
                let foundRoot: boolean = false;
                node.parentTree.forEach(parent => {
                    if (foundRoot) {
                        parents.push(parent);
                    } else {
                        if (parent.name.endsWith(' (MeSH Category)')) {
                            // magic string, length 16
                            foundRoot = true;
                            const rootName = parent.name.substring(0, parent.name.length - 16);
                            const meshCode = filter(meshLevel1Map, (code, value) => value === rootName)[0];
                            parents.push({
                                rootSource: 'MSH',
                                ui: meshCode,
                                name: rootName,
                            });
                        }
                    }
                });
                return parents;
            })
            .filter(isT);
    });
}

export function getTreePathsAsName(descriptor: string): Promise<string[][]> {
    return getTreePaths(descriptor).then(p => p.map(parents => parents.map(parent => parent.name)));
}

function getPage(descriptor: string, page: number): Promise<UtsMeshPaginatedResponse> {
    return umlsServerRequestJson<UtsMeshPaginatedResponse>(
        `/content/current/source/MSH/${descriptor}/clusterTree?pageNumber=${page}&apiKey=${config.uts.apikey}`,
        {}
    );
}

import { Dictionary, each } from 'async';
import { RequestHandler, Router } from 'express';
import fetch from 'node-fetch';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { meshSyncStatus, syncWithMesh } from 'server/mesh/elastic';
import { byEltId, byFlatClassification, byId, findAll, MeshClassificationDocument, newMesh } from 'server/mesh/meshDb';
import { config } from 'server/system/parseConfig';
import { handleErrors, json } from 'shared/fetch';
import { Cb1 } from 'shared/models.model';

const meshTopTreeMap: Dictionary<string> = {
    A: 'Anatomy',
    B: 'Organisms',
    C: 'Diseases',
    D: 'Chemicals and Drugs',
    E: 'Analytical, Diagnostic and Therapeutic Techniques, and Equipment',
    F: 'Psychiatry and Psychology',
    G: 'Phenomena and Processes',
    H: 'Disciplines and Occupations',
    I: 'Anthropology, Education, Sociology, and Social Phenomena',
    J: 'Technology, Industry, and Agriculture',
    K: 'Humanities',
    L: 'Information Science',
    M: 'Named Groups',
    N: 'Health Care',
    V: 'Publication Characteristics',
    Z: 'Geographicals'
};

export function module(roleConfig: {allowSyncMesh: RequestHandler}) {
    const router = Router();

    router.get('/eltId/:eltId', (req, res) => {
        byEltId(req.params.eltId, handleNotFound({req, res}, mm => res.send(mm.length ? mm[0] : '{}')));
    });

    router.post('/meshClassification', (req, res) => {
        if (req.body._id) {
            const id = req.body._id;
            delete req.body._id;
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, (trees) => {
                req.body.flatTrees = trees;
                byId(id, handleNotFound({req, res}, elt => {
                    elt.meshDescriptors = req.body.meshDescriptors;
                    elt.flatTrees = req.body.flatTrees;
                    elt.save(handleError<MeshClassificationDocument>({req, res}, o => res.send(o)));
                }));
            });
        } else {
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, (trees) => {
                req.body.flatTrees = trees;
                newMesh(req.body, handleError({req, res}, o => res.send(o)));
            });
        }
    });

    // router.get('/meshClassifications', (req, res) => {
    //     findAll(handleError({req, res}, mm => res.send(mm)));
    // });

    router.get('/meshClassification', (req, res) => {
        if (!req.query.classification) {
            return res.status(400).send('Missing Classification Parameter');
        }
        byFlatClassification(req.query.classification as string, handleNotFound({req, res}, mm => res.send(mm[0])));
    });


    router.post('/syncWithMesh', roleConfig.allowSyncMesh, (req, res) => {
        syncWithMesh();
        res.send();
    });

    router.get('/syncWithMesh', (req, res) => {
        res.send(meshSyncStatus);
    });

    return router;

}

function flatTreesFromMeshDescriptorArray(descArr: string[], cb: Cb1<string[]>) {
    const allTrees = new Set<string>();
    each(descArr, (desc, oneDescDone) => {
        fetch(config.mesh.baseUrl + '/api/record/ui/' + desc)
            .then(handleErrors)
            .then(json)
            .then(oneDescBody => {
                each(oneDescBody.TreeNumberList.TreeNumber, (treeNumber: any, tnDone) => {
                    fetch(config.mesh.baseUrl + '/api/tree/parents/' + treeNumber.t)
                        .then(handleErrors)
                        .then(json)
                        .then(oneTreeBody => {
                            let flatTree: string = meshTopTreeMap[treeNumber.t.substr(0, 1)];
                            if (oneTreeBody && oneTreeBody.length > 0) {
                                flatTree = flatTree + ';' + oneTreeBody.map((a: any) => {
                                    return a.RecordName;
                                }).join(';');
                            }
                            flatTree = flatTree + ';' + oneDescBody.DescriptorName.String.t;
                            allTrees.add(flatTree);
                            tnDone();
                        });
            }, function allTnDone() {
                oneDescDone();
            });
        });
    }, function allDescDone() {
        cb(Array.from(allTrees));
    });
}

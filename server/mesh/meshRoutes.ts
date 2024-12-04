import { each } from 'async';
import { RequestHandler, Response, Router } from 'express';
import * as multer from 'multer';
import fetch from 'node-fetch';
import { config } from 'server';
import { respondError } from 'server/errorHandler';
import { meshSyncStatus, syncWithMesh } from 'server/mesh/elastic';
import { byEltId, byFlatClassification, byId, deleteAll, findAll, newMesh } from 'server/mesh/meshDb';
import { updateMeshMappingsCsv, updateMeshMappingsXls } from 'server/mesh/meshService';
import { handleErrors, json } from 'shared/fetch';
import { meshLevel1Map } from 'shared/mesh/mesh';
import { Cb1 } from 'shared/models.model';

export function module(roleConfig: { allowSyncMesh: RequestHandler }) {
    const router = Router();

    router.get('/eltId/:eltId', (req, res): Promise<Response> => {
        return byEltId(req.params.eltId).then(mm => res.send(mm.length ? mm[0] : '{}'));
    });

    router.post('/meshClassification', (req, res) => {
        if (req.body._id) {
            const id = req.body._id;
            delete req.body._id;
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, trees => {
                req.body.flatTrees = trees;
                return byId(id).then(elt => {
                    if (!elt) {
                        return res.status(404).send();
                    }
                    elt.meshDescriptors = req.body.meshDescriptors;
                    elt.flatTrees = req.body.flatTrees;
                    return elt.save().then(o => res.send(o), respondError({ req, res }));
                }, respondError({ req, res }));
            });
        } else {
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, trees => {
                req.body.flatTrees = trees;
                newMesh(req.body).then(o => res.send(o), respondError({ req, res }));
            });
        }
    });

    router.get('/meshClassifications', (req, res): Promise<Response> => {
        return findAll().then(mm => res.send(mm), respondError({ req, res }));
    });

    router.get('/meshClassification', (req, res): Response | Promise<Response> => {
        if (!req.query.classification) {
            return res.status(400).send('Missing Classification Parameter');
        }
        return byFlatClassification(req.query.classification as string).then(
            mm => res.send(mm[0]),
            respondError({ req, res })
        );
    });

    router.post('/syncWithMesh', roleConfig.allowSyncMesh, (req, res) => {
        syncWithMesh();
        res.send();
    });

    router.get('/syncWithMesh', (req, res) => {
        res.send(meshSyncStatus);
    });

    router.post(
        '/updateMeshMappingCsv',
        multer({
            ...config.multer,
            storage: multer.memoryStorage(),
        }).any(),
        async (req, res) => {
            const fileBuffer = (req.files as any)[0].buffer;
            res.send(await updateMeshMappingsCsv(fileBuffer));
        }
    );

    router.post(
        '/updateMeshMappingXls',
        multer({
            ...config.multer,
            storage: multer.memoryStorage(),
        }).any(),
        async (req, res) => {
            const fileBuffer = (req.files as any)[0].buffer;
            res.send(await updateMeshMappingsXls(fileBuffer));
        }
    );

    router.post('/deleteMeshMapping', (req, res): Promise<Response> => {
        return deleteAll().then(() => res.send(), respondError({ req, res }));
    });

    return router;
}

function flatTreesFromMeshDescriptorArray(descArr: string[], cb: Cb1<string[]>) {
    const allTrees = new Set<string>();
    each(
        descArr,
        (desc, oneDescDone) => {
            fetch(config.mesh.baseUrl + '/api/record/ui/' + desc)
                .then(handleErrors)
                .then(json)
                .then((oneDescBody: any) => {
                    each(
                        oneDescBody.TreeNumberList.TreeNumber,
                        (treeNumber: any, tnDone) => {
                            fetch(config.mesh.baseUrl + '/api/tree/parents/' + treeNumber.t)
                                .then(handleErrors)
                                .then(json)
                                .then((oneTreeBody: any) => {
                                    let flatTree: string = meshLevel1Map[treeNumber.t.substr(0, 1) as 'A'];
                                    if (oneTreeBody && oneTreeBody.length > 0) {
                                        flatTree =
                                            flatTree +
                                            ';' +
                                            oneTreeBody
                                                .map((a: any) => {
                                                    return a.RecordName;
                                                })
                                                .join(';');
                                    }
                                    flatTree = flatTree + ';' + oneDescBody.DescriptorName.String.t;
                                    allTrees.add(flatTree);
                                    tnDone();
                                });
                        },
                        function allTnDone() {
                            oneDescDone();
                        }
                    );
                });
        },
        function allDescDone() {
            cb(Array.from(allTrees));
        }
    );
}

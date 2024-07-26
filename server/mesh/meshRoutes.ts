import { each } from 'async';
import { RequestHandler, Router } from 'express';
import * as multer from 'multer';
import fetch from 'node-fetch';
import { config } from 'server';
import { handleError, handleNotFound } from 'server/errorHandler';
import { meshSyncStatus, syncWithMesh } from 'server/mesh/elastic';
import {
    byEltId,
    byFlatClassification,
    byId,
    deleteAll,
    findAll,
    MeshClassificationDocument,
    newMesh,
} from 'server/mesh/meshDb';
import { updateMeshMappings } from 'server/mesh/meshService';
import { handleErrors, json } from 'shared/fetch';
import { meshLevel1Map } from 'shared/mesh/mesh';
import { Cb1 } from 'shared/models.model';

export function module(roleConfig: { allowSyncMesh: RequestHandler }) {
    const router = Router();

    router.get('/eltId/:eltId', (req, res) => {
        byEltId(
            req.params.eltId,
            handleNotFound({ req, res }, (mm: any) => res.send(mm.length ? mm[0] : '{}'))
        );
    });

    router.post('/meshClassification', (req, res) => {
        if (req.body._id) {
            const id = req.body._id;
            delete req.body._id;
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, trees => {
                req.body.flatTrees = trees;
                byId(
                    id,
                    handleNotFound({ req, res }, elt => {
                        elt.meshDescriptors = req.body.meshDescriptors;
                        elt.flatTrees = req.body.flatTrees;
                        elt.save(handleError<MeshClassificationDocument>({ req, res }, o => res.send(o)));
                    })
                );
            });
        } else {
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, trees => {
                req.body.flatTrees = trees;
                newMesh(
                    req.body,
                    handleError({ req, res }, (o: any) => res.send(o))
                );
            });
        }
    });

    router.get('/meshClassifications', (req, res) => {
        findAll(handleError({ req, res }, mm => res.send(mm)));
    });

    router.get('/meshClassification', (req, res) => {
        if (!req.query.classification) {
            return res.status(400).send('Missing Classification Parameter');
        }
        byFlatClassification(
            req.query.classification as string,
            handleNotFound({ req, res }, mm => res.send(mm[0]))
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
        '/updateMeshMapping',
        multer({
            ...config.multer,
            storage: multer.memoryStorage(),
        }).any(),
        async (req, res) => {
            const csvFileBuffer = (req.files as any)[0].buffer;
            await updateMeshMappings(csvFileBuffer);
            res.send();
        }
    );

    router.post('/deleteMeshMapping', (req, res) => {
        deleteAll(err => {
            if (err) {
                res.status(400).send();
            } else {
                res.send();
            }
        });
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

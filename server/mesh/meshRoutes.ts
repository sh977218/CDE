import { Router } from 'express';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { byEltId, byFlatClassification, byId, MeshClassificationDocument } from 'server/mesh/meshDb';
import { config } from 'server/system/parseConfig';
import { Cb } from 'shared/models.model';

const async = require('async');
const request = require('request');
const elastic = require('./elastic');
const meshDb = require('./meshDb');

const meshTopTreeMap = {
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

export function module(roleConfig) {
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
                meshDb.newMesh(req.body, handleError({req, res}, o => res.send(o)));
            });
        }
    });

    router.get('/meshClassifications', (req, res) => {
        meshDb.findAll(handleError({req, res}, mm => res.send(mm)));
    });

    router.get('/meshClassification', (req, res) => {
        if (!req.query.classification) {
            return res.status(400).send('Missing Classification Parameter');
        }
        byFlatClassification(req.query.classification, handleNotFound({req, res}, mm => res.send(mm[0])));
    });


    router.post('/syncWithMesh', roleConfig.allowSyncMesh, (req, res) => {
        elastic.syncWithMesh();
        res.send();
    });

    router.get('/syncWithMesh', (req, res) => {
        res.send(elastic.meshSyncStatus);
    });

    return router;

}

function flatTreesFromMeshDescriptorArray(descArr: string[], cb: Cb<string[]>) {
    const allTrees = new Set<string>();
    async.each(descArr, (desc, oneDescDone) => {
        request(config.mesh.baseUrl + '/api/record/ui/' + desc, {json: true}, (err, response, oneDescBody) => {
            async.each(oneDescBody.TreeNumberList.TreeNumber, (treeNumber, tnDone) => {
                request(config.mesh.baseUrl + '/api/tree/parents/' + treeNumber.t, {json: true}, (err, response, oneTreeBody) => {
                    let flatTree: string = meshTopTreeMap[treeNumber.t.substr(0, 1)];
                    if (oneTreeBody && oneTreeBody.length > 0) {
                        flatTree = flatTree + ';' + oneTreeBody.map((a) => {
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

const async = require('async');
const request = require('request');

const handleError = require('../log/dbLogger').handleError;

const config = require('../system/parseConfig');
const elastic = require('./elastic');
const meshDb = require('./meshDb');

let meshTopTreeMap = {
    'A': "Anatomy",
    'B': "Organisms",
    'C': "Diseases",
    'D': "Chemicals and Drugs",
    'E': "Analytical, Diagnostic and Therapeutic Techniques, and Equipment",
    'F': "Psychiatry and Psychology",
    'G': "Phenomena and Processes",
    'H': "Disciplines and Occupations",
    'I': "Anthropology, Education, Sociology, and Social Phenomena",
    'J': "Technology, Industry, and Agriculture",
    'K': "Humanities",
    'L': "Information Science",
    'M': "Named Groups",
    'N': "Health Care",
    'V': "Publication Characteristics",
    'Z': "Geographicals"
};


exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/eltId/:eltId', (req, res) => {
        meshDb.byEltId(req.params.eltId, handleError({req, res}, mm => res.send(mm.length ? mm[0] : '{}')));
    });

    router.post('/meshClassification', (req, res) => {
        if (req.body._id) {
            let id = req.body._id;
            delete req.body._id;
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, function (trees) {
                req.body.flatTrees = trees;
                meshDb.byId(id, handleError({req, res}, elt => {
                    elt.meshDescriptors = req.body.meshDescriptors;
                    elt.flatTrees = req.body.flatTrees;
                    elt.save(handleError({req, res}, o => res.send(o)));
                }));
            });
        } else {
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, function (trees) {
                req.body.flatTrees = trees;
                meshDb.newMesh(req.body, handleError({req, res}, o => res.send(o)));
            });
        }
    });

    router.get('/meshClassifications', (req, res) => {
        meshDb.findAll(handleError({req, res}, mm => res.send(mm)));
    });

    router.get('/meshClassification', (req, res) => {
        if (!req.query.classification) return res.status(400).send("Missing Classification Parameter");
        meshDb.byFlatClassification(req.query.classification, handleError({req, res}, mm => res.send(mm[0])))
    });


    router.post("/syncWithMesh", [roleConfig.allowSyncMesh], (req, res) => {
        elastic.syncWithMesh();
        res.send();
    });

    router.get('/syncWithMesh', (req, res) => {
        res.send(elastic.meshSyncStatus);
    });

    return router;

};

function flatTreesFromMeshDescriptorArray(descArr, cb) {
    let allTrees = new Set();
    async.each(descArr, function (desc, oneDescDone) {
        request(config.mesh.baseUrl + "/api/record/ui/" + desc, {json: true}, function (err, response, oneDescBody) {
            async.each(oneDescBody.TreeNumberList.TreeNumber, function (treeNumber, tnDone) {
                request(config.mesh.baseUrl + "/api/tree/parents/" + treeNumber.t, {json: true}, function (err, response, oneTreeBody) {
                    let flatTree = meshTopTreeMap[treeNumber.t.substr(0, 1)];
                    if (oneTreeBody && oneTreeBody.length > 0) {
                        flatTree = flatTree + ";" + oneTreeBody.map(function (a) {
                            return a.RecordName;
                        }).join(";");
                    }
                    flatTree = flatTree + ";" + oneDescBody.DescriptorName.String.t;
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

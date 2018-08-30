const async = require('async');

const handleError = require('../log/dbLogger').handleError;

const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('../system/mongo-data');
const classificationNode = require('./classificationNode');
const classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared.js');
const orgClassificationSvc = require('./orgClassificationSvc');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.post('/addCdeClassification/', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) {
            return res.status(401).send('You do not permission to do this.');
        }
        let invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send(invalidateRequest);
        classificationNode.addClassification(req.body, mongo_cde, handleError({req, res}, result => {
            if (result === 'Classification Already Exists') return res.status(409).send(result);
            res.send(result);
            mongo_data.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: [{
                    _id: req.body.eltId
                }],
                action: 'add',
                path: [req.body.orgName].concat(req.body.categories)
            });

        }));
    });
    router.post('/removeCdeClassification/', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) {
            return res.status(401).send({error: 'You do not permission to do this.'});
        }
        let invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send({error: invalidateRequest});
        classificationNode.removeClassification(req.body, mongo_cde, handleError({req, res}, elt => {
            res.send(elt);
            mongo_data.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: [{
                    _id: req.body.eltId
                }],
                action: 'delete',
                path: [req.body.orgName].concat(req.body.categories)
            });
        }));
    });

    router.post('/addFormClassification/', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) {
            return res.status(401).send('You do not permission to do this.');
        }
        let invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send(invalidateRequest);
        classificationNode.addClassification(req.body, mongo_form, handleError({req, res}, result => {
            if (result === 'Classification Already Exists') return res.status(409).send(result); else res.send(result);
            mongo_data.addToClassifAudit({
                date: new Date(), user: {
                    username: req.user.username
                }, elements: [{
                    _id: req.body.eltId
                }], action: 'add', path: [req.body.orgName].concat(req.body.categories)
            });
        }));
    });
    router.post('/removeFormClassification/', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) {
            return res.status(401).send({error: 'You do not permission to do this.'});
        }
        let invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send({error: invalidateRequest});
        classificationNode.removeClassification(req.body, mongo_form, handleError({req, res}, elt => {
            res.send(elt);
            mongo_data.addToClassifAudit({
                date: new Date(), user: {
                    username: req.user.username
                }, elements: [{
                    _id: req.body.eltId
                }], action: 'delete', path: [req.body.orgName].concat(req.body.categories)
            });
        }));
    });

    router.post('/classifyCdeBoard', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.newClassification.orgName)) {
            return res.status(401).send();
        }
        classificationNode.classifyEltsInBoard(req, mongo_cde, handleError({req, res}, () => res.send('')));
    });
    router.post('/classifyFormBoard', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.newClassification.orgName)) {
            return res.status(401).send('');
        }
        classificationNode.classifyEltsInBoard(req, mongo_form, handleError({req, res}, () => res.send('')));
    });

    // @TODO: classification to own file
    // delete org classification
    router.post('/deleteOrgClassification/', (req, res) => {
        let deleteClassification = req.body.deleteClassification;
        let settings = req.body.settings;
        if (!deleteClassification || !settings) return res.status(400).send();
        if (!roleConfig.allowClassify(req.user, deleteClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus('deleteClassification', handleError({req, res}, j => {
            if (j) return res.status(409).send('Error - delete classification is in processing, try again later.');
            orgClassificationSvc.deleteOrgClassification(req.user, deleteClassification, settings,
                handleError({req, res}, () => {
                }));
            res.status(102).send('Deleting in progress.');
        }));
    });

    // rename org classification
    router.post('/renameOrgClassification', (req, res) => {
        let newClassification = req.body.newClassification;
        let newName = req.body.newClassification.newName;
        let settings = req.body.settings;
        if (!newName || !newClassification || !settings) return res.status(400).send();
        if (!roleConfig.allowClassify(req.user, newClassification.orgName)) return res.status(401).end();
        mongo_data.jobStatus('renameClassification', handleError({req, res}, j => {
            if (j) return res.status(409).send('Error - rename classification is in processing, try again later.');
            orgClassificationSvc.renameOrgClassification(req.user, newClassification, settings,
                handleError({req, res}, () => {
                }));
            res.status(102).send('Renaming in progress.');
        }));
    });

    // add org classification
    router.put('/addOrgClassification/', (req, res) => {
        let newClassification = req.body.newClassification;
        if (!newClassification) return res.status(400).send();
        if (!roleConfig.allowClassify(req.user, newClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus('addClassification', handleError({req, res}, j => {
            if (j) return res.status(409).send('Error - delete classification is in processing, try again later.');
            orgClassificationSvc.addOrgClassification(newClassification, handleError({req, res},
                () => res.send('Classification added.')));
        }));
    });

    // reclassify org classification
    router.post('/reclassifyOrgClassification', (req, res) => {
        let oldClassification = req.body.oldClassification;
        let newClassification = req.body.newClassification;
        let settings = req.body.settings;
        if (!oldClassification || !newClassification || !settings) return res.status(400).send();
        if (!roleConfig.allowClassify(req.user, newClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus('reclassifyClassification', handleError({req, res}, j => {
                if (j) return res.status(409).send('Error - reclassify classification is in processing, try again later.');
                orgClassificationSvc.reclassifyOrgClassification(req.user, oldClassification, newClassification, settings,
                    handleError({req, res}, () => {
                    }));
                res.status(102).send('Reclassifying in progress.');
            })
        )
    });


    let bulkClassifyCdesStatus = {};

    function bulkClassifyCdes(user, eltId, elements, body, cb) {
        if (!bulkClassifyCdesStatus[user.username + eltId]) {
            bulkClassifyCdesStatus[user.username + eltId] = {
                numberProcessed: 0,
                numberTotal: elements.length
            }
        }
        async.forEachSeries(elements, function (element, doneOneElement) {
            let classifReq = {
                orgName: body.orgName,
                categories: body.categories,
                tinyId: element.id,
                version: element.version
            };
            classificationNode.eltClassification(classifReq, classificationShared.actions.create, mongo_cde, function (err) {
                bulkClassifyCdesStatus[user.username + eltId].numberProcessed++;
                doneOneElement();
            });
        }, function doneAllElement(errs) {
            if (cb) cb(errs);
        })
    };

    function resetBulkClassifyCdesStatus(statusObjId) {
        delete bulkClassifyCdesStatus[statusObjId];
    };

    // TODO this works only for CDEs. Forms TODO later.
    router.post('/bulk/tinyId', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) return res.status(403).send('Not Authorized');
        if (!req.body.orgName || !req.body.categories) return res.status(400).send('Bad Request');
        let elements = req.body.elements;
        if (elements.length <= 50) {
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body, handleError({req, res}, () =>
                res.send('Done')));
        }
        else {
            res.status(102).send('Processing');
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body);
        }
        mongo_data.addToClassifAudit({
            date: new Date(),
            user: {
                username: req.user.username
            },
            elements: elements,
            action: 'add',
            path: [req.body.orgName].concat(req.body.categories)
        });
    });

    router.get('/bulkClassifyCdeStatus/:eltId', (req, res) => {
        let formId = req.param('eltId');
        if (!formId) return res.status(400).send('Bad Request');
        let result = bulkClassifyCdesStatus[req.user.username + req.params.eltId];
        if (result) return res.send(result);
        res.send({});
    });

    router.get('/resetBulkClassifyCdesStatus/:eltId', (req, res) => {
        let formId = req.param('eltId');
        if (!formId) return res.status(400).send('Bad Request');
        resetBulkClassifyCdesStatus(req.user.username + req.param('eltId'));
        res.end();
    });

    return router;
};
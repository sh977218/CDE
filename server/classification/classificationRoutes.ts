import { forEachSeries } from 'async';
import { Router } from 'express';
import { handleError } from 'server/errorHandler/errorHandler';
import { actions } from 'shared/system/classificationShared';
import { Cb } from 'shared/models.model';
import { updateOrgClassification } from 'server/classification/orgClassificationSvc';
import { orgByName } from 'server/orgManagement/orgDb';

const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('../system/mongo-data');
const classificationNode = require('./classificationNode');
const orgClassificationSvc = require('./orgClassificationSvc');

require('express-async-errors');

export function module(roleConfig) {
    const router = Router();

    router.post('/addCdeClassification/', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) {
            return res.status(401).send();
        }
        const invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) { return res.status(400).send(invalidateRequest); }
        classificationNode.addClassification(req.body, mongo_cde, handleError({req, res}, result => {
            if (result === 'Classification Already Exists') { return res.status(409).send(result); }
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
            return res.status(401).send();
        }
        const invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) { return res.status(400).send({error: invalidateRequest}); }
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
            return res.status(401).send();
        }
        const invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) { return res.status(400).send(invalidateRequest); }
        classificationNode.addClassification(req.body, mongo_form, handleError({req, res}, result => {
            if (result === 'Classification Already Exists') { return res.status(409).send(result); } else { res.send(result); }
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
            return res.status(401).send();
        }
        const invalidateRequest = classificationNode.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) { return res.status(400).send({error: invalidateRequest}); }
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
            return res.status(401).send();
        }
        classificationNode.classifyEltsInBoard(req, mongo_form, handleError({req, res}, () => res.send('')));
    });

    // @TODO: classification to own file
    // delete org classification
    router.post('/deleteOrgClassification/', (req, res) => {
        const deleteClassification = req.body.deleteClassification;
        const settings = req.body.settings;
        if (!deleteClassification || !settings) { return res.status(400).send(); }
        if (!roleConfig.allowClassify(req.user, deleteClassification.orgName)) { return res.status(403).send(); }
        mongo_data.jobStatus('deleteClassification', handleError({req, res}, j => {
            if (j) { return res.status(409).send('Error - delete classification is in processing, try again later.'); }
            orgClassificationSvc.deleteOrgClassification(req.user, deleteClassification, settings,
                handleError({req, res}, () => {}));
            res.status(202).send('Deleting in progress.');
        }));
    });

    // rename org classification
    router.post('/renameOrgClassification', (req, res) => {
        const newClassification = req.body.newClassification;
        const newName = req.body.newClassification.newName;
        const settings = req.body.settings;
        if (!newName || !newClassification || !settings) { return res.status(400).send(); }
        if (!roleConfig.allowClassify(req.user, newClassification.orgName)) { return res.status(401).end(); }
        mongo_data.jobStatus('renameClassification', handleError({req, res}, j => {
            if (j) { return res.status(409).send('Error - rename classification is in processing, try again later.'); }
            orgClassificationSvc.renameOrgClassification(req.user, newClassification, settings,
                handleError({req, res}, () => {
                }));
            res.status(202).send('Renaming in progress.');
        }));
    });

    // add org classification
    router.put('/addOrgClassification/', (req, res) => {
        const newClassification = req.body.newClassification;
        if (!newClassification) { return res.status(400).send(); }
        if (!roleConfig.allowClassify(req.user, newClassification.orgName)) { return res.status(403).send(); }
        mongo_data.jobStatus('addClassification', handleError({req, res}, j => {
            if (j) { return res.status(409).send('Error - delete classification is in processing, try again later.'); }
            orgClassificationSvc.addOrgClassification(newClassification, handleError({req, res},
                () => res.send('Classification added.')));
        }));
    });

    // reclassify org classification
    router.post('/reclassifyOrgClassification', (req, res) => {
        const oldClassification = req.body.oldClassification;
        const newClassification = req.body.newClassification;
        const settings = req.body.settings;
        if (!oldClassification || !newClassification || !settings) { return res.status(400).send(); }
        if (!roleConfig.allowClassify(req.user, newClassification.orgName)) { return res.status(403).send(); }
        mongo_data.jobStatus('reclassifyClassification', handleError({req, res}, j => {
                if (j) { return res.status(409).send('Error - reclassify classification is in processing, try again later.'); }
                orgClassificationSvc.reclassifyOrgClassification(req.user, oldClassification, newClassification, settings,
                    handleError({req, res}, () => {
                    }));
                res.status(202).send('Reclassifying in progress.');
            })
        );
    });

    // update org classification
    router.post('/updateOrgClassification', async (req, res) => {
        const orgName = req.body.orgName;
        if (!roleConfig.allowClassify(req.user, orgName)) { return res.status(403).send(); }
        const organization = await orgByName(orgName);
        organization.classifications = await updateOrgClassification(orgName);
        await organization.save();
        res.send(organization);
    });


    const bulkClassifyCdesStatus = {};

    function bulkClassifyCdes(user, eltId, elements, body, cb?: Cb<Error>) {
        if (!bulkClassifyCdesStatus[user.username + eltId]) {
            bulkClassifyCdesStatus[user.username + eltId] = {
                numberProcessed: 0,
                numberTotal: elements.length
            };
        }
        forEachSeries(elements, function(element: any, doneOneElement) {
            const classifReq = {
                orgName: body.orgName,
                categories: body.categories,
                tinyId: element.id,
                version: element.version
            };
            classificationNode.eltClassification(classifReq, actions.create, mongo_cde, () => {
                bulkClassifyCdesStatus[user.username + eltId].numberProcessed++;
                doneOneElement();
            });
        }, function doneAllElement(errs) {
            if (cb) { cb(errs); }
        });
    }

    function resetBulkClassifyCdesStatus(statusObjId) {
        delete bulkClassifyCdesStatus[statusObjId];
    }

    // TODO this works only for CDEs. Forms TODO later.
    router.post('/bulk/tinyId', (req, res) => {
        if (!roleConfig.allowClassify(req.user, req.body.orgName)) { return res.status(403).send('Not Authorized'); }
        if (!req.body.orgName || !req.body.categories) { return res.status(400).send('Bad Request'); }
        const elements = req.body.elements;
        if (elements.length <= 50) {
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body, handleError({req, res}, () =>
                res.send('Done')));
        } else {
            res.status(202).send('Processing');
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body);
        }
        mongo_data.addToClassifAudit({
            date: new Date(),
            user: {
                username: req.user.username
            },
            elements,
            action: 'add',
            path: [req.body.orgName].concat(req.body.categories)
        });
    });

    router.get('/bulkClassifyCdeStatus/:eltId', (req, res) => {
        const formId = req.param('eltId');
        if (!formId) { return res.status(400).send('Bad Request'); }
        const result = bulkClassifyCdesStatus[req.user.username + req.params.eltId];
        if (result) { return res.send(result); }
        res.send({});
    });

    router.get('/resetBulkClassifyCdesStatus/:eltId', (req, res) => {
        const formId = req.param('eltId');
        if (!formId) { return res.status(400).send('Bad Request'); }
        resetBulkClassifyCdesStatus(req.user.username + req.param('eltId'));
        res.end();
    });

    return router;
}

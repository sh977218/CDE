import { Router } from 'express';
import { forEachSeries } from 'async';
import { handleError } from 'server/errorHandler/errorHandler';
import { Cb } from 'shared/models.model';
import { updateOrgClassification } from 'server/classification/orgClassificationSvc';
import { validateBody } from 'server/system/bodyValidator';
import { orgByName } from 'server/orgManagement/orgDb';
import { jobStatus } from 'server/system/mongo-data';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';

const mongoCde = require('server/cde/mongo-cde');
const mongoForm = require('server/form/mongo-form');
const classificationNode = require('./classificationNode');
const orgClassificationSvc = require('./orgClassificationSvc');
const { check } = require('express-validator');

require('express-async-errors');

const isValidBody = [
    check('eltId').isAlphanumeric(),
    check('orgName').isString(),
    check('categories').isArray(),
    validateBody
];

export function module(roleConfig) {
    const router = Router();

    router.post('/addCdeClassification/', roleConfig.allowClassify, ...isValidBody, (req, res) => {
        classificationNode.addClassification(req.body, mongoCde, handleError({req, res}, result => {
            if (result === 'Classification Already Exists') { return res.status(409).send(result); }
            res.send(result);
            addToClassifAudit({
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

    router.post('/removeCdeClassification/', roleConfig.allowClassify, ...isValidBody, (req, res) => {
        classificationNode.removeClassification(req.body, mongoCde, handleError({req, res}, elt => {
            res.send(elt);
            addToClassifAudit({
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

    router.post('/addFormClassification/', roleConfig.allowClassify, ...isValidBody, (req, res) => {
        classificationNode.addClassification(req.body, mongoForm, handleError({req, res}, result => {
            if (result === 'Classification Already Exists') { return res.status(409).send(result); } else { res.send(result); }
            addToClassifAudit({
                date: new Date(), user: {
                    username: req.user.username
                }, elements: [{
                    _id: req.body.eltId
                }], action: 'add', path: [req.body.orgName].concat(req.body.categories)
            });
        }));
    });

    router.post('/removeFormClassification/', roleConfig.allowClassify, ...isValidBody, (req, res) => {
        classificationNode.removeClassification(req.body, mongoForm, handleError({req, res}, elt => {
            res.send(elt);
            addToClassifAudit({
                date: new Date(), user: {
                    username: req.user.username
                }, elements: [{
                    _id: req.body.eltId
                }], action: 'delete', path: [req.body.orgName].concat(req.body.categories)
            });
        }));
    });

    router.post('/classifyCdeBoard', roleConfig.allowClassify, (req, res) => {
        classificationNode.classifyEltsInBoard(req, mongoCde, handleError({req, res}, () => res.send('')));
    });

    router.post('/classifyFormBoard', roleConfig.allowClassify, (req, res) => {
        classificationNode.classifyEltsInBoard(req, mongoForm, handleError({req, res}, () => res.send('')));
    });

    // @TODO: classification to own file
    // delete org classification
    router.post('/deleteOrgClassification/', roleConfig.allowClassify, (req, res) => {
        const deleteClassification = req.body.deleteClassification;
        const settings = req.body.settings;
        if (!deleteClassification || !settings) { return res.status(400).send(); }
        jobStatus('deleteClassification', handleError({req, res}, j => {
            if (j) { return res.status(409).send('Error - delete classification is in processing, try again later.'); }
            orgClassificationSvc.deleteOrgClassification(req.user, deleteClassification, settings,
                handleError({req, res}, () => {}));
            res.status(202).send('Deleting in progress.');
        }));
    });

    // rename org classification
    router.post('/renameOrgClassification',
        roleConfig.allowClassify,
        check('newClassification.orgName').isString(),
        check('newClassification.newName').isString(),
        check('newClassification.categories').isArray(),
        validateBody,
        (req, res) => {
            const newClassification = req.body.newClassification;
            const settings = req.body.settings;
            jobStatus('renameClassification', handleError({req, res}, j => {
                if (j) { return res.status(409).send('Error - rename classification is in processing, try again later.'); }
                orgClassificationSvc.renameOrgClassification(req.user, newClassification, settings,
                    handleError({req, res}, () => {}));
                res.status(202).send('Renaming in progress.');
            }));
    });

    // add org classification
    router.put('/addOrgClassification/', roleConfig.allowClassify,
        check('newClassification.categories').isArray(),
        validateBody,
        (req, res) => {
            const newClassification = req.body.newClassification;
            jobStatus('addClassification', handleError({req, res}, j => {
                if (j) { return res.status(409).send('Error - delete classification is in processing, try again later.'); }
                orgClassificationSvc.addOrgClassification(newClassification, handleError({req, res},
                    () => res.send('Classification added.')));
            }));
    });

    // reclassify org classification
    router.post('/reclassifyOrgClassification', roleConfig.allowClassify,
        check('newClassification').isJSON(),
        check('oldClassification').isJSON(),
        check('settings').isJSON(),
        validateBody, (req, res) => {
            const oldClassification = req.body.oldClassification;
            const newClassification = req.body.newClassification;
            const settings = req.body.settings;
            jobStatus('reclassifyClassification', handleError({req, res}, j => {
                    if (j) { return res.status(409).send('Error - reclassify classification is in processing, try again later.'); }
                    orgClassificationSvc.reclassifyOrgClassification(req.user, oldClassification, newClassification, settings,
                        handleError({req, res}, () => {
                        }));
                    res.status(202).send('Reclassifying in progress.');
                })
            );
    });

    // update org classification
    router.post('/updateOrgClassification', roleConfig.allowClassify, async (req, res) => {
        const orgName = req.body.orgName;
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
            classificationNode.eltClassification(classifReq, mongoCde, () => {
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
    router.post('/bulk/tinyId', roleConfig.allowClassify,
        check('orgName').isString(),
        check('categories').isArray(),
        validateBody,
        (req, res) => {
        const elements = req.body.elements;
        if (elements.length <= 50) {
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body, handleError({req, res}, () =>
                res.send('Done')));
        } else {
            res.status(202).send('Processing');
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body);
        }
        addToClassifAudit({
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
        const result = bulkClassifyCdesStatus[req.user.username + req.params.eltId];
        res.send(result);
    });

    router.get('/resetBulkClassifyCdesStatus/:eltId', (req, res) => {
        resetBulkClassifyCdesStatus(req.user.username + req.params.eltId);
        res.end();
    });

    return router;
}

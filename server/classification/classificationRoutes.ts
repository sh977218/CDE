import { Dictionary, forEachSeries } from 'async';
import { RequestHandler, Router } from 'express';
const { check } = require('express-validator');
import { handleErr, handleError, handleErrorVoid, handleErrVoid } from 'server/errorHandler/errorHandler';
import * as mongoCde from 'server/cde/mongo-cde';
import {
    addOrgClassification,
    deleteOrgClassification, reclassifyOrgClassification, renameOrgClassification, updateOrgClassification
} from 'server/classification/orgClassificationSvc';
import { addClassification, classifyEltsInBoard, eltClassification, removeClassification } from 'server/classification/classificationNode';
import * as mongoForm from 'server/form/mongo-form';
import { validateBody } from 'server/system/bodyValidator';
import { orgByName } from 'server/orgManagement/orgDb';
import { jobStatus } from 'server/system/mongo-data';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { Cb, Cb1, ClassificationClassifier, User } from 'shared/models.model';

require('express-async-errors');

const isValidBody = [
    check('eltId').isAlphanumeric(),
    check('orgName').isString(),
    check('categories').isArray(),
    validateBody
];

export function module(roleConfig: {allowClassify: RequestHandler}) {
    const router = Router();

    router.post('/addCdeClassification/', roleConfig.allowClassify, ...isValidBody, (req, res) => {
        addClassification(req.body, mongoCde, handleError({req, res}, result => {
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
        removeClassification(req.body, mongoCde, handleError({req, res}, elt => {
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
        addClassification(req.body, mongoForm, handleError({req, res}, result => {
            /* istanbul ignore if */
            if (result === 'Classification Already Exists') {
                return res.status(409).send(result); } else { res.send(result);
            }
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
        removeClassification(req.body, mongoForm, handleError({req, res}, elt => {
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
        classifyEltsInBoard(req, mongoCde, handleErrVoid({req, res}, () => res.send('')));
    });

    router.post('/classifyFormBoard', roleConfig.allowClassify, (req, res) => {
        classifyEltsInBoard(req, mongoForm, handleErrVoid({req, res}, () => res.send('')));
    });

    // @TODO: classification to own file
    // delete org classification
    router.post('/deleteOrgClassification/', roleConfig.allowClassify, (req, res) => {
        const deleteClassification = req.body.deleteClassification;
        const settings = req.body.settings;
        /* istanbul ignore if */
        if (!deleteClassification || !settings) {
            return res.status(400).send();
        }
        jobStatus('deleteClassification', handleError({req, res}, j => {
            /* istanbul ignore if */
            if (j) {
                return res.status(409).send('Error - delete classification is in processing, try again later.');
            }
            deleteOrgClassification(req.user, deleteClassification, settings,
                handleErrorVoid({req, res}, () => {}));
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
                /* istanbul ignore if */
                if (j) {
                    return res.status(409).send('Error - rename classification is in processing, try again later.');
                }
                renameOrgClassification(req.user, newClassification, settings, handleErrorVoid({req, res}, () => {}));
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
                /* istanbul ignore if */
                if (j) {
                    return res.status(409).send('Error - delete classification is in processing, try again later.');
                }
                addOrgClassification(newClassification, handleError({req, res},
                    () => res.send('Classification added.')));
            }));
    });

    // reclassify org classification
    router.post('/reclassifyOrgClassification', roleConfig.allowClassify,
        check('newClassification.orgName').isString(),
        check('newClassification.categories').isArray(),
        check('oldClassification.orgName').isString(),
        check('oldClassification.categories').isArray(),
        validateBody, (req, res) => {
            const oldClassification = req.body.oldClassification;
            const newClassification = req.body.newClassification;
            const settings = req.body.settings;
            jobStatus('reclassifyClassification', handleError({req, res}, j => {
                /* istanbul ignore if */
                if (j) {
                    return res.status(409).send('Error - reclassify classification is in processing, try again later.');
                }
                reclassifyOrgClassification(req.user, oldClassification, newClassification, settings,
                    handleErrorVoid({req, res}, () => {
                    }));
                res.status(202).send('Reclassifying in progress.');
            }));
    });

    // update org classification
    router.post('/updateOrgClassification', roleConfig.allowClassify, async (req, res) => {
        const orgName = req.body.orgName;
        const organization = await orgByName(orgName);
        /* istanbul ignore if */
        if (!organization) {
            res.status(404).send();
            return;
        }
        organization.classifications = await updateOrgClassification(orgName);
        await organization.save();
        res.send(organization);
    });


    const bulkClassifyCdesStatus: Dictionary<{numberProcessed: number, numberTotal: number}> = {};

    function bulkClassifyCdes(user: User, eltId: string, elements: {id: string, version: number}[],
                              body: ClassificationClassifier, cb?: Cb1<Error | null>) {
        if (!bulkClassifyCdesStatus[user.username + eltId]) {
            bulkClassifyCdesStatus[user.username + eltId] = {
                numberProcessed: 0,
                numberTotal: elements.length
            };
        }
        forEachSeries(elements, (element, doneOneElement) => {
            const classifReq = {
                orgName: body.orgName,
                categories: body.categories,
                tinyId: element.id,
                version: element.version
            };
            eltClassification(classifReq, mongoCde, () => {
                bulkClassifyCdesStatus[user.username + eltId].numberProcessed++;
                doneOneElement();
            });
        }, (errs) => {
            if (cb) { cb(errs === undefined ? null : errs); }
        });
    }

    function resetBulkClassifyCdesStatus(statusObjId: string) {
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
            bulkClassifyCdes(req.user, req.body.eltId, elements, req.body, handleErrorVoid({req, res}, () =>
                res.send('Done')
            ));
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

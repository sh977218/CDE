import { Dictionary, forEachSeries } from 'async';
import { RequestHandler, Response, Router } from 'express';
import { check } from 'express-validator';
import { dbPlugins } from 'server';
import { handleErrorVoid, respondError } from 'server/errorHandler';
import {
    addOrgClassification,
    deleteOrgClassification,
    reclassifyOrgClassification,
    renameOrgClassification,
    updateOrgClassification,
} from 'server/classification/orgClassificationSvc';
import {
    addClassification,
    classifyEltsInBoard,
    eltClassification,
    removeClassification,
} from 'server/classification/classificationNode';
import { validateBody } from 'server/system/bodyValidator';
import { orgByName } from 'server/orgManagement/orgDb';
import { jobStatus } from 'server/system/mongo-data';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { Cb1, ClassificationClassifier, User } from 'shared/models.model';

require('express-async-errors');

const isValidBody = [
    check('eltId').isAlphanumeric(),
    check('orgName').isString(),
    check('categories').isArray(),
    validateBody,
];

export function module(roleConfig: { allowClassify: RequestHandler }) {
    const router = Router();

    router.post(
        '/addCdeClassification/',
        roleConfig.allowClassify,
        ...isValidBody,
        addClassification(dbPlugins.dataElement)
    );
    router.post(
        '/removeCdeClassification/',
        roleConfig.allowClassify,
        ...isValidBody,
        removeClassification(dbPlugins.dataElement)
    );
    router.post('/addFormClassification/', roleConfig.allowClassify, ...isValidBody, addClassification(dbPlugins.form));
    router.post(
        '/removeFormClassification/',
        roleConfig.allowClassify,
        ...isValidBody,
        removeClassification(dbPlugins.form)
    );
    router.post('/classifyCdeBoard', roleConfig.allowClassify, classifyEltsInBoard(dbPlugins.dataElement));
    router.post('/classifyFormBoard', roleConfig.allowClassify, classifyEltsInBoard(dbPlugins.form));

    // @TODO: classification to own file
    // delete org classification
    router.post('/deleteOrgClassification/', roleConfig.allowClassify, (req, res): Response | Promise<Response> => {
        const deleteClassification = req.body.deleteClassification;
        const settings = req.body.settings;
        /* istanbul ignore if */
        if (!deleteClassification || !settings) {
            return res.status(400).send();
        }
        return jobStatus('deleteClassification').then(j => {
            /* istanbul ignore if */
            if (j) {
                return res.status(409).send('Error - delete classification is in processing, try again later.');
            }
            deleteOrgClassification(req.user, deleteClassification, settings);
            return res.status(202).send('Deleting in progress.');
        }, respondError({ req, res }));
    });

    // rename org classification
    router.post(
        '/renameOrgClassification',
        roleConfig.allowClassify,
        check('newClassification.orgName').isString(),
        check('newClassification.newName').isString(),
        check('newClassification.categories').isArray(),
        validateBody,
        (req, res) => {
            const newClassification = req.body.newClassification;
            const settings = req.body.settings;
            jobStatus('renameClassification').then(j => {
                /* istanbul ignore if */
                if (j) {
                    return res.status(409).send('Error - rename classification is in processing, try again later.');
                }
                renameOrgClassification(req.user, newClassification, settings);
                res.send('Renaming in progress.');
            }, respondError({ req, res }));
        }
    );

    // add org classification
    router.put(
        '/addOrgClassification/',
        roleConfig.allowClassify,
        check('newClassification.categories').isArray(),
        validateBody,
        (req, res) => {
            const newClassification = req.body.newClassification;
            jobStatus('addClassification').then(j => {
                /* istanbul ignore if */
                if (j) {
                    return res.status(409).send('Error - delete classification is in processing, try again later.');
                }
                addOrgClassification(newClassification).then(
                    () => res.send('Classification added.'),
                    respondError({ req, res })
                );
            }, respondError({ req, res }));
        }
    );

    // reclassify org classification
    router.post(
        '/reclassifyOrgClassification',
        roleConfig.allowClassify,
        check('newClassification.orgName').isString(),
        check('newClassification.categories').isArray(),
        check('oldClassification.orgName').isString(),
        check('oldClassification.categories').isArray(),
        validateBody,
        (req, res) => {
            const oldClassification = req.body.oldClassification;
            const newClassification = req.body.newClassification;
            const settings = req.body.settings;
            jobStatus('reclassifyClassification').then(j => {
                /* istanbul ignore if */
                if (j) {
                    return res.status(409).send('Error - reclassify classification is in processing, try again later.');
                }
                reclassifyOrgClassification(req.user, oldClassification, newClassification, settings);
                res.status(202).send('Reclassifying in progress.');
            }, respondError({ req, res }));
        }
    );

    // update org classification
    router.post('/updateOrgClassification', roleConfig.allowClassify, async (req, res) => {
        const orgName = req.body.orgName;
        const organization = await orgByName(orgName);
        /* istanbul ignore if */
        if (!organization) {
            res.status(404).send();
            return;
        }
        const updatedClassifications = await updateOrgClassification(orgName);
        organization.classifications = updatedClassifications;
        const savedOrg = await organization.save();
        const savedOrgObj = savedOrg.toObject();
        res.send(savedOrgObj);
    });

    const bulkClassifyCdesStatus: Dictionary<{ numberProcessed: number; numberTotal: number }> = {};

    function bulkClassifyCdes(
        user: User,
        eltId: string,
        elements: { id: string; version: string }[],
        body: ClassificationClassifier,
        cb?: Cb1<Error | null>
    ) {
        if (!bulkClassifyCdesStatus[user.username + eltId]) {
            bulkClassifyCdesStatus[user.username + eltId] = {
                numberProcessed: 0,
                numberTotal: elements.length,
            };
        }
        forEachSeries(
            elements,
            (element, doneOneElement) => {
                const classifReq = {
                    orgName: body.orgName,
                    categories: body.categories,
                    tinyId: element.id,
                    version: element.version,
                };
                eltClassification(classifReq, dbPlugins.dataElement).then(() => {
                    bulkClassifyCdesStatus[user.username + eltId].numberProcessed++;
                    doneOneElement();
                }, doneOneElement);
            },
            errs => {
                if (cb) {
                    cb(errs === undefined ? null : errs);
                }
            }
        );
    }

    function resetBulkClassifyCdesStatus(statusObjId: string) {
        delete bulkClassifyCdesStatus[statusObjId];
    }

    // TODO this works only for CDEs. Forms TODO later.
    router.post(
        '/bulk/tinyId',
        roleConfig.allowClassify,
        check('orgName').isString(),
        check('categories').isArray(),
        validateBody,
        (req, res) => {
            const elements = req.body.elements;
            if (elements.length <= 50) {
                bulkClassifyCdes(
                    req.user,
                    req.body.eltId,
                    elements,
                    req.body,
                    handleErrorVoid({ req, res }, () => res.send('Done'))
                );
            } else {
                res.status(202).send('Processing');
                bulkClassifyCdes(req.user, req.body.eltId, elements, req.body);
            }
            addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username,
                },
                elements,
                action: 'add',
                path: [req.body.orgName].concat(req.body.categories),
            });
        }
    );

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

import { Request, RequestHandler, Response } from 'express';
import { dbPlugins } from 'server';
import { respondError } from 'server/errorHandler';
import { orgByName } from 'server/orgManagement/orgDb';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { DataElementDb } from 'shared/boundaryInterfaces/db/dataElementDb';
import { FormDb } from 'shared/boundaryInterfaces/db/formDb';
import { addCategory, findSteward, removeCategory } from 'shared/classification/classificationShared';
import { Item } from 'shared/item';
import { Classification, ItemClassification, ItemClassificationElt } from 'shared/models.model';

const trimClassif = (elt: Item) => {
    elt.classification.forEach((steward, i) => {
        if (steward.elements.length === 0) {
            elt.classification.splice(i, 1);
        }
    });
};

export async function eltClassification(body: ItemClassification, dao: DataElementDb | FormDb): Promise<Item | null> {
    const elt = await (body.cdeId && dao.byId
        ? dao.byId(body.cdeId)
        : body.tinyId
        ? body.version
            ? dao.byTinyIdAndVersion(body.tinyId, body.version)
            : dao.byTinyId(body.tinyId)
        : undefined);

    /* istanbul ignore if */
    if (!elt) {
        return Promise.reject('not found');
    }
    let steward = findSteward(elt, body.orgName);
    if (!steward) {
        const stewardOrg = await orgByName(body.orgName);
        const classifOrg: Classification = {
            stewardOrg: {
                name: body.orgName,
            },
            elements: [],
        };

        /* istanbul ignore if */
        if (stewardOrg && stewardOrg.workingGroupOf) {
            classifOrg.workingGroup = true;
        }
        /* istanbul ignore if */
        if (!elt.classification) {
            elt.classification = [];
        }
        elt.classification.push(classifOrg);
        steward = findSteward(elt, body.orgName);
    }

    const errString = steward ? addCategory(steward.object, body.categories) : undefined;
    /* istanbul ignore if */
    if (errString) {
        return Promise.reject(errString);
    }
    trimClassif(elt);
    return dao.updatePropertiesById(elt._id, { classification: elt.classification });
}

export function addClassification(dao: DataElementDb | FormDb): RequestHandler {
    return (req, res): Promise<Response> =>
        (async (body: ItemClassificationElt): Promise<Item | null> => {
            const elt = await dao.byId(body.eltId);
            /* istanbul ignore if */
            if (!elt) {
                return Promise.reject('not found');
            }
            let steward = findSteward(elt, body.orgName);
            if (!steward) {
                elt.classification.push({
                    stewardOrg: { name: body.orgName },
                    elements: [],
                });
                steward = findSteward(elt, body.orgName);
            }
            const errString = steward ? addCategory(steward.object, body.categories) : undefined;
            if (errString) {
                return Promise.reject(errString);
            }
            return dao.updatePropertiesById(elt._id, { classification: elt.classification });
        })(req.body).then(
            item => {
                addToClassifAudit({
                    date: new Date(),
                    user: {
                        username: req.user.username,
                    },
                    elements: [
                        {
                            _id: req.body.eltId,
                        },
                    ],
                    action: 'add',
                    path: [req.body.orgName].concat(req.body.categories),
                });
                return res.send();
            },
            err => {
                /* istanbul ignore if */
                if (err === 'Classification Already Exists') {
                    return res.status(409).send(err);
                }
                return respondError({ req, res })(err);
            }
        );
}

export function removeClassification(dao: DataElementDb | FormDb): RequestHandler {
    return (req, res): Promise<Response> =>
        (async (body: ItemClassificationElt): Promise<Item | null> => {
            const elt = await dao.byId(body.eltId);
            if (!elt) {
                return Promise.reject('not found');
            }
            const steward = findSteward(elt, body.orgName);
            const errString = steward ? removeCategory(steward.object, body.categories) : undefined;
            if (errString) {
                return Promise.reject(errString);
            }
            trimClassif(elt);
            return dao.updatePropertiesById(elt._id, { classification: elt.classification });
        })(req.body).then(item => {
            addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username,
                },
                elements: [
                    {
                        _id: req.body.eltId,
                    },
                ],
                action: 'delete',
                path: [req.body.orgName].concat(req.body.categories),
            });
            return res.send();
        }, respondError({ req, res }));
}

export function classifyEltsInBoard(dao: DataElementDb | FormDb) {
    return async (req: Request, res: Response): Promise<Response> => {
        const boardId: string = req.body.boardId;
        const newClassification = req.body;
        const board = await dbPlugins.board.byId(boardId);
        /* istanbul ignore if */
        if (!board) {
            return res.status(404).send('board not found');
        }
        const tinyIds = board.pins.map(p => p.tinyId);
        return dao.byTinyIdListElastic(tinyIds).then(elts => {
            const processing = elts
                .map(e => e._id)
                .map(id =>
                    eltClassification(
                        {
                            orgName: newClassification.orgName,
                            categories: newClassification.categories,
                            cdeId: id,
                        },
                        dao
                    )
                );
            addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username,
                },
                elements: elts.map(e => ({ tinyId: e.tinyId })),
                action: 'reclassify',
                path: [newClassification.orgName].concat(newClassification.categories),
            });
            return Promise.all(processing).then(
                () => res.send(''),
                () => res.status(400).send('Task not performed completely!')
            );
        }, respondError({ req, res }));
    };
}

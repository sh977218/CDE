import { each } from 'async';
import { Request } from 'express';
import { byId } from 'server/board/boardDb';
import { orgByName } from 'server/orgManagement/orgDb';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { ItemDocument } from 'server/system/mongo-data';
import { CbErr, CbErr1, CbError, CbError1, Classification, Item, ItemClassification, ItemClassificationElt } from 'shared/models.model';
import { actions, addCategory, findSteward, removeCategory } from 'shared/system/classificationShared';

const saveEltClassif = (err: string | undefined, elt: ItemDocument, cb: CbErr1<ItemDocument | void>) => {
    if (err) {
        if (cb) { cb(err); }
        return;
    }
    trimClassif(elt);
    elt.updated = new Date();
    elt.markModified('classification');
    (elt as any).save(cb);
};

const trimClassif = (elt: Item) => {
    elt.classification.forEach((steward, i) => {
        if (steward.elements.length === 0) {
            elt.classification.splice(i, 1);
        }
    });
};

export async function eltClassification(body: ItemClassification, dao: any, cb: CbErr1<ItemDocument | void>) {
    const elt: ItemDocument = await (
        body.cdeId && dao.byId
            ? dao.byId(body.cdeId)
            : body.tinyId
            ? body.version
                ? dao.byTinyIdAndVersion(body.tinyId, body.version)
                : dao.eltByTinyId(body.tinyId)
            : undefined
    );

    if (!elt) {
        return cb('can not elt');
    }
    let steward = findSteward(elt, body.orgName);
    if (!steward) {
        const stewardOrg = await orgByName(body.orgName);
        const classifOrg: Classification = {
            stewardOrg: {
                name: body.orgName
            },
            elements: []
        };

        if (stewardOrg && stewardOrg.workingGroupOf) {
            classifOrg.workingGroup = true;
        }
        if (!elt.classification) {
            elt.classification = [];
        }
        elt.classification.push(classifOrg);
        steward = findSteward(elt, body.orgName);
    }

    const err = steward ? addCategory(steward.object, body.categories) : undefined;
    saveEltClassif(err, elt, cb);
}

export async function addClassification(body: ItemClassificationElt, dao: any, cb: CbError1<string>) {
    const elt = await dao.byId(body.eltId);
    let steward = findSteward(elt, body.orgName);
    if (!steward) {
        elt.classification.push({
            stewardOrg: {name: body.orgName},
            elements: []
        });
        steward = findSteward(elt, body.orgName);
    }
    const addCatRes = steward ? addCategory(steward.object, body.categories) : undefined;
    if (addCatRes) {
        return cb(null, addCatRes);
    }
    elt.markModified('classification');
    elt.save(cb);
}

export async function removeClassification(body: ItemClassificationElt, dao: any, cb: CbError1<ItemClassificationElt>) {
    const elt = await dao.byId(body.eltId);
    const steward = findSteward(elt, body.orgName);
    const err = steward ? removeCategory(steward.object, body.categories) : undefined;
    trimClassif(elt);
    elt.markModified('classification');
    elt.save(cb);
}

export async function classifyEltsInBoard(req: Request, dao: any, cb: CbErr) {
    const boardId = req.body.boardId;
    const newClassification = req.body;
    const board = await byId(boardId);
    if (!board) {
        cb('board not found');
        return;
    }
    const tinyIds = board.pins.map(p => p.tinyId);
    dao.byTinyIdList(tinyIds, (err?: Error, elts?: Item[]) => {
        if (err || !elts) {
            cb('elts not retrieved');
            return;
        }
        const ids = elts.map(e => e._id);
        const eltsTotal = ids.length;
        let eltsProcessed = 0;
        each(ids, (id, doneOne) => {
                const classifReq = {
                    orgName: newClassification.orgName,
                    categories: newClassification.categories,
                    cdeId: id
                };
                eltClassification(classifReq, dao, () => {
                    eltsProcessed++;
                    doneOne(null);
                });
            }, () => cb(eltsTotal === eltsProcessed ? undefined : 'Task not performed completely!')
        );
        addToClassifAudit({
            date: new Date(),
            user: {
                username: req.user.username
            },
            elements: elts.map(e => ({tinyId: e.tinyId})),
            action: 'reclassify',
            path: [newClassification.orgName].concat(newClassification.categories)
        });
    });
}

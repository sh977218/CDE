import { Classification, Elt, Item } from 'shared/models.model';

const boardDb = require('server/board/boardDb');
import { actions, addCategory, findSteward, modifyCategory, removeCategory } from 'shared/system/classificationShared';
import { each } from 'async';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { orgByName } from 'server/orgManagement/orgDb';

const saveEltClassif = (err, elt, cb) => {
    if (err) {
        if (cb) { cb(err); }
        return;
    }
    elt.classification.forEach((steward, i) => {
        if (steward.elements.length === 0) {
            elt.classification.splice(i, 1);
        }
    });
    elt.updated = new Date();
    elt.markModified('classification');
    elt.save(cb);
};

export async function eltClassification(body, action, dao, cb) {
    let elt: Item;
    if (body.cdeId && dao.byId) {
        elt = await dao.byId(body.cdeId);
    } else if (body.tinyId && (!body.version) && dao.eltByTinyId) {
        elt = await dao.eltByTinyId(body.tinyId);
    } else if (body.tinyId && body.version && dao.byTinyIdAndVersion) {
        elt = await dao.byTinyIdAndVersion(body.tinyId, body.version);
    } else {
        return cb('Missing parameters');
    }

    if (!elt) { return cb('can not elt'); }
    let steward = findSteward(elt, body.orgName);
    if (!steward) {
        const stewardOrg = await orgByName(body.orgName);
        const classifOrg: Classification = {
            stewardOrg: {
                name: body.orgName
            },
            elements: []
        };

        if (stewardOrg.workingGroupOf) {
            classifOrg.workingGroup = true;
        }
        if (!elt.classification) {
            elt.classification = [];
        }
        elt.classification.push(classifOrg);
        steward = findSteward(elt, body.orgName);
    }

    if (action === actions.create) {
        const err = addCategory(steward.object, body.categories);
        saveEltClassif(err, elt, cb);
    } else if (action === actions.delete) {
        modifyCategory(steward.object, body.categories, {type: 'delete'});
        saveEltClassif(undefined, elt, cb);
    }
}

export async function addClassification(body, dao, cb) {
    const elt = await dao.byId(body.eltId);
    let steward = findSteward(elt, body.orgName);
    if (!steward) {
        elt.classification.push({
            stewardOrg: {name: body.orgName},
            elements: []
        });
        steward = findSteward(elt, body.orgName);
    }
    addCategory(steward.object, body.categories);
    elt.markModified('classification');
    elt.save(cb);
}

export async function removeClassification(body, dao, cb) {
    const elt = await dao.byId(body.eltId);
    const steward = findSteward(elt, body.orgName);
    const err = removeCategory(steward.object, body.categories);
    saveEltClassif(err, elt, cb);
}

export async function classifyEltsInBoard(req, dao, cb) {
    const boardId = req.body.boardId;
    const newClassification = req.body;
    const  board = await boardDb.byId(boardId);
    const tinyIds = board.pins.map(p => p.tinyId);
    dao.byTinyIdList(tinyIds, (err, elts: Item[]) => {
        const ids = elts.map(e => e._id);
        const eltsTotal = ids.length;
        let eltsProcessed = 0;
        each(ids, (id, doneOne) => {
                const classifReq = {
                    orgName: newClassification.orgName,
                    categories: newClassification.categories,
                    cdeId: id
                };
                eltClassification(classifReq, actions.create, dao, () => {
                    eltsProcessed++;
                    doneOne(null);
                });
            },
            () => {
                if (eltsTotal === eltsProcessed) {
                    cb(null);
                } else {
                    cb('Task not performed completely!');
                }
            }
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

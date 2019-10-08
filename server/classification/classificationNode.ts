import { Classification, Elt, Item } from 'shared/models.model';

const boardDb = require('server/board/boardDb');
const mongoSystem = require('server/system/mongo-data');
import { actions, addCategory, findSteward, modifyCategory, removeCategory } from 'shared/system/classificationShared';
const adminItemSvc = require('server/system/adminItemSvc');
const logging = require('server/system/logging');

const saveCdeClassif = (err, elt, cb) => {
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
    const classify = (steward, elt) => {
        if (!(body.categories instanceof Array)) {
            body.categories = [body.categories];
        }
        if (action === actions.create) {
            addCategory(steward.object, body.categories, err => {
                saveCdeClassif(err, elt, cb);
            });
        } else if (action === actions.delete) {
            modifyCategory(steward.object, body.categories, {type: 'delete'}, err => {
                saveCdeClassif(err, elt, cb);
            });
        }
    };


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
        mongoSystem.orgByName(body.orgName, (err, stewardOrg) => {
            const classifOrg: Classification = {
                stewardOrg: {
                    name: body.orgName
                },
                elements: []
            };

            if (stewardOrg.workingGroupOf) { classifOrg.workingGroup = true; }
            if (!elt.classification) { elt.classification = []; }
            elt.classification.push(classifOrg);
            steward = findSteward(elt, body.orgName);
            classify(steward, elt);
        });
    } else { classify(steward, elt); }

}

export async function addClassification(body, dao, cb) {
    if (!dao.byId) {
        cb('dao.byId is undefined');
        logging.log(null, 'dao.byId is undefined' + dao);
        return;
    }
    const elt = await dao.byId(body.eltId);
    let steward = findSteward(elt, body.orgName);
    if (!steward) {
        elt.classification.push({
            stewardOrg: {name: body.orgName},
            elements: []
        });
        steward = findSteward(elt, body.orgName);
    }
    addCategory(steward.object, body.categories, result => {
        elt.markModified('classification');
        elt.save(cb);
    });
}

export async function removeClassification(body, dao, cb) {
    if (!dao.byId) {
        cb('Element id is undefined');
        logging.log(null, 'Element id is undefined' + dao);
        return;
    }
    const elt = await dao.byId(body.eltId);
    const steward = findSteward(elt, body.orgName);
    removeCategory(steward.object, body.categories, err => {
        if (err) { return cb(err); }
        for (let i = elt.classification.length - 1; i >= 0; i--) {
            if (elt.classification[i].elements.length === 0) {
                elt.classification.splice(i, 1);
            }
        }
        elt.markModified('classification');
        elt.save(cb);
    });
}

export async function classifyEltsInBoard(req, dao, cb) {
    const boardId = req.body.boardId;
    const newClassification = req.body;

    const action = (id, actionCallback) => {
        const classifReq = {
            orgName: newClassification.orgName,
            categories: newClassification.categories,
            cdeId: id
        };
        eltClassification(classifReq, actions.create, dao, actionCallback);
    };
    const  board = await boardDb.byId(boardId);
    const tinyIds = board.pins.map(p => p.tinyId);
    dao.byTinyIdList(tinyIds, (err, cdes) => {
        const ids = cdes.map(cde => cde._id);
        adminItemSvc.bulkAction(ids, action, cb);
        mongoSystem.addToClassifAudit({
            date: new Date(),
            user: {
                username: req.user.username
            },
            elements: cdes.map(e => ({tinyId: e.tinyId})),
            action: 'reclassify',
            path: [newClassification.orgName].concat(newClassification.categories)
        });
    });
}

import { forwardError } from 'server/errorHandler/errorHandler';
import { CbError } from 'shared/models.model';
import { DataElementDraftDocument, dataElementDraftModel } from 'server/cde/mongo-cde';
import { updateUser } from 'server/user/userDb';

export function draftByTinyId(tinyId, cb) {
    const cond = {
        archived: false,
        tinyId,
    };
    dataElementDraftModel.findOne(cond, cb);
}

export function draftById(id, cb) {
    const cond = {
        _id: id,
    };
    dataElementDraftModel.findOne(cond, cb);
}

export function draftSave(elt, user, cb) {
    updateUser(elt, user);
    dataElementDraftModel.findById(elt._id, forwardError(cb, doc => {
        if (!doc) {
            new dataElementDraftModel(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb();
            return;
        }
        const version = elt.__v;
        elt.__v++;
        dataElementDraftModel.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true}, cb);
    }));
}

export function draftDelete(tinyId, cb) {
    dataElementDraftModel.remove({tinyId}, cb);
}

export function draftsList(criteria): Promise<DataElementDraftDocument[]>;
export function draftsList(criteria, cb: CbError): void;
export function draftsList(criteria, cb?: CbError): void | Promise<DataElementDraftDocument[]> {
    return dataElementDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({updated: -1})
        .exec(cb);
}
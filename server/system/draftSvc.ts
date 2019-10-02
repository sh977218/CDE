import { forwardError } from 'server/errorHandler/errorHandler';
import { CbError } from 'shared/models.model';
import { DataElementDraft } from 'server/cde/mongo-cde';

export function draftByTinyId(tinyId, cb) {
    const cond = {
        archived: false,
        tinyId,
    };
    DataElementDraft.findOne(cond, cb);
}

export function draftById(id, cb) {
    const cond = {
        _id: id,
    };
    DataElementDraft.findOne(cond, cb);
}

export function draftSave(elt, user, cb) {
    updateUser(elt, user);
    DataElementDraft.findById(elt._id, forwardError(cb, doc => {
        if (!doc) {
            new DataElementDraft(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb();
            return;
        }
        const version = elt.__v;
        elt.__v++;
        DataElementDraft.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true}, cb);
    }));
}

export function draftDelete(tinyId, cb) {
    DataElementDraft.remove({tinyId}, cb);
}

export function draftsList(criteria): Promise<DataElementDraft[]>;
export function draftsList(criteria, cb: CbError): void;
export function draftsList(criteria, cb?: CbError): void | Promise<DataElementDraft[]> {
    return DataElementDraft
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

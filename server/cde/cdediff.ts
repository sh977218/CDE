import { diff as deepDiff } from 'deep-diff';

export function diff(newCde, oldCde) {
    let newCdeObj = newCde.toObject();
    let oldCdeObj = oldCde.toObject();
    [newCdeObj, oldCdeObj].forEach(cde => {
        delete cde._id;
        delete cde.updated;
        delete cde.updatedBy;
        delete cde.archived;
        delete cde.history;
        delete cde.changeNote;
        delete cde.__v;
        delete cde.views;
        delete cde.comments;
        delete cde.naming;
    });
    return deepDiff(oldCdeObj, newCdeObj);
}

import { diff as deepDiff } from 'deep-diff';
import { DataElement } from 'shared/de/dataElement.model';

export function diff(newCde, oldCde) {
    function deIdentifyItem(cde: DataElement) {
        delete cde._id;
        delete cde.updated;
        delete cde.updatedBy;
        delete cde.archived;
        delete cde.history;
        delete cde.changeNote;
        delete cde.__v;
        delete cde.views;
        delete cde.comments;
        return cde;
    }
    return deepDiff(deIdentifyItem(oldCde.toObject()), deIdentifyItem(newCde.toObject()));
}

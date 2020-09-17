import { diff as deepDiff } from 'deep-diff';
import { ItemDocument } from 'server/system/mongo-data';
import { DataElement } from 'shared/de/dataElement.model';
import { Item } from 'shared/models.model';

export function diff(newElt: ItemDocument, oldElt: ItemDocument) {
    function deIdentifyItem(elt: Item) {
        delete elt._id;
        delete elt.updated;
        delete elt.updatedBy;
        delete elt.archived;
        delete elt.history;
        delete elt.changeNote;
        delete elt.__v;
        delete (elt as DataElement).views;
        delete elt.comments;
        return elt;
    }
    return deepDiff(deIdentifyItem(oldElt.toObject()), deIdentifyItem(newElt.toObject()));
}

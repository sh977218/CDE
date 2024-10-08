import { diff as deepDiff } from 'deep-diff';
import { ItemDocument } from 'server/system/mongo-data';
import { DataElement } from 'shared/de/dataElement.model';
import { Item } from 'shared/item';

export function diff(newElt: ItemDocument, oldElt: ItemDocument) {
    function deIdentifyItem(elt: Item) {
        elt.__v = 0;
        delete elt._id;
        elt.archived = false;
        delete elt.changeNote;
        elt.history = [];
        delete elt.updated;
        delete elt.updatedBy;
        delete (elt as DataElement).views;
        return elt;
    }
    return deepDiff(deIdentifyItem(oldElt.toObject()), deIdentifyItem(newElt.toObject()));
}

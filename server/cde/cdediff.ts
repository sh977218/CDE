import { diff as deepDiff } from 'deep-diff';
import { Document } from 'mongoose';
import { DataElement } from 'shared/de/dataElement.model';
import { Elt } from 'shared/models.model';

export function diff(newElt: Elt & Document, oldElt: Elt & Document) {
    function deIdentifyItem(elt: Elt) {
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

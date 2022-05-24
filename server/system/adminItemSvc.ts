import { Document, Model } from 'mongoose';
import { CbError, Elt, Item } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';

export function attachmentRemove(collection: Model<Elt & Document>, id: string, cb: CbError) {
    collection.updateMany({'attachments.fileid': id}, {$pull: {attachments: {fileid: id}}}, cb);
}

const allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];

export function badWorkingGroupStatus(elt: Item, org: Organization) {
    return org && org.workingGroupOf && org.workingGroupOf.length > 0
        && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1;
}

export function hideProprietaryIds(elt: Item) {
    if (elt && elt.ids) {
        const blackList = [
            'LOINC'
        ];
        elt.ids.forEach(id => {
            if (blackList.indexOf(id.source || '') > -1) {
                id.id = 'Login to see value.';
                id.source = '(' + id.source + ')';
            }
        });
    }
}

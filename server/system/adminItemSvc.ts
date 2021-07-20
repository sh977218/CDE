import { Document, Model } from 'mongoose';
import { exists } from 'server/system/mongooseHelper';
import { Attachment, CbError, CbError1, Elt, Item, ModuleAll, User, UserRoles } from 'shared/models.model';
import { Organization } from 'shared/system/organization';

export function attachmentApproved(collection: Model<Item & Document>, id: string, cb: CbError1<Attachment>) {
    collection.updateMany(
        {'attachments.fileid': id},
        {
            $unset: {
                'attachments.$.pendingApproval': ''
            }
        },
        cb
    );
}

export function attachmentRemove(collection: Model<Elt & Document>, id: string, cb: CbError) {
    collection.updateMany({'attachments.fileid': id}, {$pull: {attachments: {fileid: id}}}, cb);
}

const allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];

export function badWorkingGroupStatus(elt: Item, org: Organization) {
    return org && org.workingGroupOf && org.workingGroupOf.length > 0
        && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1;
}

export function fileUsed(collection: Model<any>, id: string, cb: CbError1<boolean>) {
    exists(collection, {'attachments.fileid': id}, cb);
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

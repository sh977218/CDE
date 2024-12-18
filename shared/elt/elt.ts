import { Elt } from 'shared/models.model';
import { copyDeep } from 'shared/util';

export function deepCopyElt(elt: Elt): Elt {
    const eltCopy = copyDeep(elt);
    eltCopy.registrationState.administrativeNote = 'Copy of: ' + elt.tinyId;
    delete (eltCopy as any).tinyId;
    delete eltCopy._id;
    delete eltCopy.origin;
    delete eltCopy.created;
    delete eltCopy.updated;
    delete eltCopy.imported;
    delete eltCopy.updatedBy;
    delete eltCopy.createdBy;
    delete eltCopy.version;
    delete (eltCopy as any).history;
    delete eltCopy.changeNote;
    delete (eltCopy as any).comments;
    eltCopy.ids = [];
    eltCopy.sources = [];
    eltCopy.designations[0].designation = 'Copy of: ' + eltCopy.designations[0].designation;
    eltCopy.registrationState = {
        administrativeNote: 'Copy of: ' + elt.tinyId,
        registrationStatus: 'Incomplete',
    };
    return eltCopy;
}

export function filterClassificationPerUser(elt: Elt, userOrgs: string[]) {
    elt.classification = elt.classification.filter(c => userOrgs.indexOf(c.stewardOrg.name) !== -1);
}

export function incrementVersion(elt: Elt, tieBreaker?: string) {
    const version = elt.version;
    if (!version) {
        elt.version = '1';
        return;
    }
    const asNumber = parseInt(version, 10);
    if (asNumber + '' === version) {
        elt.version = asNumber + 1 + '';
        return;
    }
    // TODO: letter increment
    if (tieBreaker) {
        elt.version = version + tieBreaker;
        return;
    }
    elt.version = version + '.1';
}

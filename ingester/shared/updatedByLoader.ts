const BATCHLOADER_USERNAME = 'batchloader';

export function updatedByLoader(elt) {
    if (elt.toObject) {
        elt = elt.toObject;
    }
    return elt.updatedBy && elt.updatedBy.username && elt.updatedBy.username !== BATCHLOADER_USERNAME;
}

export function updatedByNonLoader(elt) {
    let eltObj = elt;
    if (elt.toObject) eltObj = elt.toObject();
    let allow = eltObj.updatedBy &&
        eltObj.updatedBy.username &&
        (eltObj.updatedBy.username !== BATCHLOADER_USERNAME);
    return allow;
}

export const batchloader = {
    username: BATCHLOADER_USERNAME,
    roles: ['AttachmentReviewer']
};
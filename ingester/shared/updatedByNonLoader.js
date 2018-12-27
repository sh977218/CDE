const BATCHLOADER_USERNAME = 'batchloader';

exports.BATCHLOADER_USERNAME = BATCHLOADER_USERNAME;

exports.updatedByNonLoader = elt => {
    let eltObj = elt;
    if (elt.toObject) eltObj = elt.toObject;
    let allow = eltObj.updatedBy &&
        eltObj.updatedBy.username &&
        (eltObj.updatedBy.username !== BATCHLOADER_USERNAME);
    return allow;
};

exports.batchloader = {
    username: BATCHLOADER_USERNAME
};
const BATCHLOADER_USERNAME = 'batchloader';

exports.updatedByLoader = elt => {
    if (elt.toObject) elt = elt.toObject;
    let allow = elt.updatedBy && elt.updatedBy.username
        && elt.updatedBy.username !== BATCHLOADER_USERNAME;
    return allow;
};

exports.batchloader = {
    username: BATCHLOADER_USERNAME
};
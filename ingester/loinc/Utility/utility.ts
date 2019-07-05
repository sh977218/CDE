exports.sanitizeText = function (string) {
    return string.replace(/:/g, '').replace(/\./g, '').trim();
};


exports.wipeUseless = function (toWipeCde) {
    delete toWipeCde._id;
    delete toWipeCde.history;
    delete toWipeCde.imported;
    delete toWipeCde.created;
    delete toWipeCde.createdBy;
    delete toWipeCde.updated;
    delete toWipeCde.updatedBy;
    delete toWipeCde.comments;
    delete toWipeCde.registrationState;
    delete toWipeCde.tinyId;
    delete toWipeCde.valueDomain.datatypeValueList;

    Object.keys(toWipeCde).forEach(function (key) {
        if (Array.isArray(toWipeCde[key]) && toWipeCde[key].length === 0) {
            delete toWipeCde[key];
        }
    });
};


exports.removeClassificationByOrgName = function (cde, orgName) {
    for (let i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === orgName) {
            cde.classification.splice(i, 1);
            return;
        }
    }
};
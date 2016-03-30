var cdesvc = require('../modules/cde/node-js/cdesvc')
    ;

exports.wipeUseless = function (toWipeForm) {
    delete toWipeForm._id;
    delete toWipeForm.history;
    delete toWipeForm.imported;
    delete toWipeForm.created;
    delete toWipeForm.createdBy;
    delete toWipeForm.updated;
    delete toWipeForm.comments;
    delete toWipeForm.registrationState;
    delete toWipeForm.tinyId;
    delete toWipeForm.valueDomain.datatypeValueList;
};


exports.compareObjects = function (existingForm, newForm) {
    var existingForm = JSON.parse(JSON.stringify(existingForm));
    exports.wipeUseless(existingForm);
    for (var i = existingForm.classification.length - 1; i > 0; i--) {
        if (existingForm.classification[i].stewardOrg.name !== newForm.source) {
            existingForm.classification.splice(i, 1);
        }
    }
    if (existingForm.classification == [null]) existingForm.classification = [];
    try {
        if (existingForm.classification.length > 0) classificationShared.sortClassification(existingForm);
    } catch (e) {
        console.log(existingForm);
        throw e;
    }
    classificationShared.sortClassification(newForm);
    newForm = JSON.parse(JSON.stringify(newForm));
    exports.wipeUseless(newForm);
    return cdesvc.diff(existingForm, newForm);
};

exports.removeClassificationTree = function (element, org) {
    for (var i = 0; i < element.classification.length; i++) {
        if (element.classification[i].stewardOrg.name === org) {
            element.classification.splice(i, 1);
            return;
        }
    }
};

exports.removeProperty = function (element, property) {
    for (var i = 0; i < element.properties.length; i++) {
        if (property.key === element.properties[i].key) {
            element.properties.splice(i, 1);
            return;
        }
    }
};
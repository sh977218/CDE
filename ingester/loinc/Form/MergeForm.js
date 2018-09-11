const removeClassificationByOrgName = require('../Utility/utility').removeClassificationByOrgName;
const cdediff = require('../../../server/cde/cdediff');
const wipeUseless = require('../Utility/utility').wipeUseless;

exports.compareForms = function (newForm, existingForm) {
    let newFormObj = _.cloneDeep(newForm);
    if (newFormObj.toObject) newFormObj = newFormObj.toObject();
    let existingFormObj = _.cloneDeep(existingForm);
    if (existingFormObj.toObject) existingFormObj = existingFormObj.toObject();


    [existingFormObj, newFormObj].forEach(obj => {
        obj.ids.sort((a, b) => a.source > b.source);
        obj.properties.sort((a, b) => a.key > b.key);
        delete obj.classification;
        delete obj.formElements;
        wipeUseless(obj);
    });
    return cdediff.diff(existingForm, newForm);
};
exports.mergeForm = function (newForm, existingForm, orgName) {
    return new Promise(async (resolve, reject) => {
        existingForm.designations = newForm.designations;
        existingForm.definitios = newForm.definitios;
        existingForm.sources = newForm.sources;
        existingForm.version = newForm.version;
        existingForm.changeNote = "Bulk update from source";
        existingForm.imported = new Date().toJSON();
        existingForm.valueDomain = newForm.valueDomain;
        existingForm.mappingSpecifications = newForm.mappingSpecifications;
        existingForm.referenceDocuments = newForm.referenceDocuments;
        existingForm.ids = newForm.ids;
        existingForm.properties = newForm.properties;
        existingForm.formElements = newForm.formElements;

        removeClassificationByOrgName(existingForm, orgName);
        existingForm.classification.push(newForm.classification[0]);

        mongo_form.update(existingForm, {username: "batchloader"}, err => {
            if (err) reject(err);
            else resolve();
        });
    })
};
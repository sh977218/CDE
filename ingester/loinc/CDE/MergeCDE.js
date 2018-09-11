const removeClassificationByOrgName = require('../Utility/utility').removeClassificationByOrgName;
const cdediff = require('../../../server/cde/cdediff');
const wipeUseless = require('../Utility/utility').wipeUseless;

exports.compareCdes = function (newCde, existingCde) {
    let newCdeObj = _.cloneDeep(newCde);
    if (newCdeObj.toObject) newCdeObj = newCdeObj.toObject();
    let existingCdeObj = _.cloneDeep(existingCde);
    if (existingCdeObj.toObject) existingCdeObj = existingCdeObj.toObject();


    [existingCdeObj, newCdeObj].forEach(obj => {
        obj.ids.sort((a, b) => a.source > b.source);
        obj.properties.sort((a, b) => a.key > b.key);
        delete obj.classification;
        wipeUseless(obj);
    });
    return cdediff.diff(existingCde, newCde);
};

exports.mergeCde = function (newCde, existingCde, orgName) {
    return new Promise(async (resolve, reject) => {
        existingCde.designations = newCde.designations;
        existingCde.definitios = newCde.designations;
        existingCde.sources = newCde.sources;
        existingCde.version = newCde.version;
        existingCde.changeNote = "Bulk update from source";
        existingCde.imported = new Date().toJSON();
        existingCde.dataElementConcept = newCde.dataElementConcept;
        existingCde.objectClass = newCde.objectClass;
        existingCde.property = newCde.property;
        existingCde.valueDomain = newCde.valueDomain;
        existingCde.mappingSpecifications = newCde.mappingSpecifications;
        existingCde.referenceDocuments = newCde.referenceDocuments;
        existingCde.ids = newCde.ids;
        existingCde.properties = newCde.properties;

        removeClassificationByOrgName(existingCde, orgName);
        existingCde.classification.push(newCde.classification[0]);

        mongo_cde.update(existingCde, {username: "batchloader"}, err => {
            if (err) reject(err);
            else resolve();
        });
    })
};
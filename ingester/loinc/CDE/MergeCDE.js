const removeClassificationByOrgName = require('../Utility/utility').removeClassificationByOrgName;

exports.mergeCde = function (newCde, existingCde, orgName) {
    return new Promise(async (resolve, reject) => {
        existingCde.designations = newCde.designations;
        existingCde.definitios = newCde.definitios;
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
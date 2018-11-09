const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

const mergeDesignations = require('../Shared/mergeDesignations').mergeDesignations;
const mergeDefinitions = require('../Shared/mergeDefinitions').mergeDefinitions;
const mergeBySource = require('../Shared/mergeBySource').mergeBySource;
const mergeBySourceName = require('../Shared/mergeBySourceName').mergeBySourceName;

exports.mergeCde = function (newCde, existingCde) {
    existingCde.designations = mergeDesignations(existingCde.designations, newCde.designations);
    existingCde.definitios = mergeDefinitions(existingCde.definitions, newCde.definitions);
    existingCde.sources = mergeBySourceName(existingCde.sources, newCde.sources);

    existingCde.mappingSpecifications = newCde.mappingSpecifications;
    existingCde.referenceDocuments = mergeBySource(existingCde.referenceDocuments, newCde.referenceDocuments);
    existingCde.properties = mergeBySource(existingCde.properties, newCde.properties);
    existingCde.ids = mergeBySource(existingCde.ids, newCde.ids);

    existingCde.property = newCde.property;
    existingCde.valueDomain = newCde.valueDomain;

    classificationShared.transferClassifications(newCde, existingCde);
};
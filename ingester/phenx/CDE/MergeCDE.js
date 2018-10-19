const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

mergeSources = (o1, o2) => {
    let result = _.uniqBy(o1.concat(o2), 'sourceName');
    return result;
};

exports.mergeCde = (existingCde, newCde) => {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = newCde.ids;
    existingCde.properties = newCde.properties;
    existingCde.referenceDocuments = newCde.referenceDocuments;
    existingCde.sources = mergeSources(newCde.sources, existingCde.sources);
    existingCde.valueDomain = newCde.valueDomain;
    classificationShared.transferClassifications(newCde, existingCde);
};

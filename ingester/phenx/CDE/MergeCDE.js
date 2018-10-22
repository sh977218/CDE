const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

mergeBySources = (newSources, existingSources) => {
    let otherSources = existingSources.filter(o => o.source !== 'PhenX');
    let result = newSources.concat(otherSources);
    return result;
};

exports.mergeCde = (existingCde, newCde) => {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = mergeBySources(newCde.ids, existingCde.ids);
    existingCde.properties = mergeBySources(newCde.properties, existingCde.properties);
    existingCde.referenceDocuments = mergeBySources(newCde.referenceDocuments, existingCde.referenceDocuments);
    existingCde.sources = mergeBySources(newCde.sources, existingCde.sources);
    existingCde.valueDomain = newCde.valueDomain;
    classificationShared.transferClassifications(newCde, existingCde);
};

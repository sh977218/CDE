const _ = require('lodash');

const classificationShared = require('esm')(module)('../../../shared/system/classificationShared');


mergeSources = (newSources, existingSources) => {
    let otherSources = existingSources.filter(s => s.sourceName !== 'NINDS');
    let result = newSources.concat(otherSources);
    return result;
};

mergeProperties = (newProperties, existingProperties) => {
    let otherSources = existingProperties.filter(s => s.source !== 'NINDS');
    let result = newProperties.concat(otherSources);
    return result;
};

mergeReferenceDocuments = (newReferenceDocuments, existingReferenceDocuments) => {
    let otherSources = existingReferenceDocuments.filter(s => s.source !== 'NINDS');
    let result = newReferenceDocuments.concat(otherSources);
    return result;
};

mergeIds = (newIds, existingIds) => {
    let otherSources = existingIds.filter(s => s.source !== 'NINDS' && s.source !== 'NINDS Variable Name' && s.source !== 'NINDS caDSR');
    let result = newIds.concat(otherSources);
    return result;
};

exports.mergeCde = (existingCde, newCde) => {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = mergeIds(newCde.ids, existingCde.ids);
    existingCde.properties = mergeProperties(newCde.properties, existingCde.properties);
    existingCde.referenceDocuments = mergeReferenceDocuments(newCde.referenceDocuments, existingCde.referenceDocuments);
    existingCde.sources = mergeSources(newCde.sources, existingCde.sources);
    existingCde.valueDomain = newCde.valueDomain;
    classificationShared.transferClassifications(newCde, existingCde);
};

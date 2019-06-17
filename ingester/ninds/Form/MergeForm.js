const _ = require('lodash');

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
    let otherSources = existingIds.filter(s => s.source !== 'NINDS' && s.source !== 'NINDS Variable Name');
    let result = newIds.concat(otherSources);
    return result;
};

exports.mergeForm = (existingForm, newForm) => {
    existingForm.designations = newForm.designations;
    //@TODO this is a temporarily, see README
    // existingForm.definitions = newForm.definitions;
    existingForm.ids = mergeIds(newForm.ids, existingForm.ids);
    existingForm.properties = mergeProperties(newForm.properties, existingForm.properties);
    existingForm.referenceDocuments = mergeReferenceDocuments(newForm.referenceDocuments, existingForm.referenceDocuments);
    existingForm.sources = mergeSources(newForm.sources, existingForm.sources);
    existingForm.formElements = newForm.formElements;
};

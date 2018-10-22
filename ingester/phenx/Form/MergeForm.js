const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

mergeSources = (newSources, existingSources) => {
    let otherSources = existingSources.filter(o => o.sourceName !== 'PhenX');
    let result = newSources.concat(otherSources);
    return result;
};

exports.mergeForm = (existingForm, newForm) => {
    existingForm.designations = newForm.designations;
    existingForm.definitions = newForm.definitions;
    existingForm.ids = newForm.ids;
    existingForm.properties = newForm.properties;
    existingForm.referenceDocuments = newForm.referenceDocuments;
    existingForm.sources = mergeSources(newForm.sources, existingForm.sources);
    existingForm.formElements = newForm.formElements;
    classificationShared.transferClassifications(newForm, existingForm);
};

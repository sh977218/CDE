const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

mergeBySources = (newSources, existingSources) => {
    let otherSources = existingSources.filter(o => o.source !== 'PhenX');
    let result = newSources.concat(otherSources);
    return result;
};

exports.mergeForm = (existingForm, newForm) => {
    existingForm.designations = newForm.designations;
    existingForm.definitions = newForm.definitions;
    existingForm.ids = mergeBySources(newForm.ids, existingForm.ids);
    existingForm.properties = mergeBySources(newForm.properties, existingForm.properties);
    existingForm.referenceDocuments = mergeBySources(newForm.referenceDocuments, existingForm.referenceDocuments);
    existingForm.sources = mergeBySources(newForm.sources, existingForm.sources);
    existingForm.formElements = newForm.formElements;
    classificationShared.transferClassifications(newForm, existingForm);
};

const _ = require('lodash');

const classificationShared = require('esm')(module)('../../../shared/system/classificationShared');

mergeSources = (newSources, existingSources) => {
    let otherSources = existingSources.filter(s => s.sourceName !== 'NINDS');
    let result = newSources.concat(otherSources);
    return result;
};

exports.mergeForm = (existingForm, newForm) => {
    existingForm.designations = newForm.designations;
    //@TODO this is a temporarily, see README
    // existingForm.definitions = newForm.definitions;
    existingForm.ids = newForm.ids;
    existingForm.properties = newForm.properties;
    existingForm.referenceDocuments = newForm.referenceDocuments;
    existingForm.sources = mergeSources(newForm.sources, existingForm.sources);
    existingForm.formElements = newForm.formElements;
    classificationShared.transferClassifications(newForm, existingForm);
};

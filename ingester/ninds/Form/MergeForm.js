const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

mergeSources = (o1, o2) => {
    let result = _.uniqBy(o1.concat(o2), 'sourceName');
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

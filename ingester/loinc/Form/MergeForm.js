const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

const mergeDesignations = require('../Shared/mergeDesignations').mergeDesignations;
const mergeDefinitions = require('../Shared/mergeDefinitions').mergeDefinitions;
const mergeBySource = require('../Shared/mergeBySource').mergeBySource;
const mergeBySourceName = require('../Shared/mergeBySourceName').mergeBySourceName;

exports.mergeForm = async (newForm, existingForm) => {
    existingForm.designations = mergeDesignations(existingForm.designations, newForm.designations);
    existingForm.definitios = mergeDefinitions(existingForm.definitions, newForm.definitions);
    existingForm.sources = mergeBySourceName(existingForm.sources, newForm.sources);

    existingForm.mappingSpecifications = newForm.mappingSpecifications;
    existingForm.referenceDocuments = mergeBySource(existingForm.referenceDocuments, newForm.referenceDocuments);
    existingForm.properties = mergeBySource(existingForm.properties, newForm.properties);
    existingForm.ids = mergeBySource(existingForm.ids, newForm.ids);
    existingForm.formElements = newForm.formElements;

    classificationShared.transferClassifications(newForm, existingForm);

};
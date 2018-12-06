const Comment = require('../../../server/discuss/discussDb').Comment;

const classificationShared = require('esm')(module)('../../../shared/system/classificationShared');

function mergeBySources(newSources, existingSources) {
    let otherSources = existingSources.filter(o => o.source !== 'PhenX');
    let result = newSources.concat(otherSources);
    return result;
};

exports.mergeForm = async (existingForm, newForm) => {
    existingForm.designations = newForm.designations;
    existingForm.definitions = newForm.definitions;
    existingForm.ids = mergeBySources(newForm.ids, existingForm.ids);
    existingForm.properties = mergeBySources(newForm.properties, existingForm.properties);
    existingForm.referenceDocuments = mergeBySources(newForm.referenceDocuments, existingForm.referenceDocuments);
    existingForm.attachments = newForm.attachments;
    existingForm.sources = mergeBySources(newForm.sources, existingForm.sources);
    if (existingForm.registrationState.registrationStatus !== 'Qualified')
        existingForm.formElements = newForm.formElements;
    classificationShared.transferClassifications(newForm, existingForm);
    await Comment.update({'element.eltId': newForm.tinyId}, {
        element: {
            eltType: 'form',
            eltId: existingForm.tinyId
        }
    })
};

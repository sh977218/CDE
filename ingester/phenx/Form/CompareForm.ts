const deepDiff = require('deep-diff');
import { cloneDeep, isEmpty } from 'lodash';

const getChildren = (formElements, ids) => {
    if (formElements) {
        formElements.forEach(formElement => {
            if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                getChildren(formElement.formElements, ids);
            } else if (formElement.elementType === 'question') {
                ids.push({
                    id: formElement.question.cde.tinyId,
                    version: formElement.question.cde.version
                });
            }
        });
    }
};


exports.compareForm = function (newForm, existingForm) {
    let newFormObj = cloneDeep(newForm);
    if (newFormObj.toObject) newFormObj = newFormObj.toObject();
    let existingFormObj = cloneDeep(existingForm);
    if (existingFormObj.toObject) existingFormObj = existingFormObj.toObject();

    [existingFormObj, newFormObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);
        delete obj._id;
        delete obj.__v;
        delete obj.tinyId;
        delete obj.imported;
        delete obj.created;
        delete obj.createdBy;
        delete obj.updated;
        delete obj.updatedBy;
        delete obj.changeNote;
        delete obj.source;
        delete obj.archived;
        delete obj.views;

        delete obj.naming;
        delete obj.classification;
        delete obj.attachments;
        delete obj.mappingSpecifications;
        delete obj.derivationRules;
        delete obj.lastMigrationScript;
        delete obj.registrationState;
        delete obj.history;
        delete obj.comments;
        obj.cdeIds = [];
        getChildren(obj.formElements, obj.cdeIds);

        delete obj.formElements;

        obj.referenceDocuments.forEach(a => {
            for (let p in a) {
                if (isEmpty(a[p])) {
                    delete a[p];
                }
            }
        });
        obj.ids.forEach(a => {
            if (a.source === 'NINDS') a.version = Number.parseFloat(a.version);
        });
    });
    return deepDiff(existingFormObj, newFormObj);
};
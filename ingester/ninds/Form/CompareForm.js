const _ = require('lodash');
const deepDiff = require('deep-diff');

exports.compareForm = function (newForm, existingForm) {
    let newFormObj = _.cloneDeep(newForm);
    if (newFormObj.toObject) newFormObj = newFormObj.toObject();
    let existingFormObj = _.cloneDeep(existingForm);
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

        if (obj.formElements.length > 0) {
            let fes = [];
            obj.formElements[0].formElements.forEach(fe => {
                if (!fe.question) {
                    console.log(fe.question + 'question bad');
                    throw new Error(fe.question + 'question bad');
                } else if (!fe.question.cde) {
                    console.log(fe.question.cde + 'cde bad');
                    throw new Error(fe.question.cde + 'cde bad');
                } else if (!fe.question.cde.tinyId) {
                    console.log(fe.question.cde.tinyId + 'tinyId bad');
                    throw new Error(fe.question.cde.tinyId + 'tinyId bad');
                } else {
                    fes.push({
                        tinyId: fe.question.cde.tinyId,
                        version: fe.question.cde.version
                    })
                }
            });
            obj.formElements = fes;
        }

        obj.referenceDocuments.forEach(a => {
            for (let p in a) {
                if (_.isEmpty(a[p])) delete a[p];
            }
        });
        obj.ids.forEach(a => {
            if (a.source === 'NINDS') a.version = Number.parseFloat(a.version);
        });
    });
    return deepDiff(existingFormObj, newFormObj);
};
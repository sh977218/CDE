const _ = require('lodash');
const deepDiff = require('deep-diff');

const wipeUseless = require('../Shared/wipeUseless').wipeUseless;

exports.compareForm = (newForm, existingForm) => {
    let newFormObj = newForm;
    if (newFormObj.toObject) newFormObj = newFormObj.toObject();
    let existingFormObj = existingForm;
    if (existingFormObj.toObject) existingFormObj = existingFormObj.toObject();

    [existingFormObj, newFormObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);

        wipeUseless(obj);

        ['properties', 'referenceDocuments', 'ids'].forEach(p => {
            obj[p] = obj[p].filter(a => a.source === 'LOINC')
        })

    });
    let result = deepDiff(existingFormObj, newFormObj);
    return result;
};
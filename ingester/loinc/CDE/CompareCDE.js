const _ = require('lodash');
const deepDiff = require('deep-diff');

const wipeUseless = require('../Shared/wipeUseless').wipeUseless;

exports.compareCde = (newCde, existingCde) => {
    let newCdeObj = _.cloneDeep(newCde);
    if (newCdeObj.toObject) newCdeObj = newCdeObj.toObject();
    let existingCdeObj = _.cloneDeep(existingCde);
    if (existingCdeObj.toObject) existingCdeObj = existingCdeObj.toObject();

    [existingCdeObj, newCdeObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);

        wipeUseless(obj);

        if (!obj.valueDomain.uom) delete obj.valueDomain.uom;

        ['properties', 'referenceDocuments', 'ids'].forEach(p => {
            obj[p] = obj[p].filter(a => a.source === 'LOINC')
        })
    });
    return deepDiff(existingCdeObj, newCdeObj);
};
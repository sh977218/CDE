const _ = require('lodash');
const utility = require('../../shared/utility');

exports.parseReferenceDocuments = nindsForms => {
    let referenceArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['References']) {
                let r = utility.removeWhite(nindsCde['References'])
                referenceArray.push(r);
            }
        })
    });

    let _referenceArray = _.uniq(referenceArray);
    let referenceDocuments = [];
    _referenceArray.forEach(r => {
        if (!_.isEmpty(r) && r !== 'No references available') {
            let referenceDocument = {
                document: r,
                source: 'NINDS'
            };
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
};
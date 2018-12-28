const _ = require('lodash');

exports.parseReferenceDocuments = nindsForms => {
    let referenceArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['References'])
                referenceArray.push(nindsCde['References']);
        })
    });

    let _referenceArray = _.uniq(referenceArray);
    let referenceDocuments = [];
    _referenceArray.forEach(r => {
        if (!_.isEmpty(r) && r !== 'No references available') {
            let refWords = _.words(r);
            let referenceDocument = {
                document: refWords.join(" "),
                source: 'NINDS'
            };
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
};
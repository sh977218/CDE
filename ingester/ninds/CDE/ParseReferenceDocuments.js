const _ = require('lodash');

exports.parseReferenceDocuments = nindsForms => {
    let referenceArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.reference)
                referenceArray.push(nindsCde.reference);
        })
    });

    let _referenceArray = _.uniq(referenceArray);
    let referenceDocuments = [];
    _referenceArray.forEach(r => {
        if (!_.isEmpty(r) && r !== 'No references available') {
            let refWords = _.words(r, /[^\s]+/g);
            let referenceDocument = {
                document: refWords.join(" "),
                source: 'NINDS'
            };
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
};
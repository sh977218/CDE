const _ = require('lodash');

exports.parseReferenceDocuments = protocol => {
    let referenceDocuments = [];
    let generalReferences = protocol['General References'];
    if (!_.isEmpty(generalReferences)) {
        _.forEach(generalReferences, generalReference => {
            let gr = generalReference.trim();
            if (!_.isEmpty(gr))
                referenceDocuments.push({
                    document: generalReference.trim(),
                    source: 'PhenX'
                });
        });
    }
    return referenceDocuments;
};
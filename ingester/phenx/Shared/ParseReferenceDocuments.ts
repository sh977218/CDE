import { forEach, isEmpty } from 'lodash';

export function parseReferenceDocuments(protocol) {
    let referenceDocuments = [];
    let generalReferences = protocol['General References'];
    if (!isEmpty(generalReferences)) {
        forEach(generalReferences, generalReference => {
            let gr = generalReference.trim();
            if (!isEmpty(gr))
                referenceDocuments.push({
                    document: generalReference.trim(),
                    source: 'PhenX'
                });
        });
    }
    return referenceDocuments;
}
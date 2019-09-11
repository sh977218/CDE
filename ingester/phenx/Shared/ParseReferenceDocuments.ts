import { forEach, isEmpty } from 'lodash';

export function parseReferenceDocuments(protocol) {
    let referenceDocuments = [];
    let generalReferences = protocol.generalReferences;
    if (!isEmpty(generalReferences)) {
        forEach(generalReferences, generalReference => {
            const gr = generalReference.trim();
            if (!isEmpty(gr)) {
                referenceDocuments.push({
                    docType: 'text',
                    languageCode: 'en-us',
                    document: gr,
                    source: 'PhenX'
                });
            }
        });
    }
    return referenceDocuments;
}
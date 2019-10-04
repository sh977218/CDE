import { forEach, isEmpty, sortBy } from 'lodash';

export function parseReferenceDocuments(protocol) {
    const referenceDocuments: any[] = [];
    const generalReferences = protocol.generalReferences;
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

    return sortBy(referenceDocuments, ['docType', 'languageCode', 'document']);
}

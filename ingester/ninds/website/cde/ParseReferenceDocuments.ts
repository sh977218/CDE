import {isEmpty, uniq} from 'lodash';

export function parseReferenceDocuments(nindsForms: any[]) {
    const referenceArray: any[] = [];
    nindsForms.forEach((nindsForm: any) => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            const referDoc = nindsCde['Disease Specific Reference'];
            if (!isEmpty(referDoc)) {
                referenceArray.push(referDoc);
            }
        });
    });

    const _referenceArray = uniq(referenceArray);
    const referenceDocuments: any[] = [];
    _referenceArray.forEach(ref => {
        if (!isEmpty(ref) && ref !== 'No references available') {
            const referenceDocument = {
                source: 'NINDS',
                document: ref
            };
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
}

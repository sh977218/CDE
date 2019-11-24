import { uniq, isEmpty } from 'lodash';

export function parseReferenceDocuments(nindsForms: any[]) {
    const referenceArray: string[] = [];
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
    _referenceArray.forEach(r => {
        if (!isEmpty(r) && r !== 'No references available') {
            const referenceDocument = {
                document: r,
                source: 'NINDS'
            };
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
}

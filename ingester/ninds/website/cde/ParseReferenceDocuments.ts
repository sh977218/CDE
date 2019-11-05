import { uniq, isEmpty } from 'lodash';

export function parseReferenceDocuments(nindsForms: any[]) {
    const referenceArray: string[] = [];
    nindsForms.forEach((nindsForm: any) => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            if (nindsCde.References) {
                const r = nindsCde.References;
                referenceArray.push(r);
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

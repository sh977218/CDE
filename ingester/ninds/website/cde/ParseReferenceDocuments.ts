import { uniq, isEmpty } from 'lodash';

export function parseReferenceDocuments(nindsForms: any[]) {
    const referenceArray: any[] = [];
    nindsForms.forEach((nindsForm: any) => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            const referDoc = nindsCde['Disease Specific Reference'];
            if (!isEmpty(referDoc)) {
                referenceArray.push({
                    formName: nindsForm.formName,
                    referDoc
                });
            }
        });
    });

    const _referenceArray = uniq(referenceArray);
    const referenceDocuments: any[] = [];
    _referenceArray.forEach(ref => {
        const r = ref.referDoc;
        if (!isEmpty(r) && r !== 'No references available') {
            const referenceDocument = {
                source: 'NINDS',
                title: ref.formName,
                document: r
            };
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
}

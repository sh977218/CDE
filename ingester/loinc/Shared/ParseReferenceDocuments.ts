import { isEmpty } from 'lodash';

export function parseReferenceDocuments(loinc) {
    const referenceDocuments: any[] = [];
    const referenceInformationArray = loinc['Reference Information'];
    if (referenceInformationArray) {
        referenceInformationArray.forEach(referenceInformation => {
            const referenceDocument: any = {};
            if (referenceInformation.Type) {
                referenceDocument.docType = referenceInformation.Type;
            }
            if (referenceInformation.Source) {
                referenceDocument.source = referenceInformation.Source;
            }
            if (referenceInformation.Reference) {
                referenceDocument.document = referenceInformation.Reference;
            }
            if (!isEmpty(referenceDocument)) {
                referenceDocument.languageCode = 'en-US';
                referenceDocuments.push(referenceDocument);
            }
        });

    }
    return referenceDocuments;
}

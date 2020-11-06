import { parseReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';
import { CdeForm } from 'shared/form/form.model';
import { isEqual, uniqWith } from 'lodash';

export async function parseNinrReferenceDocuments(ninrRow) {
    return await parseReferenceDocuments(ninrRow);
}

export function mergeNinrReferenceDocuments(existingCdeObj: CdeForm,
                                            newCdeObj: CdeForm,
                                            otherSourceRawArtifacts: CdeForm[] = []) {
    const reducer = (accumulator, currentValue) => {
        return accumulator.concat(currentValue.referenceDocuments);
    };
    const allReferenceDocuments = newCdeObj.referenceDocuments.concat(otherSourceRawArtifacts.reduce(reducer, []));
    existingCdeObj.referenceDocuments = uniqWith(allReferenceDocuments, (a, b) =>
        isEqual(a.languageCode, b.languageCode)
        && isEqual(a.docType, b.docType)
        && isEqual(a.document, b.document));
}

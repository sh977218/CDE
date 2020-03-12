import { findIndex, isEmpty } from 'lodash';
import { parseReferenceDocuments as parseCdeReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';
import { sortReferenceDocuments } from 'ingester/shared/utility';

export async function parseReferenceDocuments(rows: any[]) {
    const referenceDocuments = [];
    for (const row of rows) {
        const newReferenceDocuments: any[] = await parseCdeReferenceDocuments(row);
        for (const newReferenceDocument of newReferenceDocuments) {
            const i = findIndex(referenceDocuments, newReferenceDocument);
            if (i === -1) {
                referenceDocuments.push(newReferenceDocument);
            }
        }
    }
    return sortReferenceDocuments(referenceDocuments);
}

export async function parseNhlbiReferenceDocuments(row) {
    const referenceDocuments = [];
    if (!isEmpty(row.ExternalUrl)) {
        referenceDocuments.push({url: row.ExternalUrl});
    }
    return referenceDocuments;
}

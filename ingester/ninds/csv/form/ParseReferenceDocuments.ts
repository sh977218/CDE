import { sortReferenceDocuments } from 'ingester/shared/utility';
import { parseReferenceDocuments as parseCdeReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';

export async function parseReferenceDocuments(rows) {
    const referenceDocuments = [];
    for (const row of rows) {
        const newReferenceDocuments = await parseCdeReferenceDocuments(row);
        for (const newReferenceDocument of newReferenceDocuments) {
            const i = findIndex(referenceDocuments, newReferenceDocument);
            if (i === -1) {
                referenceDocuments.push(newReferenceDocument);
            }
        }
    }
    return sortReferenceDocuments(referenceDocuments);
}
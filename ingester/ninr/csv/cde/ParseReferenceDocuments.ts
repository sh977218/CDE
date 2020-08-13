import { parseReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';

export async function parseNinrReferenceDocuments(ninrRow) {
    return await parseReferenceDocuments(ninrRow);
}

import { parseReferenceDocuments } from 'ingester/ninds/csv/form/ParseReferenceDocuments';

export async function parseNinrReferenceDocuments(ninrRows) {
    return await parseReferenceDocuments(ninrRows);
}

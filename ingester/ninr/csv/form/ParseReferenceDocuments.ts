import {parseReferenceDocuments} from 'ingester/ninds/csv/form/ParseReferenceDocuments';

export async function parseNinrReferenceDocuments(ninrRows: any[]) {
    return await parseReferenceDocuments(ninrRows);
}

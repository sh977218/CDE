import { parseAttachments } from 'ingester/ninds/csv/form/ParseAttachments';

export async function parseNinrAttachments(formName: string, filePath:string) {
    return await parseAttachments(formName, filePath);
}


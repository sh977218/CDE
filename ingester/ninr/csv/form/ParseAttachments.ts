import { parseAttachments } from 'ingester/ninds/csv/form/ParseAttachments';
import { SocialDeterminantsOfHealthCsv } from 'ingester/createMigrationConnection';

export async function parseNinrAttachments(formName: string) {
    const csvPath = `${SocialDeterminantsOfHealthCsv}`;
    return await parseAttachments(formName, csvPath);
}


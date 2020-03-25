import { addAttachment, BATCHLOADER, NINDS_PRECLINICAL_NEI_FILE_PATH, TODAY } from 'ingester/shared/utility';
import { createReadStream } from 'fs';

export async function parseAttachments(formName: string, csvFileName: string) {
    const attachments = [];
    const csvPath = `${NINDS_PRECLINICAL_NEI_FILE_PATH}/${csvFileName}`;
    const readable = createReadStream(csvPath);
    const attachment = {
        comment: 'Original CSV File',
        filename: formName + '.csv',
        filetype: 'text/csv',
        uploadedBy: BATCHLOADER,
        uploadDate: TODAY
    };
    await addAttachment(readable, attachment);
    attachments.push(attachment);
    return attachments;
}

export async function parseNhlbiAttachments() {
    const attachments = [];
    return attachments;
}

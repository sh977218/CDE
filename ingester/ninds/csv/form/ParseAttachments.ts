import { addAttachment, BATCHLOADER, TODAY } from 'ingester/shared/utility';
import { createReadStream } from 'fs';
import { basename, extname } from 'path';

export async function parseAttachments(formName: string, filePath: string) {
    const attachments = [];
    const filetype = extname(filePath);
    const filename = basename(filePath);
    const readable = createReadStream(filePath);
    const attachment = {
        comment: 'Original Source File',
        filename,
        filetype,
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

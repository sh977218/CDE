import { createReadStream, existsSync, readdirSync } from 'fs';
import { addAttachment, BATCHLOADER, TODAY } from 'ingester/shared/utility';
import { redCapZipFolder } from 'ingester/createMigrationConnection';

async function doImg(imgFolder) {
    const attachments: any[] = [];

    const imgSubFolders = readdirSync(imgFolder);
    for (const imgSubFolder of imgSubFolders) {
        const imgSubFolderExist = existsSync(imgFolder + '/' + imgSubFolder);
        if (imgSubFolderExist) {
            const imgFiles = readdirSync(imgFolder);
            for (const imgFile of imgFiles) {
                let fileType = 'jpg';
                let imgFilePath = imgFolder + '/' + imgSubFolder + '/' + imgFile + '.' + fileType;
                let imgFileExist = existsSync(imgFilePath);
                if (!imgFileExist) {
                    fileType = 'png';
                    imgFilePath = imgFolder + '/' + imgSubFolder + '/' + imgFile + '.' + fileType;
                    imgFileExist = existsSync(imgFilePath);
                }
                if (imgFileExist) {
                    const attachment = {
                        comment: 'Original Source File',
                        filename: imgFile,
                        filetype: fileType,
                        uploadedBy: BATCHLOADER,
                        uploadDate: TODAY
                    };
                    const readable = createReadStream(imgFilePath);
                    await addAttachment(readable, attachment);
                    if (attachment) {
                        attachments.push(attachment);
                    }
                }
            }
        }
    }
    return attachments;
}

export function leadingZerosProtocolId(protocolId) {
    const leadingZeroes = '00000000';
    const veryLongProtocolId = leadingZeroes + protocolId;
    return veryLongProtocolId.substr(veryLongProtocolId.length - 6, veryLongProtocolId.length);
}

export async function parseAttachments(protocol) {
    const leadingZeroProtocolId = leadingZerosProtocolId(protocol.protocolID);
    let attachments: any[] = [];
    const imgFolderPath = redCapZipFolder + 'PX' + leadingZeroProtocolId + '/attachments';
    const imgFolderExist = existsSync(imgFolderPath);
    if (imgFolderExist) {
        const zipAttachments = await doImg(imgFolderPath);
        attachments = attachments.concat(zipAttachments);
    }
    return attachments;
}

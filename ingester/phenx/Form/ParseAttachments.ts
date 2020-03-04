import { createReadStream, existsSync, readdirSync, statSync } from 'fs';
import * as md5File from 'md5-file';
import { gfs } from 'server/system/mongo-data';
import { BATCHLOADER, NINDS_PRECLINICAL_NEI_FILE_PATH } from 'ingester/shared/utility';
import { redCapZipFolder } from 'ingester/createMigrationConnection';

function addAttachment(fileName, filePath, fileType) {
    return new Promise(async (resolve, reject) => {
        const fileSize = statSync(filePath).size;
        const attachment = {
            fileid: null,
            filename: fileName,
            filetype: fileType,
            uploadDate: Date.now(),
            comment: [],
            scanned: true,
            filesize: fileSize,
            uploadedBy: BATCHLOADER
        };

        md5File(filePath, async (err, md5) => {
            if (err) {
                console.log('MD5 failed. ' + err);
                reject(err);
            }
            gfs.findOne({md5}, (error, existingFile) => {
                if (error) {
                    console.log('Error gsf find ' + err);
                    reject(error);
                }
                if (!existingFile) {
                    const streamDescription = {
                        filename: fileName,
                        mode: 'w',
                        content_type: fileType,
                        scanned: true,
                        metadata: {
                            status: 'approved'
                        }
                    };
                    const writestream = gfs.createWriteStream(streamDescription);
                    writestream.on('close', newFile => {
                        attachment.fileid = newFile._id;
                        resolve(attachment);
                    });
                    const attachmentStream = createReadStream(filePath);
                    attachmentStream.pipe(writestream);
                } else {
                    attachment.fileid = existingFile._id;
                    resolve(attachment);
                }
            });
        });

    });
}

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
                    const attachment = await addAttachment(imgFile, imgFilePath, fileType);
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

import { createReadStream, existsSync, readdirSync, statSync } from 'fs';
import * as md5File from 'md5-file';
import { gfs } from 'server/system/mongo-data';
import { BATCHLOADER } from 'ingester/shared/utility';
import { redCapZipFolder } from 'ingester/createMigrationConnection';

function addAttachment(fileName, filePath, fileType) {
    return new Promise(async (resolve, reject) => {
        let fileSize = statSync(filePath).size;
        let attachment = {
            fileid: null,
            filename: fileName,
            filetype: fileType,
            uploadDate: Date.now(),
            comment: [],
            scanned: 'scanned',
            filesize: fileSize,
            uploadedBy: BATCHLOADER
        };

        md5File(filePath, async (err, md5) => {
            if (err) {
                console.log('MD5 failed. ' + err);
                reject(err);
            }
            gfs.findOne({md5: md5}, (error, existingFile) => {
                if (error) {
                    console.log('Error gsf find ' + err);
                    reject(error);
                }
                if (!existingFile) {
                    let streamDescription = {
                        filename: fileName,
                        mode: 'w',
                        content_type: fileType,
                        scanned: 'scanned',
                        metadata: {
                            status: 'approved'
                        }
                    };
                    let writestream = gfs.createWriteStream(streamDescription);
                    writestream.on('close', function (newFile) {
                        attachment.fileid = newFile._id;
                        resolve(attachment);
                    });
                    let attachmentStream = createReadStream(filePath);
                    attachmentStream.pipe(writestream);
                } else {
                    attachment.fileid = existingFile._id;
                    resolve(attachment);
                }
            });
        });

    })
}

async function doPdf(pdfFileName, pdfFilePath) {
    return await addAttachment(pdfFileName, pdfFilePath, 'pdf');
}

async function doImg(imgFolder) {
    let attachments = [];

    let imgSubFolders = readdirSync(imgFolder);
    for (let imgSubFolder of imgSubFolders) {
        let imgSubFolderExist = existsSync(imgFolder + '/' + imgSubFolder);
        if (imgSubFolderExist) {
            let imgFiles = readdirSync(imgFolder);
            for (let imgFile of imgFiles) {
                let fileType = 'jpg';
                let imgFilePath = imgFolder + '/' + imgSubFolder + '/' + imgFile + '.' + fileType;
                let imgFileExist = existsSync(imgFilePath);
                if (!imgFileExist) {
                    fileType = 'png';
                    imgFilePath = imgFolder + '/' + imgSubFolder + '/' + imgFile + '.' + fileType;
                    imgFileExist = existsSync(imgFilePath);
                }
                if (imgFileExist) {
                    let attachment = await addAttachment(imgFile, imgFilePath, fileType);
                    if (attachment) attachments.push(attachment);
                }
            }
        }
    }
    return attachments;
}

export function leadingZerosProtocolId(protocolId) {
    let leadingZeroes = '00000000';
    let veryLongProtocolId = leadingZeroes + protocolId;
    let result = veryLongProtocolId.substr(veryLongProtocolId.length - 6, veryLongProtocolId.length);
    return result;
}

export async function parseAttachments(protocol) {
    let leadingZeroProtocolId = leadingZerosProtocolId(protocol.protocolID);
    let attachments = [];
    let imgFolderPath = redCapZipFolder + 'PX' + leadingZeroProtocolId + '/attachments';
    let imgFolderExist = existsSync(imgFolderPath);
    if (imgFolderExist) {
        let zipAttachments = await doImg(imgFolderPath);
        attachments = attachments.concat(zipAttachments);
    }
    return attachments;
}
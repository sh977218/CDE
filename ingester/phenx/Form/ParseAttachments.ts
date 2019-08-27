const fs = require('fs');
const md5File = require('md5-file');

const mongo_data = require('../../../server/system/mongo-data');
const gfs = mongo_data.gfs;

const batchloader = require('../../shared/updatedByLoader').batchloader;

const toolkit_content = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content';
const pdfFolder = toolkit_content + '/PDF/';
const zipFolder = toolkit_content + '/redcap_zip/';

const addAttachment = (fileName, filePath, fileType) => {
    return new Promise(async (resolve, reject) => {
        let fileSize = fs.statSync(filePath).size;
        let attachment = {
            fileid: null,
            filename: fileName,
            filetype: fileType,
            uploadDate: Date.now(),
            comment: [],
            scanned: 'scanned',
            filesize: fileSize,
            uploadedBy: batchloader
        };

        md5File(filePath, async (err, md5) => {
            if (err) {
                console.log('MD5 failed. ' + err);
                process.exit(1);
            }
            gfs.findOne({md5: md5}, (err, existingFile) => {
                if (err) {
                    console.log('Error gsf find ' + err);
                    process.exit(1);
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
                    let attachmentStream = fs.createReadStream(filePath);
                    attachmentStream.pipe(writestream);
                } else {
                    attachment.fileid = existingFile._id;
                    resolve(attachment);
                }
            });
        });

    })
};

const doPdf = async (pdfFileName, pdfFilePath) => {
    return await addAttachment(pdfFileName, pdfFilePath, 'pdf');
};

const doImg = async imgFolder => {
    let attachments = [];

    let imgSubFolders = fs.readdirSync(imgFolder);
    for (let imgSubFolder of imgSubFolders) {
        let imgSubFolderExist = fs.existsSync(imgFolder + '/' + imgSubFolder);
        if (imgSubFolderExist) {
            let imgFiles = fs.readdirSync(imgFolder);
            for (let imgFile of imgFiles) {
                let fileType = 'jpg';
                let imgFilePath = imgFolder + '/' + imgSubFolder + '/' + imgFile + '.' + fileType;
                let imgFileExist = fs.existsSync(imgFilePath);
                if (!imgFileExist) {
                    fileType = 'png';
                    imgFilePath = imgFolder + '/' + imgSubFolder + '/' + imgFile + '.' + fileType;
                    imgFileExist = fs.existsSync(imgFilePath);
                }
                if (imgFileExist) {
                    let attachment = await addAttachment(imgFile, imgFilePath, fileType);
                    if (attachment) attachments.push(attachment);
                }
            }
        }
    }
    return attachments;
};

export async function parseAttachments (protocol) {
    let attachments = [];
    let protocolId = protocol.protocolId;

    let pdfFileName = 'PX' + protocolId + '.pdf';
    let pdfFilePath = pdfFolder + pdfFileName;
    let pdfFileExist = fs.existsSync(pdfFilePath);
    if (pdfFileExist) {
        let pdfAttachment = await doPdf(pdfFileName, pdfFilePath);
        if (pdfAttachment)
            attachments.push(pdfAttachment);
    }

    let imgFolderPath = zipFolder + 'PX' + protocolId + '/attachments';
    let imgFolderExist = fs.existsSync(imgFolderPath);
    if (imgFolderExist) {
        let zipAttachments = await doImg(imgFolderPath);
        attachments = attachments.concat(zipAttachments);
    }
    return attachments;
};
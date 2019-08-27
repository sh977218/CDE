const xml2js = require('xml2js');
const builder = new xml2js.Builder();
const _ = require('lodash');
let Readable = require('stream').Readable;

const mongo_data = require('../../../server/system/mongo-data');

exports.parseAttachments = nciCde => {
    let attachments = [];
    let nciXml = _.cloneDeep(nciCde);
    return new Promise((resolve, reject) => {
        let readable = new Readable();
        delete nciXml._id;
        delete nciXml.index;
        delete nciXml.xmlFile;
        let origXml = builder.buildObject(nciXml).toString();
        readable.push(origXml);
        readable.push(null);
        let nciId = nciCde.PUBLICID[0];
        let nciVersion = nciCde.VERSION[0];
        let file = {
            stream: readable
        };
        let attachment = {
            comment: "Original XML File",
            fileid: null,
            filename: nciId + "v" + nciVersion + ".xml",
            filesize: origXml.length,
            filetype: "application/xml",
            uploadedBy: batchloader,
            uploadDate: Date.now(),
        };
        let streamDescription = {
            filename: attachment.filename,
            mode: 'w',
            content_type: attachment.filetype,
            metadata: {
                status: 'approved'
            }
        };
        mongo_data.addFile(file, (err, newFile) => {
            if (err) reject(err);
            attachment.fileid = newFile._id;
            attachments.push(attachment);
            resolve(attachments);
        }, streamDescription);
    })
};
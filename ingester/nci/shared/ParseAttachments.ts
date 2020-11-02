import { BATCHLOADER, TODAY } from 'ingester/shared/utility';
import { Readable } from 'stream';
import { cloneDeep } from 'lodash';
import { addFile } from 'server/system/mongo-data';

const xml2js = require('xml2js');
const builder = new xml2js.Builder();

export function parseAttachments(nciXmlCde) {
    const attachments = [];
    const nciXml = cloneDeep(nciXmlCde);
    return new Promise((resolve, reject) => {
        const readable = new Readable();
        delete nciXml._id;
        delete nciXml.index;
        delete nciXml.xmlFile;
        const origXml = builder.buildObject(nciXml).toString();
        readable.push(origXml);
        readable.push(null);
        const nciId = nciXmlCde.PUBLICID[0];
        const nciVersion = nciXmlCde.VERSION[0];
        const file = {
            stream: readable
        };
        const attachment = {
            comment: 'Original XML File',
            fileid: null,
            filename: nciId + 'v' + nciVersion + '.xml',
            filesize: origXml.length,
            filetype: 'application/xml',
            uploadedBy: BATCHLOADER,
            uploadDate: TODAY
        };
        const streamDescription = {
            filename: attachment.filename,
            mode: 'w',
            content_type: attachment.filetype,
            metadata: {
                status: 'approved'
            }
        };
        addFile(file, streamDescription, (err, newFile) => {
            if (err) {
                reject(err);
            } else {
                attachment.fileid = newFile._id;
                attachments.push(attachment);
                resolve(attachments);
            }
        });
    });
}

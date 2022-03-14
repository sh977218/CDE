import { BATCHLOADER, TODAY } from 'ingester/shared/utility';
import { Readable } from 'stream';
import { addFile } from 'server/mongo/mongo/gfs';
import { Attachment } from 'shared/models.model';
import { copyDeep } from 'shared/util';

const xml2js = require('xml2js');
const builder = new xml2js.Builder();

export function parseAttachments(nciXmlCde: any): Promise<Attachment[]> {
    const nciXml = copyDeep(nciXmlCde);
    const readable = new Readable();
    delete nciXml._id;
    delete nciXml.index;
    delete nciXml.xmlFile;
    const origXml = builder.buildObject(nciXml).toString();
    readable.push(origXml);
    readable.push(null);
    const nciId = nciXmlCde.PUBLICID[0];
    const nciVersion = nciXmlCde.VERSION[0];
    const attachment: Attachment = {
        comment: 'Original XML File',
        fileid: '',
        filename: nciId + 'v' + nciVersion + '.xml',
        filesize: origXml.length,
        filetype: 'application/xml',
        uploadedBy: BATCHLOADER,
        uploadDate: +TODAY
    };
    return addFile(
        {
            filename: attachment.filename,
            stream: readable
        },
        {
            contentType: attachment.filetype,
            metadata: {
                status: 'approved'
            }
        }
    ).then(fileId => {
        attachment.fileid = fileId.toString();
        return [attachment];
    });
}

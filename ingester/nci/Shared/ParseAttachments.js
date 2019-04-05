const xml2js = require('xml2js');
const builder = new xml2js.Builder();

exports.parseAttachments = nciCde => {
    let attachments = [];

    let xml = builder.buildObject(nciCde);

    return attachments;
};
const _ = require('lodash');
const fs = require('fs');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;
const builder = new xml2js.Builder({attrkey: 'attribute'});
const Readable = require('stream').Readable;

const ORG_INFO_MAP = require('../Shared/ORG_INFO_MAP').map;

const attachment = require('../../../server/attachment/attachmentSvc');

const CreateCDE = require('../CDE/CreateCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MergeCDE = require('../CDE/MergeCDE');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const xmlFile = 'S:/MLB/CDE/NCI/CDE XML/cdmh.xml';

let orgInfo = ORG_INFO_MAP['NCI-CDMH'];
const user = {username: 'batchloader'};
let counter = 0;

addAttachments = (originXml, elt) => {
    return new Promise((resolve, reject) => {
        let readable = new Readable();
        let xml = builder.buildObject(originXml).toString();
        readable.push(xml);
        readable.push(null);
        attachment.addToItem(elt, {
                originalname: originXml.DataElement.PUBLICID[0] + "v" + originXml.DataElement.VERSION[0] + ".xml",
                mimetype: "application/xml",
                size: xml.length,
                stream: readable
            },
            {username: "batchloader", roles: ["AttachmentReviewer"]},
            "Original XML File", (attachment, newFileCreated, e) => {
                if (e) throw reject(e);
                resolve();
            });
    })
};


fs.readFile(xmlFile, function (err, data) {
    if (err) throw err;
    parseString(data, async function (e, json) {
        if (e) throw e;
        let nciCdes = json.DataElementsList.DataElement;
        console.log('There are ' + nciCdes.length + ' nci CDEs.');
        for (let nciXmlCde of nciCdes) {
            let id = nciXmlCde.PUBLICID[0];
            console.log('Starting id: ' + id);
            let newCdeObj = await CreateCDE.createCde(nciXmlCde, orgInfo);
            let newCde = new DataElement(newCdeObj);
            let existingCde = await DataElement.findOne({'ids.id': id});
            await addAttachments({DataElement: nciXmlCde}, newCde);
            if (!existingCde) {
                await newCde.save();
                console.log('newCde tinyId: ' + newCde.tinyId);
            }
            else {
                let diff = CompareCDE.compareCde(newCde, existingCde);
                if (_.isEmpty(diff)) {
                    existingCde.imported = today;
                    existingCde.markModivied('imported');
                } else {
                    MergeCDE.mergeCde(newCde, existingCde);
                }
                existingCde.attachments = newCde.attachments;
                await mongo_cde.updatePromise(existingCde, user);
                console.log('existingCde tinyId: ' + existingCde.tinyId);
            }
            counter++;
            console.log('counter: ' + counter);
            console.log('Finished id: ' + id);
        }
        console.log('Finished all.');
    });
});
import { BATCHLOADER, updateCde } from 'ingester/shared/utility';
import { dbPlugins } from 'server';

const _ = require('lodash');
const fs = require('fs');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;
const builder = new xml2js.Builder({attrkey: 'attribute'});
const Readable = require('stream').Readable;

const attachment = require('../../../server/attachment/attachmentSvc');

const CreateCDE = require('../CDE/CreateCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MergeCDE = require('../CDE/MergeCDE');

const DataElement = require('../../../server/cde/mongo-cde').dataElementModel;
const DataElementDb = dbPlugins.dataElement;

const xmlFile = 'S:/MLB/CDE/NCI/CDE XML/cdmh.xml';

let orgInfo = ORG_INFO_MAP['NCI-CDMH'];
let counter = 0;

const addAttachments = (db, originXml, elt) => {
    let readable = new Readable();
    let xml = builder.buildObject(originXml).toString();
    readable.push(xml);
    readable.push(null);
    return attachment.addToItem(db, elt, {
            originalname: originXml.DataElement.PUBLICID[0] + "v" + originXml.DataElement.VERSION[0] + ".xml",
        }, {
            mimetype: "application/xml",
            size: xml.length,
            stream: readable
        },
        BATCHLOADER,
        "Original XML File",);
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
            await addAttachments(DataElementDb, {DataElement: nciXmlCde}, newCde);
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
                await updateCde(existingCde, BATCHLOADER);
                console.log('existingCde tinyId: ' + existingCde.tinyId);
            }
            counter++;
            console.log('counter: ' + counter);
            console.log('Finished id: ' + id);
        }
        console.log('Finished all.');
    });
});

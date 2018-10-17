const fs = require('fs');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;


const xmlFile = 'S:/MLB/CDE/NCI/CDE XML/cdmh.xml';

fs.readFile(xmlFile, function (err, data) {
    if (err) throw err;
    parseString(data, async function (e, json) {
        if (e) throw e;
        let nciCdes = json.DataElementsList.DataElement;
        for (let nciCde of nciCdes) {
            let id = nciCde.PUBLICID[0];
            let version = nciCde.VERSION[0];
            let cde = await DataElement.fineOne({'ids.id': id});
            let temp = '';
        }
        console.log('a');
    });
});
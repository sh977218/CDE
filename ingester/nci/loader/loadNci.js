const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser();
const fs = require('fs');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const DataElementSource = mongo_cde.DataElementSource;

const CreateCDE = require('../CDE/CreateCDE');

const ORG_INFO_MAP = require('../Shared/ORG_INFO_MAP').map;

let createdCDE = 0;
let sameCDE = 0;
let changeCDE = 0;
let skipCDE = 0;

function runOneOrg(org) {
    let orgInfo = ORG_INFO_MAP[org];
    let xmlFile = orgInfo.xml;
    return new Promise((resolve, reject) => {
        fs.readFile(xmlFile, function (err, data) {
            xmlParser.parseString(data, async function (err, nciXml) {
                if (err) reject(err);
                for (let nciCde of nciXml.DataElementsList.DataElement) {
                    let nciId = nciCde.PUBLICID[0];
                    let newCdeObj = await CreateCDE.createCde(nciCde, orgInfo);
                    let newCde = new DataElement(newCdeObj);
                    let existingCde = await DataElement.findOne({
                        archived: false,
                        'registrationState.registrationStatus': {$ne: 'Retired'},
                        'ids.id': nciId
                    });
                    if (!existingCde) {
                        let savedCde = await newCde.save();
                        createdCDE++;
                        console.log('createdForm: ' + createdCDE + ' ' + savedCde.tinyId);
                    } else {

                    }

                    await DataElementSource.update({tinyId: newCdeObj.tinyId}, newCdeObj, {upsert: true});
                    resove();
                }
            });
        });
    });
}

async function runOrgs(orgs) {
    for (let org of orgs) {
        await runOneOrg(org)
    }
}

exports.run = function (orgs) {
    runOrgs(orgs).then((err, result) => {
        if (err) console.log(err);
        else console.log(result);
    });
};
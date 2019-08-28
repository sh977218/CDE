const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser();
const fs = require('fs');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const DataElementSource = mongo_cde.DataElementSource;
const CreateCDE = require('../CDE/CreateCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MergeCDE = require('../CDE/MergeCDE');

const Comment = require('../../../server/discuss/discussDb').Comment;

const ORG_INFO_MAP = require('../Shared/ORG_INFO_MAP').map;

let createdCDE = 0;

function runOneOrg(org) {
    let orgInfo = ORG_INFO_MAP[org];
    let xmlFile = orgInfo.xml;
    return new Promise((resolve, reject) => {
        fs.readFile(xmlFile, function (err, data) {
            xmlParser.parseString(data, async function (err, nciXml) {
                if (err) reject(err);
                for (let nciCde of nciXml.DataElementsList.DataElement) {
                    let nciId = nciCde.PUBLICID[0];
                    let newCdeObj = await CreateCDE.createCde(nciCde, orgInfo).catch(e => {
                        console.log('create cde err');
                        console.log(e);
                    });
                    let newCde = new DataElement(newCdeObj);
                    let existingCde = await DataElement.findOne({
                        archived: false,
                        'registrationState.registrationStatus': {$ne: 'Retired'},
                        'ids.id': nciId
                    }).catch(e => {
                        console.log('cde find one err');
                        console.log(e);
                    });
                    if (!existingCde) {
                        existingCde = await newCde.save().catch(e => {
                            console.log('new cde save err');
                            console.log(e);
                        });
                        createdCDE++;
                        console.log('createdCDE: ' + createdCDE + ' ' + existingCde.tinyId);
                    } else {
                        console.log('found ' + nciId);
                        let diff = CompareCDE.compareCde(newCde, existingCde);
                        if (diff.length) {
                            MergeCDE.mergeCde(newCde, existingCde);
                            await mongo_cde.updatePromise(existingCde, batchloader, {updateSource: true}).catch(e => {
                                console.log('mongo cde update promise err');
                                throw e;
                            })
                        }
                    }
                    for (let comment of newCdeObj.comments) {
                        comment.element.eltId = existingCde.tinyId;
                        await new Comment(comment).save();
                        console.log('comment saved on ' + existingCde.tinyId);
                    }
                    delete newCdeObj.tinyId;
                    let updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true}).catch(e => {
                        console.log('data element source update one err');
                        throw e;
                    });
                    console.log(updateResult.nModified + ' data element source modified: ');
                    resolve();
                }
            });
        });
    });
}

async function runOrgs(orgs) {
    for (let org of orgs) {
        await runOneOrg(org);
        console.log('Finished org: ' + org);
    }
}

exports.run = function (orgs) {
    runOrgs(orgs).then((err, result) => {
        if (err) console.log(err);
        else console.log('Finished all orgs.');
    });
};
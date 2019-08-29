import { isEmpty } from 'lodash';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { Comment } from 'server/discuss/discussDb';
import { createNciCde } from 'ingester/nci/CDE/cde';
import { readFile } from 'fs';
import { NCI_ORG_INFO_MAP } from 'ingester/nci/shared/ORG_INFO_MAP';

const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser();

let createdCDE = 0;
const createdCdes = [];
let sameCde = 0;
const sameCdes = [];
let changedCde = 0;
const changedCdes = [];

function runOneOrg(orgName) {
    const orgInfo = NCI_ORG_INFO_MAP[orgName];
    const xmlFile = orgInfo.xml;
    return new Promise((resolve, reject) => {
        readFile(xmlFile, (err, data) => {
            if (err) {
                reject(err);
            } else {
                xmlParser.parseString(data, async (error, nciXml) => {
                    if (error) {
                        reject(err);
                    }
                    for (const nciXmlCde of nciXml.DataElementsList.DataElement) {
                        const nciId = nciXmlCde.PUBLICID[0];
                        const nciCde = await createNciCde(nciXmlCde, orgInfo);
                        const newCde = new DataElement(nciCde);
                        const newCdeObj = newCde.toObject();
                        let existingCde = await DataElement.findOne({
                            archived: false,
                            'registrationState.registrationStatus': {$ne: 'Retired'},
                            'ids.id': nciId
                        });
                        if (!existingCde) {
                            existingCde = await newCde.save();
                            createdCDE++;
                            createdCdes.push(existingCde.tinyId);
                        } else {
                            const existingCdeObj = existingCde.toObject();
                            existingCdeObj.imported = imported;
                            existingCdeObj.changeNote = lastMigrationScript;
                            const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NCI');
                            if (isEmpty(diff)) {
                                existingCdeObj.lastMigrationScript = lastMigrationScript;
                                await existingCde.save();
                                sameCde++;
                                sameCdes.push(existingCdeObj.tinyId);
                            } else {
                                mergeElt(existingCdeObj, newCdeObj, 'NCI');
                                existingCdeObj.lastMigrationScript = lastMigrationScript;
                                await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
                                changedCde++;
                                changedCdes.push(existingCde.tinyId);
                            }
                        }
                        for (const comment of nciCde.comments) {
                            comment.element.eltId = existingCde.tinyId;
                            await new Comment(comment).save();
                            console.log('comment saved on ' + existingCde.tinyId);
                        }
                        delete newCdeObj.tinyId;
                        delete newCdeObj._id;
                        newCdeObj.attachments = [];
                        const updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true});
                        printUpdateResult(updateResult, existingCde);
                    }
                    resolve();
                });
            }
        });
    });
}

export async function runOrgs(orgNames) {
    for (const orgName of orgNames) {
        await runOneOrg(orgName);
        console.log(`*********************${orgName}`);
        console.log(`createdCDE: ${createdCDE}`);
        console.log(`createdCdes: ${createdCdes}`);
        console.log(`sameCde: ${sameCde}`);
        console.log(`sameCdes: ${sameCdes}`);
        console.log(`changedCde: ${changedCde}`);
        console.log(`changedCdes: ${changedCdes}`);
        console.log(`********************Finished org: ${orgName}\n`);
    }
}

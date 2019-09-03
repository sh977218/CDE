import { isEmpty } from 'lodash';
import { BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, updateCde } from 'ingester/shared/utility';
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
//                    let nciXmlCdes = nciXml.DataElementsList.DataElement.filter(n => n.PUBLICID[0] === '6365382');
                    let nciXmlCdes = nciXml.DataElementsList.DataElement;
                    for (const nciXmlCde of nciXmlCdes) {
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
                            const _existingCdeObj = existingCde.toObject();
                            _existingCdeObj.properties.forEach(p => {
                                if (isEmpty(p.source)) {
                                    p.source = 'caDSR';
                                }
                            });
                            existingCde.properties = _existingCdeObj.properties;
                            if (_existingCdeObj.valueDomain.datatype === 'Date') {
                                delete _existingCdeObj.valueDomain.datatypeDate;
                            }
                            if (_existingCdeObj.valueDomain.datatype === 'Text') {
                                if (isEmpty(_existingCdeObj.valueDomain.datatypeText)) {
                                    delete _existingCdeObj.valueDomain.datatypeText;
                                }
                            }
                            if (_existingCdeObj.valueDomain.datatype === 'Number') {
                                if (isEmpty(_existingCdeObj.valueDomain.datatypeNumber)) {
                                    delete _existingCdeObj.valueDomain.datatypeNumber;
                                }
                            }
                            existingCde.valueDomain = _existingCdeObj.valueDomain;

                            existingCde = await existingCde.save();

                            existingCde.sources.forEach(s => {
                                if (s.sourceName === 'caDSR') {
                                    s.imported = imported;
                                    existingCde.markModified('sources');
                                }
                            });
                            const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NCI');
                            if (isEmpty(diff)) {
                                existingCde.imported = imported;
                                existingCde.lastMigrationScript = lastMigrationScript;
                                await existingCde.save();
                                sameCde++;
                                sameCdes.push(existingCde.tinyId);
                            } else {
                                const existingCdeObj = existingCde.toObject();
                                mergeElt(existingCdeObj, newCdeObj, 'NCI');
                                existingCdeObj.imported = imported;
                                existingCdeObj.changeNote = lastMigrationScript;
                                existingCdeObj.lastMigrationScript = lastMigrationScript;
                                await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
                                changedCde++;
                                changedCdes.push(existingCde.tinyId);
                            }
                        }
                        if (nciCde.comments) {
                            for (const comment of nciCde.comments) {
                                comment.element.eltId = existingCde.tinyId;
                                await new Comment(comment).save();
                                console.log('comment saved on ' + existingCde.tinyId);
                            }
                        }
                        delete newCdeObj.tinyId;
                        delete newCdeObj._id;
                        newCdeObj.attachments = [];
                        const updateResult = await DataElementSource.updateOne({
                            tinyId: existingCde.tinyId,
                            source: 'caDSR'
                        }, newCdeObj, {upsert: true});
                        // printUpdateResult(updateResult, existingCde);
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

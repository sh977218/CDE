import {isEmpty} from 'lodash';
import {
    BATCHLOADER,
    compareElt,
    imported,
    lastMigrationScript,
    mergeClassificationByOrg,
    mergeElt,
    updateCde,
    updateRawArtifact
} from '../../shared/utility';
import {dataElementModel} from 'server/cde/mongo-cde';
import {createNciCde} from '../CDE/cde';
import {readFile} from 'fs';
import {NCI_ORG_INFO_MAP} from '../shared/ORG_INFO_MAP';

const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser();

let createdCDE = 0;
const createdCdes: string[] = [];
let sameCde = 0;
const sameCdes: string[] = [];
let changedCde = 0;
const changedCdes: string[] = [];

function runOneOrg(orgName: string) {
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
                    const nciXmlCdes = nciXml.DataElementsList.DataElement;
                    for (const nciXmlCde of nciXmlCdes) {
                        const nciId = nciXmlCde.PUBLICID[0];
                        const nciCde = await createNciCde(nciXmlCde, orgInfo);
                        const newCde = new dataElementModel(nciCde);
                        const newCdeObj = newCde.toObject();
                        let existingCde = await dataElementModel.findOne({
                            archived: false,
                            'registrationState.registrationStatus': {$ne: 'Retired'},
                            'ids.id': nciId
                        });
                        if (!existingCde) {
                            existingCde = await newCde.save();
                            createdCDE++;
                            createdCdes.push(existingCde.tinyId);
                        } else {
                            const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NCI');
                            mergeClassificationByOrg(existingCde, newCde.toObject(), 'NCI');
                            if (isEmpty(diff)) {
                                existingCde.imported = imported;
                                existingCde.lastMigrationScript = lastMigrationScript;
                                await existingCde.save();
                                sameCde++;
                                sameCdes.push(existingCde.tinyId);
                            } else {
                                const existingCdeObj = existingCde.toObject();
                                mergeElt(existingCdeObj, newCdeObj, 'NCI');
                                await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
                                changedCde++;
                                changedCdes.push(existingCde.tinyId);
                            }
                        }
                        if (nciCde.comments) {
                            for (const comment of nciCde.comments) {
                                comment.element.eltId = existingCde.tinyId;
                                await new commentModel(comment).save();
                                console.log('comment saved on ' + existingCde.tinyId);
                            }
                        }

                        await updateRawArtifact(existingCde, newCdeObj, 'caDSR', 'NCI');
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
        console.log(`********************Finished org: ${orgName}\n`);
    }
    console.log(`createdCDE: ${createdCDE}`);
    console.log(`createdCdes: ${createdCdes}`);
    console.log(`sameCde: ${sameCde}`);
    console.log(`sameCdes: ${sameCdes}`);
    console.log(`changedCde: ${changedCde}`);
    console.log(`changedCdes: ${changedCdes}`);
}

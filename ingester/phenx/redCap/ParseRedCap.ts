import * as csv from 'csv-parse';
import { createReadStream, existsSync } from 'fs';
import { find, isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createRedCde } from 'ingester/phenx/redCap/cde';
import { convert } from 'ingester/phenx/redCap/RedCapCdeToQuestion';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';
import { leadingZerosProtocolId } from 'ingester/phenx/Form/ParseAttachments';
import { Comment } from 'server/discuss/discussDb';
import { redCapZipFolder } from 'ingester/createMigrationConnection';
import { RedcapLogger } from 'ingester/log/RedcapLogger';

function doInstrument(instrumentFilePath): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results = [];
        const options = {
            trim: true,
            skip_empty_lines: true,
            columns: true,
            relax_column_count: true
        };
        createReadStream(instrumentFilePath)
            .pipe(csv(options))
            .on('data', data => {
                if (!isEmpty(data)) {
                    results.push(data);
                }
            })
            .on('err', err => {
                reject(err);
            })
            .on('end', () => {
                resolve(results);
            });
    });
}

function doDescriptive(sectionFes, redCapCde, attachments) {
    const variableFieldName = redCapCde['Variable / Field Name'];
    const fieldLabel = redCapCde['Field Label'];
    const foundAttachment = find(attachments, a => a.filename === variableFieldName);
    if (foundAttachment) {
        const img = `<img src="/data/${foundAttachment.fileid}" alt="${foundAttachment.filename}"/>`;
        const figcaption = `<figcaption>${fieldLabel}</figcaption>`;
        sectionFes.instructions.value += `\n<figure>${figcaption}${img}</figure>`;
    } else {
        sectionFes.instructions.value += '\n' + fieldLabel;
    }
}

async function doOneRedCap(redCap, redCaps, protocol, newForm) {
    const redCapCde = await createRedCde(redCap, protocol, newForm);
    const newCde = new DataElement(redCapCde);
    const newCdeObj = newCde.toObject();
    let existingCde = await DataElement.findOne({archived: false, 'ids.id': newCdeObj.ids[0].id});
    if (!existingCde) {
        existingCde = await newCde.save();
        RedcapLogger.createdRedcapCde++;
        RedcapLogger.createdRedcapCdes.push(existingCde.tinyId);
    } else {
        existingCde.imported = imported;
        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.changeNote = lastMigrationScript;
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'PhenX');
        if (isEmpty(diff)) {
            await existingCde.save();
            RedcapLogger.sameRedcapCde++;
            RedcapLogger.sameRedcapCdes.push(existingCde.tinyId);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'PhenX');
            await updateCde(existingCde, batchloader, {updateSource: true});
            RedcapLogger.changedRedcapCde++;
            RedcapLogger.changedRedcapCdes.push(existingCde.tinyId);
        }
    }
    for (const comment of redCapCde.comments) {
        comment.element.eltId = existingCde.tinyId;
        await new Comment(comment).save();
    }
    delete newCdeObj.tinyId;
    delete newCdeObj._id;
    newCdeObj.attachments = [];
    const updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true});
    printUpdateResult(updateResult, existingCde);
    return existingCde;
}

export async function parseFormElements(protocol, attachments, newForm) {
    const formElements = [];
    const protocolId = protocol.protocolID;

    const leadingZeroProtocolId = leadingZerosProtocolId(protocolId);
    const redCapFolder = redCapZipFolder + 'PX' + leadingZeroProtocolId + '/';

    let redCaps = [];
    const instrumentFileName = 'instrument.csv';
    const instrumentFilePath = redCapFolder + instrumentFileName;
    const instrumentFileExist = existsSync(instrumentFilePath);
    if (instrumentFileExist) {
        redCaps = await doInstrument(instrumentFilePath);
    } else {
        const instrumentFilePathAlter = redCapFolder + 'PX' + protocolId + '/' + instrumentFileName;
        const instrumentFileExistAlter = existsSync(instrumentFilePathAlter);
        if (instrumentFileExistAlter) {
            redCaps = await doInstrument(instrumentFilePathAlter);
        } else {
            const csvComment = {
                text: newForm.ids[0].id + ' PhenX Batch loader was not able to find instrument.csv',
                user: batchloader,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'description',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'form',
                }
            };
            newForm.comments.push(csvComment);
        }
    }
    let newSection = true;
    let fe;
    let index = 0;
    for (const redCap of redCaps) {
        index++;
        const fieldType = redCap['Field Type'];
        const variableName = redCap['Variable / Field Name'];
        const fieldLabel = redCap['Field Label'];
        const sectionHeader = redCap['Section Header'];
        if (fieldType === 'descriptive') {
            if (newSection) {
                formElements.push({
                    elementType: 'section',
                    label: '',
                    instructions: {value: '', valueFormat: 'html'},
                    skipLogic: {condition: ''},
                    formElements: []
                });
                newSection = false;
            }
            fe = formElements[formElements.length - 1];
            doDescriptive(fe, redCap, attachments);
        } else {
            if (index === 1) {
                formElements.push({
                    elementType: 'section',
                    label: '',
                    instructions: {value: '', valueFormat: 'html'},
                    skipLogic: {condition: ''},
                    formElements: []
                });
            }
            newSection = true;
            fe = formElements[formElements.length - 1];
            if (!isEmpty(sectionHeader) || !isEmpty(fieldLabel)) {
                const existingCde = await doOneRedCap(redCap, redCaps, protocol, newForm);
                const question = await convert(redCap, redCaps, existingCde, newForm);
                fe.formElements.push(question);
            } else {
                console.log('Skip row with empty sectionHeader and empty fieldLabel in redCap. ' + protocolId);
                console.log('variableName: ' + variableName);
            }
        }
    }
    newForm.formElements = formElements;
    RedcapLogger.log();
}

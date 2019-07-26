import * as csv from 'csv-parse';
import { createReadStream, existsSync, readFile } from 'fs';
import { find, isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createCde } from 'ingester/phenx/redCap/cde';
import { convert } from 'ingester/phenx/redCap/RedCapCdeToQuestion';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';
import { leadingZerosProtocolId } from 'ingester/phenx/Form/ParseAttachments';
import { Comment } from 'server/discuss/discussDb';
import { redCapZipFolder } from 'ingester/createMigrationConnection';


let createdRedCde = 0;
let createdRedCdes = [];
let sameRedCde = 0;
let sameRedCdes = [];
let changedRedCde = 0;
let changedRedCdes = [];

function doInstrumentID(instrumentIDFilePath): Promise<string> {
    return new Promise((resolve, reject) => {
        readFile(instrumentIDFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read instrumentIDFilePath failed. ' + err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}

function doAuthorID(authorIDFilePath): Promise<string> {
    return new Promise((resolve, reject) => {
        readFile(authorIDFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read authorIDFilePath failed. ' + err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}

function doInstrument(instrumentFilePath): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let results = [];
        let options = {
            trim: true,
            skip_empty_lines: true,
            columns: true,
            relax_column_count: true
        };
        createReadStream(instrumentFilePath)
            .pipe(csv(options))
            .on('data', function (data) {
                results.push(data);
            })
            .on('err', function (err) {
                reject(err);
            })
            .on('end', function () {
                resolve(results);
            });
    })
}

function doDescriptive(sectionFes, redCapCde, attachments) {
    let variableFieldName = redCapCde['Variable / Field Name'];
    let fieldLabel = redCapCde['Field Label'];
    let foundAttachment = find(attachments, a => a.filename === variableFieldName);
    if (foundAttachment) {
        sectionFes.instructions.value += '\n<figure><figcaption>' + fieldLabel + '</figcaption><img src="/data/' + foundAttachment.fileid + '"/></figure>';
    } else {
        sectionFes.instructions.value += '\n' + fieldLabel;
    }
}

async function redCapToCde(redCapCde, redCapCdes, formId, protocol, newForm) {
    let newCdeObj = await createCde(redCapCde, formId, protocol);
    let newCde = new DataElement(newCdeObj);
    newCdeObj = newCde.toObject();
    let existingCde = await DataElement.findOne({archived: false, 'ids.id': newCdeObj.ids[0].id});
    if (!existingCde) {
        existingCde = await newCde.save();
        createdRedCde++;
        createdRedCdes.push(existingCde.tinyId);
    } else {
        existingCde.imported = imported;
        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.changeNote = lastMigrationScript;
        let diff = compareElt(newCde.toObject(), existingCde.toObject(), 'PhenX');
        if (isEmpty(diff)) {
            await existingCde.save();
            sameRedCde++;
            sameRedCdes.push(existingCde.tinyId);
        } else {
            let existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'PhenX');
            await updateCde(existingCde, batchloader, {updateSource: true});
            changedRedCde++;
            changedRedCdes.push(existingCde.tinyId);
        }
    }
    for (let comment of newCdeObj['comments']) {
        comment.element.eltId = newCdeObj.tinyId;
        await new Comment(comment).save();
    }
    delete newCdeObj.tinyId;
    newCdeObj.attachments = [];
    let updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true});
    printUpdateResult(updateResult, existingCde);
    return existingCde;
}

export async function parseFormElements(protocol, attachments, newForm) {
    let formElements = [];
    let protocolId = protocol.protocolID;

    let leadingZeroProtocolId = leadingZerosProtocolId(protocolId);
    let redCapFolder = redCapZipFolder + 'PX' + leadingZeroProtocolId + '/';

    let formId = '';
    let instrumentIDFileName = 'instrumentID.txt';
    let instrumentIDFilePath = redCapFolder + instrumentIDFileName;
    let instrumentIDFileExist = existsSync(instrumentIDFilePath);
    if (instrumentIDFileExist) {
        formId = await doInstrumentID(instrumentIDFilePath);
    } else {
        console.log('instrumentId.txt not found. protocolId: ' + protocolId);
        process.exit(1);
    }

    let authorId = '';
    let authorIdFileName = 'AuthorID.txt';
    let authorIdFilePath = redCapFolder + authorIdFileName;
    let authorIdFileExist = existsSync(authorIdFilePath);
    if (authorIdFileExist) {
        authorId = await doAuthorID(authorIdFilePath);
        if (authorId !== 'PhenX') {
            console.log('Unknown author Id ' + authorId);
            process.exit(1);
        }
    } else {
        console.log('AuthorID.txt not found. protocolId: ' + protocolId);
        process.exit(1);
    }

    let redCapCdes = [];
    let instrumentFileName = 'instrument.csv';
    let instrumentFilePath = redCapFolder + instrumentFileName;
    let instrumentFileExist = existsSync(instrumentFilePath);
    if (instrumentFileExist) {
        redCapCdes = await doInstrument(instrumentFilePath);
    } else {
        let _instrumentFilePath = redCapFolder + 'PX' + protocolId + '/' + instrumentFileName;
        let _instrumentFileExist = existsSync(_instrumentFilePath);
        if (_instrumentFileExist) {
            redCapCdes = await doInstrument(_instrumentFilePath);
        } else {
            let csvComment = {
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
    for (let redCapCde of redCapCdes) {
        index++;
        let fieldType = redCapCde['Field Type'];
        let variableName = redCapCde['Variable / Field Name'];
        let fieldLabel = redCapCde['Field Label'];
        let sectionHeader = redCapCde['Section Header'];
        if (fieldType === 'descriptive') {
            if (newSection) {
                formElements.push({
                    elementType: "section",
                    label: '',
                    instructions: {value: '', valueFormat: 'html'},
                    skipLogic: {condition: ''},
                    formElements: []
                });
                newSection = false;
            }
            fe = formElements[formElements.length - 1];
            doDescriptive(fe, redCapCde, attachments);
        } else {
            if (index === 1)
                formElements.push({
                    elementType: "section",
                    label: '',
                    instructions: {value: '', valueFormat: 'html'},
                    skipLogic: {condition: ''},
                    formElements: []
                });
            newSection = true;
            fe = formElements[formElements.length - 1];
            if (!isEmpty(sectionHeader) || !isEmpty(fieldLabel)) {
                let existingCde = await redCapToCde(redCapCde, redCapCdes, formId, protocol, newForm);
                let question = await convert(redCapCde, redCapCdes, existingCde, newForm);
                fe.formElements.push(question);
            } else {
                console.log('Empty designation row in redCap. ' + protocolId);
                console.log('variableName: ' + variableName);
                console.log('sectionHeader: ' + sectionHeader);
                console.log('fieldLabel: ' + fieldLabel);
                process.exit(1);
            }
        }
    }
    newForm.formElements = formElements;
    console.log('createdRedCde: ' + createdRedCde);
    console.log('createdRedCdes: ' + createdRedCdes);
    console.log('sameRedCde: ' + sameRedCde);
    console.log('sameRedCdes: ' + sameRedCdes);
    console.log('changedRedCde: ' + changedRedCde);
    console.log('changedRedCdes: ' + changedRedCdes);
}
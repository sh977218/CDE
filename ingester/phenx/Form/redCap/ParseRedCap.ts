import { existsSync, readFile } from 'fs';
import { find, isEmpty } from 'lodash';
import { BATCHLOADER, updateCde, updatedByLoader } from 'ingester/shared/utility';
import { DataElement } from 'server/cde/mongo-cde';
import { convert } from 'ingester/phenx/Form/redCap/RedCapCdeToQuestion';

const csvParser = require('csv-parse');

const CreateCDE = require('./CreateCDE');
const CompareCDE = require('../../CDE/CompareCDE');
const MergeCDE = require('../../CDE/MergeCDE');


const toolkit_content = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content';
const redCapZipFolder = toolkit_content + '/redcap_zip/';

const doInstrumentID = instrumentIDFilePath => {
    return new Promise((resolve, reject) => {
        readFile(instrumentIDFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read instrumentIDFilePath failed. ' + err);
                process.exit(1);
            }
            resolve(data);
        });
    })
};
const doAuthorID = authorIDFilePath => {
    return new Promise((resolve, reject) => {
        readFile(authorIDFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read authorIDFilePath failed. ' + err);
                process.exit(1);
            }
            resolve(data);
        });
    })
};

const doInstrument = instrumentFilePath => {
    return new Promise((resolve, reject) => {
        readFile(instrumentFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read instrumentFilePath failed. ' + err);
                process.exit(1);
            }
            let records = [];
            let options = {
                trim: true,
                skip_empty_lines: true,
                columns: true,
                relax_column_count: true
            };
            csvParser(data, options)
                .on('readable', async function () {
                    let record = this.read();
                    if (record) records.push(record);
                })
                .on('end', function () {
                    resolve(records);
                })
        })
    })
};

function doDescriptive(sectionFes, redCapCde, attachments) {
    let variableFieldName = redCapCde['Variable / Field Name'];
    let fieldLabel = redCapCde['Field Label'];
    let foundAttachment = find(attachments, a => a.filename === variableFieldName);
    if (foundAttachment) sectionFes.instructions.value += '\n<figure><figcaption>' + fieldLabel + '</figcaption><img src="/data/' + foundAttachment.fileid + '"/></figure>';
    else sectionFes.instructions.value += '\n' + fieldLabel;
}

async function doQuestion(redCapCde, redCapCdes, formId, protocol, newForm) {
    let newCdeObj = await CreateCDE.createCde(redCapCde, formId, protocol);
    let newCde = new DataElement(newCdeObj);
    let cdeId = newCdeObj.ids[0].id;
    let existingCde = await DataElement.findOne({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'ids.id': cdeId
    });
    if (!existingCde) {
        existingCde = await newCde.save();
    } else if (updatedByLoader(existingCde)) {
    } else {
        existingCde.imported = new Date().toJSON();
        existingCde.markModified('imported');
        let diff = CompareCDE.compareCde(newCde, existingCde);
        if (isEmpty(diff)) {
            await existingCde.save();
        } else {
            await MergeCDE.mergeCde(existingCde, newCde);
            await updateCde(existingCde, BATCHLOADER);
        }
    }
    let question = await convert(redCapCde, redCapCdes, existingCde, newForm);
    return question;
}

exports.parseFormElements = async (protocol, attachments, newForm) => {
    let formElements = [];
    let protocolId = protocol.protocolId;

    let zipFolder = redCapZipFolder + 'PX' + protocolId;

    let formId = '';
    let instrumentIDFileName = 'instrumentID.txt';
    let instrumentIDFilePath = zipFolder + '/' + instrumentIDFileName;
    let instrumentIDFileExist = existsSync(instrumentIDFilePath);
    if (instrumentIDFileExist) {
        formId = await doInstrumentID(instrumentIDFilePath);
    }

    let authorId = '';
    let authorIdFileName = 'AuthorID.txt';
    let authorIdFilePath = zipFolder + '/' + authorIdFileName;
    let authorIdFileExist = existsSync(authorIdFilePath);
    if (authorIdFileExist) {
        authorId = await doAuthorID(authorIdFilePath);
        if (authorId !== 'PhenX') {
            console.log('Unknown author Id ' + authorId);
            process.exit(1);
        }
    }

    let redCapCdes = [];
    let instrumentFileName = 'instrument.csv';
    let instrumentFilePath = zipFolder + '/' + instrumentFileName;
    let instrumentFileExist = existsSync(instrumentFilePath);
    if (instrumentFileExist) {
        redCapCdes = await doInstrument(instrumentFilePath);
    } else {
        let _instrumentFilePath = zipFolder + '/' + 'PX' + protocolId + '/' + instrumentFileName;
        let _instrumentFileExist = existsSync(_instrumentFilePath);
        if (_instrumentFileExist) {
            redCapCdes = await doInstrument(_instrumentFilePath);
        } else {
            let csvComment = {
                text: newForm.ids[0].id + ' Phenx Batch loader was not able to find instrument.csv',
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
                let question = await doQuestion(redCapCde, redCapCdes, formId, protocol, newForm);
                fe.formElements.push(question);
            } else {
                console.log('Empty designation row in redCap. ' + protocolId);
                console.log('variableName: ' + variableName);
                console.log('sectionHeader: ' + sectionHeader);
                console.log('fieldLabel: ' + fieldLabel);
            }
        }
    }
    newForm.formElements = formElements;
};
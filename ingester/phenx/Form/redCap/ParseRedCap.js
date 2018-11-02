const _ = require('lodash');
const fs = require('fs');
const csvParser = require('csv-parse');

const mongo_cde = require('../../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const CreateCDE = require('./CreateCDE');
const CompareCDE = require('../../CDE/CompareCDE');
const MergeCDE = require('../../CDE/MergeCDE');

const RedCapCdeToQuestion = require('./RedCapCdeToQuestion');

const updatedByLoader = require('../../../shared/updatedByLoader').updatedByLoader;
const batchloader = require('../../../shared/updatedByLoader').batchloader;

const toolkit_content = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content';
const redCapZipFolder = toolkit_content + '/redcap_zip/';

doInstrumentID = instrumentIDFilePath => {
    return new Promise((resolve, reject) => {
        fs.readFile(instrumentIDFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read instrumentIDFilePath failed. ' + err);
                process.exit(1);
            }
            resolve(data);
        });
    })
};
doAuthorID = authorIDFilePath => {
    return new Promise((resolve, reject) => {
        fs.readFile(authorIDFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('Read authorIDFilePath failed. ' + err);
                process.exit(1);
            }
            resolve(data);
        });
    })
};

doInstrument = instrumentFilePath => {
    return new Promise((resolve, reject) => {
        fs.readFile(instrumentFilePath, 'utf8', (err, data) => {
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
    let foundAttachment = _.find(attachments, a => a.filename === variableFieldName);
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
        if (_.isEmpty(diff)) {
            await existingCde.save();
        } else {
            await MergeCDE.mergeCde(existingCde, newCde);
            await mongo_cde.updatePromise(existingCde, batchloader);
        }
    }
    let question = await RedCapCdeToQuestion.convert(redCapCde, redCapCdes, existingCde, newForm);
    return question;
}

exports.parseFormElements = async (protocol, attachments, newForm) => {
    let formElements = [];
    let protocolId = protocol.protocolId;

    let zipFolder = redCapZipFolder + 'PX' + protocolId;

    let formId = '';
    let instrumentIDFileName = 'instrumentID.txt';
    let instrumentIDFilePath = zipFolder + '/' + instrumentIDFileName;
    let instrumentIDFileExist = fs.existsSync(instrumentIDFilePath);
    if (instrumentIDFileExist) {
        formId = await doInstrumentID(instrumentIDFilePath);
    }

    let authorId = '';
    let authorIdFileName = 'AuthorID.txt';
    let authorIdFilePath = zipFolder + '/' + authorIdFileName;
    let authorIdFileExist = fs.existsSync(authorIdFilePath);
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
    let instrumentFileExist = fs.existsSync(instrumentFilePath);
    if (instrumentFileExist) {
        redCapCdes = await doInstrument(instrumentFilePath);
    }

    let newSection = true;
    let fe;
    let index = 0;
    for (let redCapCde of redCapCdes) {
        index++;
        let fieldType = redCapCde['Field Type'];
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
            let question = await doQuestion(redCapCde, redCapCdes, formId, protocol, newForm);
            fe.formElements.push(question);
        }
    }
    newForm.formElements = formElements;
};
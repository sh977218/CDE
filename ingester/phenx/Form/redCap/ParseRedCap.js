const _ = require('lodash');
const AdmZip = require('adm-zip');
const csvParser = require('csv-parse');

const mongo_cde = require('../../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const CreateCDE = require('./CreateCDE');
const CompareCDE = require('../../CDE/CompareCDE');
const MergeCDE = require('../../CDE/MergeCDE');

const RedCapCdeToQuestion = require('./RedCapCdeToQuestion');

const updatedByLoader = require('../../../shared/updatedByLoader').updatedByLoader;
const batchloader = require('../../../shared/updatedByLoader').batchloader;


const zipFolder = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content/redcap_zip/';

doInstrument = data => {
    return new Promise((resolve, reject) => {

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
                if (record && record.fieldType !== 'descriptive') {
                    records.push(record);
                }
            })
            .on('end', function () {
                resolve(records);
            })
    })
};
exports.parseFormElements = async protocol => {
    let formElements = [{
        elementType: "section",
        label: '',
        instructions: {value: '', valueFormat: ''},
        skipLogic: {condition: ''},
        formElements: []
    }];
    let protocolId = protocol.protocolId;
    let zipFile = 'PX' + protocolId + '.zip';
    let zip = new AdmZip(zipFolder + zipFile);
    let zipEntries = zip.getEntries();
    let redCapCdes = [];
    let formId;
    let authorId;
    for (let zipEntry of zipEntries) {
        let entryName = zipEntry.entryName;
        if (entryName == 'instrument.csv') {
            let data = zipEntry.getData();
            redCapCdes = await doInstrument(data);
        }
        if (entryName == 'InstrumentID.txt') {
            formId = zipEntry.getData().toString('utf8');
        }
        if (entryName == 'AuthorID.txt') {
            authorId = zipEntry.getData().toString('utf8');
        }
    }

    for (let redCapCde of redCapCdes) {
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
        let question = await RedCapCdeToQuestion.convert(redCapCde, redCapCdes, existingCde);
        formElements[0].formElements.push(question);
    }

    return formElements;
};
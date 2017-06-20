let async = require('async');
let csv = require('csv');
let fs = require('fs');
let capitalize = require('capitalize');

let mongo_data = require('../../modules/system/node-js/mongo-data');
let mongo_cde = require('../../modules/cde/node-js/mongo-cde');
let DataElementModel = mongo_cde.DataElement;
let mongo_form = require('../../modules/form/node-js/mongo-form');
let FormModel = mongo_form.Form;

let MigrationProtocolModel = require('../createMigrationConnection').MigrationProtocolModel;
let ProtocolToForm = require('./Website/ProtocolToForm');
let BranchLogicUtility = require('./BranchLogicUtility');

let updateShare = require('../updateShare');

let protocolCount = 0;

let importDate = new Date().toJSON();
let source = 'PhenX';

let ZIP_BASE_PATH = require('../createMigrationConnection').PHENX_ZIP_BASE_FOLDER;

function findInstrument(formId) {
    let instrumentPath = ZIP_BASE_PATH + '/' + formId + '.zip/' + 'instrument.csv';
    if (fs.existsSync(instrumentPath))
        return instrumentPath;
    else {
        instrumentPath = ZIP_BASE_PATH + '/' + formId + '.zip/' + formId + '/instrument.csv';
        if (fs.existsSync(instrumentPath))
            return instrumentPath;
        else return null;
    }
}

function doCSV(filePath, form, formId, doneCsv) {
    let skipLogicMap = {};
    let name = {};
    if (!filePath) {
        doneCsv();
    } else if (fs.existsSync(filePath)) {
        form.changeNote = 'Load from REDCap';
        let option = {columns: true, relax_column_count: true};
        let input = fs.readFileSync(filePath);
        csv.parse(input, option, function (err, rows) {
            let newSection = true;
            let formElement;
            let index = 0;
            async.forEachSeries(rows, (row, doneOneRow) => {
                index++;
                let fieldType = row['Field Type'].trim();
                let fieldLabel = row['Field Label'].trim();
                let variableName = row['Variable / Field Name'].trim();
                if (fieldType === 'descriptive') {
                    let attachmentPath = ZIP_BASE_PATH + '/' + formId + '.zip/attachments/' + variableName;
                    let attachmentExist = fs.existsSync(attachmentPath);
                    if (newSection) {
                        form.formElements.push({
                            elementType: "section",
                            label: '',
                            instructions: {value: '', valueFormat: 'html'},
                            skipLogic: {condition: ''},
                            formElements: []
                        });
                        formElement = form.formElements[form.formElements.length - 1];
                        newSection = false;
                        if (attachmentExist) {
                            let allAttachmentFiles = fs.readdirSync(attachmentPath).filter((f) => {
                                return f.indexOf('Thumbs.db') === -1;
                            });
                            async.forEachSeries(allAttachmentFiles, (attachmentFile, doneOneAttachmentFile) => {
                                let attachmentStream = fs.createReadStream(attachmentPath + '/' + attachmentFile);
                                let fileType = attachmentFile.split('.').pop();
                                let fileSize = fs.statSync(attachmentPath + '/' + attachmentFile).size;
                                mongo_data.addAttachment({
                                    originalname: attachmentFile,
                                    mimetype: "image/" + fileType,
                                    size: fileSize,
                                    stream: attachmentStream
                                }, {
                                    username: 'batchloader',
                                    roles: ["AttachmentReviewer"]
                                }, variableName, form, (attachment) => {
                                    formElement.instructions.value += '\n<figure><figcaption>' + fieldLabel + '</figcaption><img src="/data/' + attachment.fileid + '"/></figure>';
                                    doneOneAttachmentFile();
                                });
                            }, () => {
                                doneOneRow();
                            });
                        } else {
                            doneOneRow();
                        }
                    } else {
                        formElement = form.formElements[form.formElements.length - 1];
                        if (attachmentExist) {
                            let allAttachmentFiles = fs.readdirSync(attachmentPath).filter((f) => {
                                return f.indexOf('Thumbs.db') === -1;
                            });
                            async.forEachSeries(allAttachmentFiles, (attachmentFile, doneOneAttachmentFile) => {
                                let attachmentStream = fs.createReadStream(attachmentPath + '/' + attachmentFile);
                                let fileType = attachmentFile.split('.').pop();
                                let fileSize = fs.statSync(attachmentPath + '/' + attachmentFile).size;
                                mongo_data.addAttachment({
                                    originalname: attachmentFile,
                                    mimetype: "image/" + fileType,
                                    size: fileSize,
                                    stream: attachmentStream
                                }, {
                                    username: 'batchloader',
                                    roles: ["AttachmentReviewer"]
                                }, variableName, form, (attachment) => {
                                    formElement.instructions.value += '\n<figure><figcaption>' + fieldLabel + '</figcaption><img src="/data/' + attachment.fileid + '"/></figure>';
                                    doneOneAttachmentFile();
                                });
                            }, () => {
                                newSection = false;
                                doneOneRow();
                            });
                        } else {
                            doneOneRow();
                        }
                    }
                } else {
                    if (index === 1)
                        form.formElements.push({
                            elementType: "section",
                            label: '',
                            instructions: {value: '', valueFormat: 'html'},
                            skipLogic: {condition: ''},
                            formElements: []
                        });
                    newSection = true;
                    formElement = form.formElements[form.formElements.length - 1];
                    let formattedFieldLabel = fieldLabel.replace(/"/g, "'").trim();
                    if (formattedFieldLabel.length === 0) {
                        formattedFieldLabel = capitalize.words(variableName.replace(/_/g, ' '));
                    }
                    skipLogicMap[variableName] = formattedFieldLabel;
                    let formName = capitalize.words(row['Form Name'].replace(/_/g, ' '));
                    if (name.designation && name.designation !== formName) {
                        console.log('Form Name not match.');
                        console.log('Form Name: ' + row['Form Name']);
                        console.log('name.designation: ' + name.designation);
                        process.exit(1);
                    } else {
                        name.designation = formName;
                    }
                    let query = {'ids.id': formId + '_' + variableName};
                    DataElementModel.find(query).exec((error, cdes) => {
                        if (error) throw error;
                        else if (cdes.length === 1) {
                            let question = BranchLogicUtility.convertCdeToQuestion(row, skipLogicMap, cdes[0]);
                            if (question === null) {
                                console.log('filePath ' + filePath);
                                process.exit(1);
                            }
                            formElement.formElements.push(question);
                            doneOneRow();
                        } else {
                            console.log('found ' + cdes.length + ' cde: ');
                            console.log(row);
                            console.log(formId);
                            process.exit(1);
                        }
                    });
                }
            }, () => {
                if (name.designation && name.designation.length > 0)
                    form.naming.push(name);
                form.markModified('formElements');
                if (form.displayProfiles.length === 0)
                    form.displayProfiles.push({
                        name: 'default',
                        sectionsAsMatrix: true,
                        displayValues: false,
                        displayInstructions: true,
                        displayType: 'Follow-up'
                    });
                else form.displayProfiles.forEach((d) => {
                    d.displayInstructions = true;
                    d.displayType = 'Follow-up';
                });
                doneCsv();
            });
        });
    } else doneCsv();
}

let migrationCon = {};
let stream = MigrationProtocolModel.find(migrationCon).stream();
stream.on('data', (protocol) => {
    stream.pause();
    protocolCount++;
    if (protocol.toObject) protocol = protocol.toObject();
    let formId = 'PX' + protocol['protocolId'];
    let form = ProtocolToForm.protocolToForm(protocol);
    let instrumentPath = findInstrument(formId);
    let formCond = {
        archived: false,
        "registrationState.registrationStatus": {$not: /Retired/},
        created: {$ne: importDate}
    };
    FormModel.find(formCond).where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(protocol['protocolId']);
    }).exec((err, existingForms) => {
        if (err) throw err;
        else if (existingForms.length === 0) {
            let createForm = new FormModel(form);
            createForm.imported = importDate;
            createForm.created = importDate;
            createForm.save(function (err, thisForm) {
                if (err) throw "Unable to create Form." + form;
                else doCSV(instrumentPath, thisForm, formId, function () {
                    thisForm.properties = form.properties.filter((p) => {
                        return p.key !== 'LOINC Fields';
                    });
                    thisForm.markModified('properties');
                    thisForm.save(() => {
                        console.log('protocolCount: ' + protocolCount);
                        stream.resume();
                    });
                });
            });
        } else if (existingForms.length === 1) {
            let existingForm = existingForms[0].toObject();
            let deepDiff = updateShare.compareObjects(existingForm, form);
            if (!deepDiff || deepDiff.length === 0) {
                stream.resume();
            } else {
                existingForm.naming = form.naming;
                existingForm.sources = form.sources;
                existingForm.version = form.version;
                existingForm.changeNote = "Bulk update from source";
                existingForm.imported = importDate;
                existingForm.referenceDocuments = form.referenceDocuments;
                existingForm.formElements = form.formElements;
                existingForm.properties = form.properties;
                existingForm.ids = existingForm.ids.filter((i) => {
                    return i.source !== 'LOINC';
                });
                existingForm.registrationState.registrationStatus = 'Candidate';
                updateShare.removeClassificationTree(existingForm, 'PhenX');
                if (form.classification[0])
                    existingForm.classification.push(form.classification[0]);
                mongo_form.update(existingForm, {username: "batchloader"}, function (err, thisForm) {
                    if (err)throw err;
                    else doCSV(instrumentPath, thisForm, formId, function () {
                        thisForm.properties = form.properties.filter((p) => {
                            return p.key !== 'LOINC Fields';
                        });
                        thisForm.markModified('properties');
                        thisForm.save(() => {
                            console.log('protocolCount: ' + protocolCount);
                            stream.resume();
                        });
                    });
                });
            }
        } else throw existingForms.length + ' forms with id ' + formId;
    });
});

stream.on('error', (err) => {
    if (err)throw err;
});

stream.on('end', () => {
    console.log('end stream');
    console.log('protocolCount: ' + protocolCount);
    FormModel.update({
        imported: {$ne: new Date().toJSON()},
        'source.sourceName': 'PhenX'
    }, {
        "registrationState.registrationStatus": "Retired",
        "registrationState.administrativeNote": "Not present in import from " + importDate
    }, e => {
        if (e) throw e;
        else process.exit(1);
    });
});
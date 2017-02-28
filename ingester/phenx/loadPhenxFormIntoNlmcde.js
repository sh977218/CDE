var async = require('async');
var csv = require('csv');
var fs = require('fs');
var capitalize = require('capitalize');

var mongo_data = require('../../modules/system/node-js/mongo-data');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var DataElementModel = mongo_cde.DataElement;
var mongo_form = require('../../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

var MigrationProtocolModel = require('../createMigrationConnection').MigrationProtocolModel;
var ProtocolToForm = require('./Website/ProtocolToForm');
var BranchLogicUtility = require('./BranchLogicUtility');

var updateShare = require('../updateShare');


var protocolCount = 0;

var today = new Date().toJSON();
var source = 'PhenX';

var ZIP_BASE_PATH = require('../createMigrationConnection').PHENX_ZIP_BASE_FOLDER;

function findInstrument(formId) {
    var instrumentPath = ZIP_BASE_PATH + '/' + formId + '.zip/' + 'instrument.csv';
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
    var skipLogicMap = {};
    var name = {};
    if (!filePath) {
        doneCsv();
    } else if (fs.existsSync(filePath)) {
        form.changeNote = 'Load from REDCap';
        var option = {columns: true, relax_column_count: true};
        var input = fs.readFileSync(filePath);
        csv.parse(input, option, function (err, rows) {
            var newSection = true;
            var formElement;
            var index = 0;
            async.forEachSeries(rows, (row, doneOneRow)=> {
                index++;
                var fieldType = row['Field Type'].trim();
                var fieldLabel = row['Field Label'].trim();
                var variableName = row['Variable / Field Name'].trim();
                if (fieldType === 'descriptive') {
                    var attachmentPath = ZIP_BASE_PATH + '/' + formId + '.zip/attachments/' + variableName;
                    var attachmentExist = fs.existsSync(attachmentPath);
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
                            var allAttachmentFiles = fs.readdirSync(attachmentPath).filter((f)=> {
                                return f.indexOf('Thumbs.db') === -1;
                            });
                            async.forEachSeries(allAttachmentFiles, (attachmentFile, doneOneAttachmentFile)=> {
                                var attachmentStream = fs.createReadStream(attachmentPath + '/' + attachmentFile);
                                var fileType = attachmentFile.split('.').pop();
                                var fileSize = fs.statSync(attachmentPath + '/' + attachmentFile).size;
                                mongo_data.addAttachment({
                                    originalname: attachmentFile,
                                    mimetype: "image/" + fileType,
                                    size: fileSize,
                                    stream: attachmentStream
                                }, {
                                    username: 'batchloader',
                                    roles: ["AttachmentReviewer"]
                                }, variableName, form, (attachment, newFileCreated, err)=> {
                                    formElement.instructions.value += '\n<figure><figcaption>' + fieldLabel + '</figcaption><img src="/data/' + attachment.fileid + '"/></figure>';
                                    doneOneAttachmentFile();
                                });
                            }, ()=> {
                                doneOneRow()
                            });
                        } else {
                            doneOneRow();
                        }
                    } else {
                        formElement = form.formElements[form.formElements.length - 1];
                        if (attachmentExist) {
                            var allAttachmentFiles = fs.readdirSync(attachmentPath).filter((f)=> {
                                return f.indexOf('Thumbs.db') === -1;
                            });
                            async.forEachSeries(allAttachmentFiles, (attachmentFile, doneOneAttachmentFile)=> {
                                var attachmentStream = fs.createReadStream(attachmentPath + '/' + attachmentFile);
                                var fileType = attachmentFile.split('.').pop();
                                var fileSize = fs.statSync(attachmentPath + '/' + attachmentFile).size;
                                mongo_data.addAttachment({
                                    originalname: attachmentFile,
                                    mimetype: "image/" + fileType,
                                    size: fileSize,
                                    stream: attachmentStream
                                }, {
                                    username: 'batchloader',
                                    roles: ["AttachmentReviewer"]
                                }, variableName, form, (attachment, newFileCreated, err)=> {
                                    formElement.instructions.value += '\n<figure><figcaption>' + fieldLabel + '</figcaption><img src="/data/' + attachment.fileid + '"/></figure>';
                                    doneOneAttachmentFile();
                                });
                            }, ()=> {
                                newSection = false;
                                doneOneRow()
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
                    var formattedFieldLabel = fieldLabel.replace(/"/g, "'").trim();
                    if (formattedFieldLabel.length === 0) {
                        formattedFieldLabel = capitalize.words(variableName.replace(/_/g, ' '))
                    }
                    var branchLogic = row['Branching Logic (Show field only if...)'];
                    if (branchLogic && branchLogic.trim().indexOf('(') > -1) {
                        //form.properties.push({key: 'Unsolved branchLogic', value: branchLogic});
                    }
                    skipLogicMap[variableName] = formattedFieldLabel;
                    var formName = capitalize.words(row['Form Name'].replace(/_/g, ' '));
                    if (name.designation && name.designation !== formName) {
                        console.log('Form Name not match.');
                        console.log('Form Name: ' + row['Form Name']);
                        console.log('name.designation: ' + name.designation);
                        process.exit(1);
                    } else {
                        name.designation = formName;
                    }
                    var query = {'ids.id': formId + '_' + variableName};
                    DataElementModel.find(query).exec((error, cdes)=> {
                        if (error) throw error;
                        else if (cdes.length === 1) {
                            var question = BranchLogicUtility.convertCdeToQuestion(row, skipLogicMap, cdes[0]);
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
                    })
                }
            }, ()=> {
                if (name.designation && name.designation.length > 0)
                    form.naming.push(name);
                form.markModified('formElements');
                if (form.displayProfiles.length === 0)
                    form.displayProfiles.push({
                        name: 'default',
                        sectionsAsMatrix: true,
                        displayValues: true,
                        displayInstructions: true,
                        displayType: 'Follow-up'
                    });
                else form.displayProfiles.forEach((d)=> {
                    d.displayInstructions = true;
                    d.displayType = 'Follow-up';
                });
                doneCsv();
            })
        });
    } else doneCsv();
}

var migrationCon = {};
var stream = MigrationProtocolModel.find(migrationCon).stream();
stream.on('data', (protocol) => {
    stream.pause();
    protocolCount++;
    if (protocol.toObject) protocol = protocol.toObject();
    var formId = 'PX' + protocol['protocolId'];
    var form = ProtocolToForm.protocolToForm(protocol);
    var instrumentPath = findInstrument(formId);
    var formCond = {
        archived: null,
        "registrationState.registrationStatus": {$not: /Retired/},
        created: {$ne: today}
    };
    FormModel.find(formCond).where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(protocol['protocolId']);
    }).exec((err, existingForms)=> {
        if (err) throw err;
        else if (existingForms.length === 0) {
            var createForm = new FormModel(form);
            createForm.imported = today;
            createForm.created = today;
            createForm.save(function (err, thisForm) {
                if (err) throw "Unable to create Form." + form;
                else doCSV(instrumentPath, thisForm, formId, function () {
                    thisForm.properties = form.properties.filter((p)=> {
                        return p.key !== 'LOINC Fields';
                    });
                    thisForm.markModified('properties');
                    thisForm.save(()=> {
                        console.log('protocolCount: ' + protocolCount);
                        stream.resume();
                    });
                });
            });
        } else if (existingForms.length === 1) {
            var existingForm = existingForms[0].toObject();
            var deepDiff = updateShare.compareObjects(existingForm, form);
            if (!deepDiff || deepDiff.length === 0) {
                stream.resume();
            } else {
                existingForm.naming = form.naming;
                existingForm.sources = form.sources;
                existingForm.version = form.version;
                existingForm.changeNote = "Bulk update from source";
                existingForm.imported = today;
                existingForm.referenceDocuments = form.referenceDocuments;
                existingForm.formElements = form.formElements;
                existingForm.properties = form.properties;
                existingForm.ids = existingForm.ids.filter((i)=> {
                    return i.source !== 'LOINC';
                });
                updateShare.removeClassificationTree(existingForm, 'PhenX');
                if (form.classification[0])
                    existingForm.classification.push(form.classification[0]);
                mongo_form.update(existingForm, {username: "batchloader"}, function (err, thisForm) {
                    if (err)throw err;
                    else doCSV(instrumentPath, thisForm, formId, function () {
                        thisForm.properties = form.properties.filter((p)=> {
                            return p.key !== 'LOINC Fields';
                        });
                        thisForm.markModified('properties');
                        thisForm.save(()=> {
                            console.log('protocolCount: ' + protocolCount);
                            stream.resume();
                        });
                    });
                });
            }
        } else throw existingForms.length + ' forms with id ' + formId;
    });
});

stream.on('error', (err)=> {
    if (err)throw err;
});

stream.on('end', ()=> {
    console.log('end stream');
    console.log('protocolCount: ' + protocolCount);
    FormModel.update({
        imported: {$ne: new Date().toJSON()},
        'source.sourceName': 'PhenX'
    }, {
        "registrationState.registrationStatus": "Retired",
        "registrationState.administrativeNote": "Not present in import from " + importDate
    }, (e)=> {
        if (e) throw e;
        else {
            process.exit(1);
        }
    });
});
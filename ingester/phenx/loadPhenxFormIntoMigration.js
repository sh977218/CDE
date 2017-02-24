var async = require('async');
var csv = require('csv');
var fs = require('fs');

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
        var option = {columns: true, relax_column_count: true};
        var input = fs.readFileSync(filePath);
        csv.parse(input, option, function (err, rows) {
            var newSection = true;
            var formElement;
            async.forEachSeries(rows, (row, doneOneRow)=> {
                var fieldType = row['Field Type'].trim();
                var fieldLabel = row['Field Label'].trim();
                if (fieldType === 'descriptive') {
                    var variableName = row['Variable / Field Name'];
                    var attachmentPath = ZIP_BASE_PATH + '/' + formId + '.zip/attachments/' + variableName;
                    var attachmentExist = fs.existsSync(attachmentPath);
                    if (newSection) {
                        form.formElements.push({
                            elementType: "section",
                            label: variableName,
                            instructions: {value: fieldLabel, valueFormat: 'html'},
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
                                    formElement.instructions.value += '\n<img src="/data/' + attachment.fileid + '"/>';
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
                        formElement.instructions.value += row['Field Label'];
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
                                    formElement.instructions.value += '\n<img src="/data/' + attachment.fileid + '"/>';
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
                    newSection = true;
                    formElement = form.formElements[form.formElements.length - 1];
                    var formattedFieldLabel = row['Field Label'].replace(/"/g, "'").trim();
                    var branchLogic = row['Branching Logic (Show field only if...)'];
                    if (branchLogic && branchLogic.trim().indexOf('(') > -1) {
                        form.properties.push({key: 'Unsolved branchLogic', value: branchLogic})
                    }
                    skipLogicMap[row['Variable / Field Name'].trim()] = formattedFieldLabel;
                    if (name.designation && name.designation !== row['Form Name']) {
                        console.log('Form Name not match.');
                        console.log('Form Name: ' + row['Form Name']);
                        console.log('name.designation: ' + name.designation);
                        process.exit(1);
                    } else {
                        name.designation = row['Form Name'];
                    }
                    var variableName = row['Variable / Field Name'];
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
                            console.log(data);
                            console.log(formId);
                            process.exit(1);
                        }
                    })
                }
            }, ()=> {
                form.naming.push(name);
                doneCsv();
            })
        });
    } else doneCsv();
}

//var migrationCon = {protocolId: '020303'};
//var migrationCon = {protocolId: '011402'};
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
        elem.where("id").equals(formId);
    }).exec((err, existingForms)=> {
        if (err) throw err;
        else if (existingForms.length === 0) {
            var createForm = new FormModel(form);
            createForm.imported = today;
            createForm.created = today;
            createForm.save(function (err, thisForm) {
                if (err) throw "Unable to create Form." + form;
                else doCSV(instrumentPath, thisForm, formId, function () {
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
                updateShare.removeClassificationTree(existingForm, 'PhenX');
                if (form.classification[0])
                    existingForm.classification.push(form.classification[0]);
                mongo_form.update(existingForm, {username: "batchloader"}, function (err, thisForm) {
                    if (err)throw err;
                    else doCSV(instrumentPath, thisForm, formId, function () {
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
    process.exit(1);
});
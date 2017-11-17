var async = require('async');
var REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
var MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;
var CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;

var DataElementModel = require('../../createNlmcdeConnection').DataElementModel;
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;

var updateShare = require('../../updateShare');
var classificationShared = require('@std/esm')(module)('../../../modules/system/shared/classificationShared');
var mongo_form = require('../../../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;
var CreateElt = require('../Shared/CreateElt');

var importDate = new Date().toJSON();


var formCount = 0;

exports.createForm = function (loinc, org, orgInfo, cb) {
    FormModel.find({
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {source: 'LOINC', id: loinc['loincId']}).exec(function (err, existingForms) {
        if (err) throw err;
        if (existingForms.length === 0) {
            console.log('Creating form id: ' + loinc['loincId']);
            CreateElt.createElt(loinc, org, orgInfo, function (newForm) {
                newForm.formElements = [{
                    elementType: 'section',
                    label: '',
                    instructions: {
                        value: ""
                    },
                    formElements: []
                }];
                var elementCount = 0;
                var elements = loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'];
                console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
                async.forEachSeries(elements, function (element, doneOneElement) {
                    exports.loadElement(element, newForm.formElements[0].formElements, org, orgInfo, function () {
                        elementCount++;
                        console.log('elementCount: ' + elementCount);
                        doneOneElement();
                    });
                }, function doneAllElements() {
                    cb(newForm, formCount);
                })
            });
        } else if (existingForms.length === 1) {
            var existingForm = existingForms[0];
            CreateElt.createElt(loinc, org, orgInfo, function (newForm) {
                newForm.formElements = [{
                    elementType: 'section',
                    label: '',
                    instructions: {
                        value: ""
                    },
                    formElements: []
                }];
                var elementCount = 0;
                var elements = loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'];
                console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
                async.forEachSeries(elements, function (element, doneOneElement) {
                    exports.loadElement(element, newForm.formElements[0].formElements, org, orgInfo, function () {
                        elementCount++;
                        console.log('elementCount: ' + elementCount);
                        doneOneElement();
                    });
                }, function doneAllElements() {
                    processForm(newForm, existingForm, orgInfo['orgName'], function (o) {
                        cb(o, formCount);
                    })
                })
            });
        } else {
            console.log('Found more than one this form with loincId: ' + element['LOINC#']);
            process.exit(1);
        }
    });
};


exports.loadElement = function (element, fe, org, orgInfo, next) {
    if (element.elements.length === 0) {
        exports.loadCde(element, fe, next);
    } else {
        exports.loadForm(element, fe, org, orgInfo, next);
    }
};

exports.loadCde = function (element, fe, next) {
    DataElementModel.find({
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {source: 'LOINC', id: element['LOINC#']}).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes.length === 0) {
            console.log('cannot find this cde with loincId: ' + element['LOINC#']);
            process.exit(1);
        } else {
            var existingCde = existingCdes[0];
            var question = {
                instructions: {value: ''},
                cde: {
                    tinyId: existingCde.tinyId,
                    name: existingCde.naming[0].designation,
                    version: existingCde.version,
                    permissibleValues: existingCde.valueDomain.permissibleValues,
                    ids: existingCde.ids
                },
                required: REQUIRED_MAP[element['ANSWER CARDINALITY']],
                multiselect: MULTISELECT_MAP[element['ANSWER CARDINALITY']],
                datatype: existingCde.valueDomain.datatype,
                datatypeNumber: existingCde.valueDomain.datatypeNumber,
                datatypeText: existingCde.valueDomain.datatypeText,
                answers: existingCde.valueDomain.permissibleValues,
                uoms: []
            };
            if (question.datatype === 'Text') {
                question.multiselect = false;
            }
            if (element['Ex UCUM Units']) {
                question.uoms.push(element['Ex UCUM Units']);
            }
            var formElement = {
                elementType: 'question',
                instructions: {},
                cardinality: CARDINALITY_MAP[element['Cardinality']],
                label: element['LOINC Name'],
                question: question,
                formElements: []
            };
            var existingQuestionText = false;
            existingCde.naming.forEach(function (n) {
                if (n.context.contextName === "TERM DEFINITION/DESCRIPTION(S)") {
                    formElement.instructions.value = n.definition;
                }
                if (n.context.contextName === 'Question Text') {
                    existingQuestionText = true;
                }
            });
            if (!existingQuestionText) {
                existingCde.naming.push({
                    designation: element['LOINC Name'],
                    definition: '',
                    languageCode: 'EN-US',
                    context: {
                        contextName: 'Question Text',
                        acceptability: 'preferred'
                    },
                    source: 'LOINC'
                });
                existingCde.markModified('naming');
                existingCde.save(function (err) {
                    console.log('Add question text to cde ' + element['LOINC#']);
                    fe.push(formElement);
                    next();
                })
            } else {
                fe.push(formElement);
                next();
            }
        }
    });
};

exports.loadForm = function (element, fe, org, orgInfo, next) {
    FormModel.find({
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {source: 'LOINC', id: element['LOINC#']}).exec(function (err, existingForms) {
        if (err) throw err;
        if (existingForms.length === 0) {
            MigrationLoincModel.find({loincId: element['LOINC#']}).exec(function (findFormError, loincs) {
                if (findFormError) throw findFormError;
                if (loincs.length === 1) {
                    var loinc = loincs[0].toObject();
                    if (loinc.dependentSection) {
                        var formElement = {
                            elementType: 'section',
                            instructions: {value: '', valueFormat: ''},
                            cardinality: CARDINALITY_MAP[element['Cardinality']],
                            label: element['LOINC Name'].replace('[AHRQ]', '').trim(),
                            section: {},
                            formElements: []
                        };
                        async.forEachSeries(loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'], function (e, doneOneE) {
                            exports.loadCde(e, formElement.formElements, function () {
                                doneOneE();
                            })
                        }, function doneAllE() {
                            fe.push(formElement);
                            next();
                        });
                    } else {
                        exports.createForm(loinc, org, orgInfo, function (newForm, formCount) {
                            exports.saveObj(newForm, function (o) {
                                console.log('Finished process form : ' + o.get('ids')[0].id);
                                console.log('Form count: ' + formCount);
                                fe.push({
                                    elementType: 'form',
                                    instructions: {value: '', valueFormat: ''},
                                    cardinality: CARDINALITY_MAP[element['Cardinality']],
                                    label: element['LOINC Name'].replace('[AHRQ]', '').trim(),
                                    inForm: {
                                        form: {
                                            tinyId: newForm.tinyId,
                                            version: newForm.version,
                                            name: newForm.naming[0].designation
                                        }
                                    }
                                });
                                next();
                            });
                        })
                    }
                } else {
                    console.log('Find ' + loinc.length + ' loinc with loinc id: ' + element['LOINC#']);
                    process.exit(1);
                }
            })
        } else if (existingForms.length === 1) {
            var existingForm = existingForms[0];
            if (existingForm.dependentSection) {
                var formElement = {
                    elementType: 'section',
                    instructions: {value: '', valueFormat: ''},
                    cardinality: CARDINALITY_MAP[element['Cardinality']],
                    label: element['LOINC Name'].replace('[AHRQ]', '').trim(),
                    section: {},
                    formElements: []
                };
                async.forEachSeries(existingForm['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'], function (e, doneOneE) {
                    exports.loadCde(e, formElement.formElements, function () {
                        doneOneE();
                    })
                }, function doneAllE() {
                    fe.push(formElement);
                    next();
                });
            } else {
                var inForm = {
                    form: {
                        tinyId: existingForm.tinyId,
                        version: existingForm.version,
                        name: existingForm.naming[0].designation
                    }
                };
                var formElement = {
                    elementType: 'form',
                    instructions: {value: '', valueFormat: ''},
                    cardinality: CARDINALITY_MAP[element['Cardinality']],
                    label: element['LOINC Name'].replace('[AHRQ]', '').trim(),
                    inForm: inForm,
                    formElements: []
                };
                fe.push(formElement);
                next();
            }
        } else {
            console.log('Found more than one this form with loincId: ' + element['LOINC#']);
            process.exit(1);
        }
    });
};

exports.saveObj = function (form, next) {
    var loincId;
    form.ids.forEach(function(i){
        if(i.source==='LOINC') loincId = i.id;
    });
    FormModel.find({'ids.id': loincId}).exec(function (er, existingForms) {
        if(er) throw er;
        if(existingForms.length === 0 ){
            var obj = new FormModel(form);
            obj.save(function(err,o){
                formCount++;
                console.log('Finished process form : ' + o.get('ids')[0].id);
                console.log('Form count: ' + formCount);
                if(err) throw err;
                next(o);
            })
        } else {
            next();
        }
    });
};

function processForm(migrationForm, existingForm, orgName, processFormCb) {
    // deep copy
    var newForm = existingForm.toObject();
    delete newForm._id;

    var deepDiff = updateShare.compareObjects(existingForm, migrationForm);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingForm.imported = importDate;
        existingForm.save(function (err, o) {
            if (err) throw "Unable to update import date";
            migrationForm.remove(function (err) {
                if (err) throw "unable to remove";
                processFormCb(o);
            });
        });
    } else if (deepDiff.length > 0) {
        newForm.naming = migrationForm.naming;
        newForm.version = migrationForm.version;
        newForm.changeNote = "Bulk update from source";
        newForm.imported = importDate;
        newForm.referenceDocuments = migrationForm.referenceDocuments;
        newForm.ids = migrationForm.ids;
        newForm.formElements = migrationForm.formElements;
        updateShare.removeArrayOfSource(newForm.properties, migrationForm.source);
        newForm.properties = newForm.properties.concat(migrationForm.properties);

        updateShare.removeClassificationTree(newForm, orgName);
        if (migrationForm.classification[0]) newForm.classification.push(migrationForm.classification[0]);
        newForm._id = existingForm._id;
        try {
            mongo_form.update(newForm, {username: "BatchLoader"}, function (err, o) {
                if (err) {
                    console.log("Cannot save Form.");
                    console.log(newForm);
                    throw err;
                }
                processFormCb(o);
            });
        } catch (e) {
            console.log("newForm:\n" + newForm);
            console.log("existingForm:\n" + existingForm);
            throw e;
        }

    } else {
        console.log("Something wrong with deepDiff");
        console.log(deepDiff);
    }
}
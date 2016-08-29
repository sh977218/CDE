var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var classificationShared = require('../../modules/system/shared/classificationShared');


function loadFormElements(loinc, formElements, form, cb) {
    var loadCde = function (element, fe, next) {
        mongo_cde.byOtherIdAndNotRetired('LOINC', element['LOINC#'], function (err, existingCde) {
            if (err) throw err;
            if (!existingCde) {
                console.log('cannot find this cde with loincId: ' + element['LOINC#']);
                console.log('formId: ' + form.ids[0].id);
                process.exit(1);
            } else {
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
                if (element['Ex UCUM Units']) {
                    question.uoms.push(element['Ex UCUM Units']);
                }

                existingCde.naming.forEach(function (n) {
                    if (n.context.contextName === "Source: Regenstrief LOINC") {
                        question.instructions.value = n.context.contextName;
                    }
                });
                var formElement = {
                    elementType: 'question',
                    label: existingCde.naming[0].designation,
                    question: question,
                    formElements: []
                };
                fe.push(formElement);
                next();
            }
        });
    };
    var loopFormElements = function (loincElements, fe, next) {
        if (loincElements && loincElements.length > 0) {
            async.forEachSeries(loincElements, function (loincElement, doneOneElement) {
                if (loincElement.elements.length > 0) {
                    MigrationFormModel.find({'ids.id': loincElement['LOINC#']}).exec(function (err, existingForms) {
                        if (err) throw err;
                        if (existingForms.length === 0) {
                            console.log('Wait for inner form ' + loincElement['LOINC#'] + ' to be created.');
                            MigrationLoincModel.find({'loincId': loincElement['LOINC#']}).exec(function (e, innerFormLoincs) {
                                if (e) throw e;
                                else {
                                    var innerFormLoinc = innerFormLoincs[0];
                                    if (innerFormLoinc.toObject) innerFormLoinc = innerFormLoinc.toObject();
                                    var innerForm = createForm(innerFormLoinc);
                                    loadFormElements(innerFormLoinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, innerForm.formElements[0].formElements, form, function () {
                                        var obj = new MigrationFormModel(innerForm);
                                        obj.save(function (e, innerFormObj) {
                                            if (e) throw e;
                                            else {
                                                formCounter++;
                                                console.log('formCounter: ' + formCounter);
                                                var innerFe = {
                                                    elementType: 'form',
                                                    instructions: {value: ''},
                                                    cardinality: CARDINALITY_MAP[loincElement.Cardinality],
                                                    label: loincElement['LOINC Name'],
                                                    formElements: [],
                                                    inForm: {
                                                        form: {
                                                            tinyId: innerFormObj.tinyId,
                                                            version: '2.56',
                                                            name: loincElement['LOINC Name']
                                                        }
                                                    }
                                                };
                                                if (innerFormLoinc['TERM DEFINITION/DESCRIPTION(S)']) {
                                                    innerFe.instructions.value = innerFormLoinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'][0].Description;
                                                }
                                                fe.push(innerFe);
                                                doneOneElement();
                                            }
                                        })
                                    });
                                }
                            });
                        } else if (existingForms.length === 1) {
                            var existingForm = existingForms[0];
                            fe.push({
                                elementType: 'form',
                                instructions: {value: ''},
                                cardinality: CARDINALITY_MAP[loincElement.Cardinality],
                                label: loincElement['LOINC Name'],
                                formElements: [],
                                inForm: {
                                    form: {
                                        tinyId: existingForm.tinyId,
                                        version: existingForm.version,
                                        name: existingForm.naming[0].designation
                                    }
                                }
                            });
                            doneOneElement();
                        } else {
                            console.log('More than 1 existing form found. loinc id: ' + loincElement['LOINC#']);
                            process.exit(1);
                        }
                    });
                } else {
                    loadCde(loincElement, fe, function () {
                        doneOneElement();
                    });
                }
            }, function doneAllElements() {
                next();
            });
        } else {
            loadCde(loincElements, fe, function () {
                next();
            });
        }
    };

    loopFormElements(loinc, formElements, cb);
}

function createForm(loinc) {

    var newForm = {
        tinyId: tinyId,
        version: version,
        createdBy: {username: 'BatchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: source,
        naming: naming,
        ids: ids,
        properties: properties,
        referenceDocuments: referenceDocuments,
        stewardOrg: {name: stewardOrgName},
        classification: [{stewardOrg: {name: stewardOrgName}, elements: []}],
        formElements: [{
            elementType: 'section',
            instructions: {value: ''},
            cardinality: CARDINALITY_MAP[loinc['PANEL HIERARCHY']['PANEL HIERARCHY'].Cardinality],
            label: loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['LOINC Name'],
            formElements: []
        }]
    };
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        newForm.formElements[0].instructions.value = loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'][0].Description;
    }
    var classType = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Class/Type'];
    var classificationType = CLASSIFICATION_TYPE_MAP[classType];
    var classificationToAdd = ['Newborn Screening', 'Classification', classificationType];
    classificationShared.classifyItem(newForm, stewardOrgName, classificationToAdd);
    classificationShared.addCategory({elements: newBornScreeningOrg.classifications}, classificationToAdd);
    return newForm;
}

var async = require('async');
var MigrationNewbornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewbornScreeningCDEModel;
var MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;

var LoadLoincFormIntoMigration = require('../loinc/Format/form/LoadLoincCFormIntoMigration');

var orgName = 'NLM';
var org;
var loincIdArray = [];
var formCount = 0;

function run() {
    async.series([
        function (cb) {
            LoadLoincCdeIntoMigration.setStewardOrg(orgName);
            LoadLoincCdeIntoMigration.setClassificationOrgName('Newborn screening');
            cb(null, 'Finished set parameters');
        },
        function (cb) {
            MigrationFormModel.remove({}, function (removeMigrationFormModelError) {
                if (removeMigrationFormModelError) throw removeMigrationFormModelError;
                console.log('Removed all migration form');
                cb(null, 'Finished removing migration form');
            });
        },
        function (cb) {
            MigrationOrgModel.remove({}, function (removeMigrationOrgError) {
                if (removeMigrationOrgError) throw removeMigrationOrgError;
                console.log('Removed all migration org');
                cb(null, 'Finished removing migration org');
            })
        },
        function (cb) {
            new MigrationOrgModel({name: orgName}).save(function (createMigrationOrgError, o) {
                if (createMigrationOrgError) throw createMigrationOrgError;
                console.log('Created migration org of ' + orgName);
                org = o;
                cb(null, 'Finished creating migration org');
            });
        },
        function (cb) {
            MigrationNewbornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: 'panel'}}).exec(function (findNewbornScreeningFormError, newbornScreeningForms) {
                if (findNewbornScreeningFormError) throw findNewbornScreeningFormError;
                newbornScreeningForms.forEach(function (n) {
                    loincIdArray.push(n.get('LOINC_NUM'));
                });
                cb(null, 'Finished retrieving all newborn screening form id.');
            })
        },
        function (cb) {
            LoadLoincFormIntoMigration.runArray(loincIdArray, org, function (form, next) {
                formCounter++;
                console.log('formCounter: ' + formCounter);
            }, function (results) {

            })

        }
    ], function (err, results) {
        process.exit(0);
    });
}

run();
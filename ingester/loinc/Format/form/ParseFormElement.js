var async = require('async');
var DataElementModel = require('../../../createNlmcdeConnection').DataElementModel;
var MigrationFormModel = require('../../../createNlmcdeConnection').MigrationFormModel;
var MigrationLoincModel = require('../../../createNlmcdeConnection').MigrationLoincModel;
var REQUIRED_MAP = require('../../Mapping/LOINC_REQUIRED_MAP').map;
var MULTISELECT_MAP = require('../../Mapping/LOINC_MULTISELECT_MAP').map;
var CARDINALITY_MAP = require('../../Mapping/LOINC_CARDINALITY_MAP').map;
var CreateForm = require('./CreateForm');

var parseFormElement = function (loinc, formElements, form, cb) {
    var loadCde = function (element, fe, next) {
        DataElementModel.find({
            archived: null,
            "registrationState.registrationStatus": {$ne: "Retired"}
        }).elemMatch("ids", {source: 'LOINC', id: element['LOINC#']}).exec(function (err, existingCde) {
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
                var formElement = {
                    elementType: 'question',
                    label: existingCde.naming[0].designation,
                    question: question,
                    formElements: []
                };

                existingCde.naming.forEach(function (n) {
                    if (n.context.contextName === "TERM DEFINITION/DESCRIPTION(S)") {
                        formElement.instructions.value = n.definition;
                    }
                });

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
                                    var innerForm = CreateForm.createForm(innerFormLoinc);
                                    parseFormElement(innerFormLoinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, innerForm.formElements[0].formElements, form, function () {
                                        var obj = new MigrationFormModel(innerForm);
                                        obj.save(function (e, innerFormObj) {
                                            if (e) throw e;
                                            else {
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

    parseFormElement(loinc, formElements, cb);
};


exports.parseFormElement = parseFormElement;
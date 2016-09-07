var async = require('async');
var MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
var CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;
var ult = require('./formUlt');

exports.parseFormElement = function (loincElements, fe,orgInfo, next) {
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
                                var innerForm = ult.createForm(innerFormLoinc, orgInfo,function () {
                                    exports.parseFormElement(innerFormLoinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, innerForm.formElements[0].formElements,orgInfo, function () {
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
                ult.loadCde(loincElement, fe, function () {
                    doneOneElement();
                });
            }
        }, function doneAllElements() {
            next();
        });
    } else {
        ult.loadCde(loincElements, fe, function () {
            next();
        });
    }
};

const DataElement = require('../../../server/cde/mongo-cde').DataElement;
const REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
const MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;
const CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;

exports.parseFormElements = function (loinc) {
    return new Promise(async (resolve, reject) => {

        let formElements = [];
        let elements = loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'];
        console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
        if (!elements || elements.length === 0) resolve();
        formElements.push({
            elementType: 'section',
            label: '',
            instructions: {
                value: ""
            },
            formElements: []
        });
        for (let element of elements) {
            if (element.elements.length === 0) {
                let formElement = await loadCde().catch(e => {
                    throw e;
                });
                formElements.push(formElement);
            }
            else {
                let formElement = await loadForm().catch(e => {
                    throw e;
                });
                formElements.push(formElement);
            }
        }
    })

};

loadCde = function (element) {
    return new Promise(async (resolve, reject) => {
        let cdeCond = {
            archived: false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };
        let existingCde = await DataElement.findOne(cdeCond)
            .where("ids")
            .elemMatch(function (elem) {
                elem.where("source").equals('LOINC');
                elem.where("id").equals(element['LOINC#']);
            }).exec().catch(e => {
                throw e;
            });
        if (!existingCde) reject(element['LOINC#'] + ' not found.');

        let question = {
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
            unitsOfMeasure: []
        };
        if (question.datatype === 'Text') {
            question.multiselect = false;
        }
        if (element['Ex UCUM Units']) {
            question.unitsOfMeasure.push({system: '', code: element['Ex UCUM Units']});
        }
        let formElement = {
            elementType: 'question',
            instructions: {},
            cardinality: CARDINALITY_MAP[element['Cardinality']],
            label: element['LOINC Name'],
            question: question,
            formElements: []
        };
        resolve(formElement);
    })
};


loadForm = function (element) {
    return new Promise(async (resolve, reject) => {
        let formCond = {
            archived: false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };

        let existingform = await DataElement.findOne(formCond)
            .where("ids")
            .elemMatch(function (elem) {
                elem.where("source").equals('LOINC');
                elem.where("id").equals(element['LOINC#']);
            }).exec().catch(e => {
                throw e;
            });
        if (!existingform) {}

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
    })
};

exports.saveObj = function (form, next) {
    var loincId;
    form.ids.forEach(function (i) {
        if (i.source === 'LOINC') loincId = i.id;
    });
    FormModel.find({'ids.id': loincId}).exec(function (er, existingForms) {
        if (er) throw er;
        if (existingForms.length === 0) {
            var obj = new FormModel(form);
            obj.save(function (err, o) {
                formCount++;
                console.log('Finished process form : ' + o.get('ids')[0].id);
                console.log('Form count: ' + formCount);
                if (err) throw err;
                next(o);
            })
        } else {
            next();
        }
    });
};
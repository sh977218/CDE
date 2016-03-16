var fs = require('fs'),
    async = require('async'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    config = require('../../modules/system/node-js/parseConfig'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    classificationShared = require('../../modules/system/shared/classificationShared.js'),
    schemas = require('../../modules/form/node-js/schemas')
    ;
var mongoMigrationUri = config.mongoMigrationUri;
var migrationConn = mongoose.createConnection(mongoMigrationUri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});

var NindsModel = migrationConn.model('NINDS', new mongoose.Schema({}, {
    strict: false,
    collection: 'ninds'
}));
var FormModel = migrationConn.model('Form', schemas.formSchema);
var globals = {orgName: 'NINDS'};
var nindsCounter = 0;
var stream = NindsModel.find().stream();

var cdeNotFound = [];

function createForm(form) {
    var newForm = {
        stewardOrg: {
            name: globals.orgName
        },
        naming: [{
            designation: form.crfModuleGuideline,
            definition: form.description
        }],
        ids: [{source: 'NINDS', id: form.id, version: form.versionNum}],
        isCopyrighted: form.copyRight,
        referenceDocuments: [{
            title: form.downloadLink ? form.downloadLink.replace('https://commondataelements.ninds.nih.gov/Doc/NOC/', '') : '',
            uri: form.downloadLink ? form.downloadLink : ''
        }],
        registrationState: {
            registrationStatus: 'Qualified'
        },
        formElements: form.cdes.length === 0 ? [] : [{
            elementType: 'section',
            label: '',
            cardinality: '0.1',
            formElements: []
        }],
        classification: [{
            stewardOrg: {name: 'NINDS'},
            elements: [{
                name: 'Disease',
                elements: [{
                    name: form.diseaseName,
                    elements: form.diseaseName === 'Traumatic Brain Injury' ? [{
                        name: form.subDiseaseName,
                        elements: [{
                            name: 'Domain',
                            elements: [{
                                name: form.domainName,
                                elements: [{name: form.subDomainName, elements: []}]
                            }]
                        }]
                    }] : [{
                        name: 'Domain', elements: [{
                            name: form.domainName,
                            elements: [{
                                name: form.subDomainName,
                                elements: []
                            }]
                        }]
                    }]
                }]
            }, {
                name: 'Domain',
                elements: [{
                    name: form.domainName,
                    elements: [{
                        name: form.subDomainName,
                        elements: []
                    }]
                }]
            }]
        }]
    };
    if (newForm.formElements.length > 0) {
        var questions = newForm.formElements[0].formElements;
        async.forEachSeries(form.cdes, function (cde, doneOneCde) {
            var datatypeText = {};
            var datatypeNumber = {};
            if (cde.inputRestrictions === 'Free - Form Entry' && cde.dataType === 'Alphanumeric') {
                datatypeText = {
                    minLength: cde.minValue,
                    maxLength: cde.maxValue
                };
            }
            var pvs = cde.permissibleValue.trim().split(';');
            var pdv = cde.permissibleDescription.trim().split(';');
            var answers = [];
            for (var m = 0; m < pvs.length; m++) {
                if (pvs[m] !== "" && pdv[m] !== "") {
                    var answer = {
                        permissibleValue: pvs[m],
                        valueMeaningName: pdv[m]
                    };
                    answers.push(answer);
                }
            }
            var question =
            {
                "elementType": "question",
                "label": cde.questionText.trim(),
                "formElements": [],
                "question": {
                    cde: {
                        tinyId: "",
                        version: "",
                        permissibleValues: []
                    },
                    datatype: "",
                    datatypeText: datatypeText,
                    uoms: [cde.measurementType],
                    required: {
                        type: false
                    },
                    editable: {
                        type: true
                    },
                    multiselect: cde.inputRestrictions === 'Multiple Pre-Defined Values Selected',
                    answers: answers
                }
            };
            var cdeId = cde.cdeId;
            mongo_cde.byOtherId("NINDS", cdeId, function (err, data) {
                if (err) throw err;
                if (!data || data.length === 0) {
                    cdeNotFound[cdeId] = form.crfModuleGuideline + ' ' + cdeId;
                } else {
                    question.question.cde.tinyId = data.tinyId;
                    question.question.cde.version = data.version;
                    question.question.cde.permissibleValues = data.valueDomain.permissibleValues;
                    question.question.datatype = data.valueDomain.datatype;
                    question.question.cde.datattypeNumber = data.valueDomain.datatypeNumber;
                    if (question.label.length === 0)
                        question.label = data.naming[0].designation;
                    questions.push(question);
                }
                doneOneCde();
            });
        }, function () {
            return newForm;
        });
    }
    else return newForm;
}


stream.on('data', function (data) {
    stream.pause();
    if (data) {
        var nindsForm = data.toObject();
        console.log('load ninds form ' + nindsCounter++);
        var form = createForm(nindsForm);
        FormModel.findOne({'ids.id': form.ids[0].id}).exec(function (err, existingForms) {
                if (err) throw err;
                if (existingForms && existingForms.length === 1) {
                    var existingForm = existingForms[0];
                    classificationShared.transferClassifications(form, existingForm);
                    existingForm.save(function (err) {
                        if (err) throw err;
                        stream.resume();
                    })
                } else if (!existingForms || existingForms.length === 0) {
                    cdeNotFound.push(form.id);
                    var newForm = new FormModel(form);
                    newForm.save(function () {
                        stream.resume();
                    });
                }
                else {
                    console.log(existingForms.length + ' forms found');
                    stream.resume();
                }
            }
        );
    }
});

stream.on('end', function () {
    console.log('finished all form' + formCounter);
    process.exit(0);
});
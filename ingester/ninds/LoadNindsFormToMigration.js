var async = require('async');
var NindsModel = require('./../createMigrationConnection').MigrationNindsModel;
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var mongo_data = require('../../modules/system/node-js/mongo-data');
var MigrationForm = require('./../createMigrationConnection').MigrationFormModel;
var classificationShared = require('../../modules/system/shared/classificationShared');

var importDate = new Date().toJSON();
var count = 0;

function checkExistingNaming(existingNaming, ninds) {
    var crfModuleGuideline = ninds.get('crfModuleGuideline').trim();
    var description = ninds.get('description').trim();
    var existFormName;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation.trim() === crfModuleGuideline && existingName.definition.trim() === description)
            existFormName = true;
    });
    if (!existFormName && crfModuleGuideline.length > 0) {
        var newFormName = {
            designation: crfModuleGuideline,
            definition: description,
            languageCode: "EN-US"
        };
        existingNaming.push(newFormName);
        console.log('added new form name to form id: ' + ninds.get('formId'));
        console.log('new formName: ' + crfModuleGuideline);
        console.log('ninds._id: ' + ninds.id);
    }
}
function checkExistingReferenceDocuments(existingReferenceDocuments, ninds) {
    var downloadLink = ninds.get('downloadLink').trim();
    var existReferenceDocument;
    existingReferenceDocuments.forEach(function (existingReferenceDocument) {
        if (existingReferenceDocument.uri.trim() === downloadLink)
            existReferenceDocument = true;
    });
    if (!existReferenceDocument && downloadLink && downloadLink.length > 0) {
        var newReferenceDocument = {
            uri: (downloadLink.indexOf('http://') !== -1 || downloadLink.indexOf('https://') !== -1) ? downloadLink : ''
        };
        existingReferenceDocuments.push(newReferenceDocument);
        console.log('added new reference document: ' + ninds.get('formId'));
        console.log('newCde reference: ' + downloadLink);
        console.log('ninds._id: ' + ninds.id);
    }
}
function mergeIntoForm(ninds, existingForm) {
    // merges naming
    var existingNaming = existingForm.get('naming');
    checkExistingNaming(existingNaming, ninds);

    // merges reference documents
    var existingReferenceDocuments = existingForm.get('referenceDocuments');
    checkExistingReferenceDocuments(existingReferenceDocuments, ninds);

    existingForm.updated = importDate;
    classificationShared.transferClassifications(createForm(ninds), existingForm);
}

function createForm(ninds) {
    var formId = ninds.get('formId');
    var naming = [];
    var formName = {
        designation: ninds.get('crfModuleGuideline').trim(), definition: ninds.get('description').trim(),
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        },
        source: 'NINDS'
    };
    naming.push(formName);

    var sources = [];
    sources.push({
        sourceName: 'NINDS',
        updated: ninds.get('versionDate')
    });

    var ids = [];
    var crfId = {
        source: 'NINDS',
        id: formId,
        'version': ninds.get('versionNum').length > 0 ? Number(ninds.get('versionNum')).toString() : ''
    };
    if (formId && formId.length > 0)
        ids.push(crfId);

    var referenceDocuments = [];
    var referenceDocument = {
        uri: (ninds.get('downloadLink').indexOf('http://') !== -1 || ninds.get('downloadLink').indexOf('https://') !== -1) ? ninds.get('downloadLink') : '',
        source: 'NINDS'
    };
    if (referenceDocument.uri.length > 0) {
        referenceDocuments.push(referenceDocument);
    }

    var domainSubDomain = {
        "name": "Domain",
        elements: [{
            "name": ninds.get('domainName'),
            "elements": []
        }]
    };

    if (ninds.get('domainName') !== ninds.get('subDomainName')) {
        domainSubDomain.elements[0].elements.push({
            "name": ninds.get('subDomainName'),
            "elements": []
        });
    }

    var elements = [];
    var diseaseElement;
    if (ninds.get('diseaseName') === 'Traumatic Brain Injury') {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                "name": ninds.get('diseaseName'),
                "elements": [{
                    "name": ninds.get('subDiseaseName'),
                    "elements": [{
                        "name": 'Domain',
                        "elements": [domainSubDomain]
                    }]
                }]
            }]
        };
    } else {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                "name": ninds.get('diseaseName'),
                "elements": [domainSubDomain]
            }]
        };
    }
    elements.push(domainSubDomain);
    elements.push(diseaseElement);
    var classification = [{stewardOrg: {name: 'NINDS'}, elements: elements}];
    return {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: 'batchloader'},
        sources: sources,
        created: importDate,
        imported: importDate,
        isCopyrighted: ninds.get('copyright'),
        noRenderAllowed: ninds.get('copyright'),
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: classification,
        formElements: []
    };
}
function run() {
    async.series([
        function (cb) {
            MigrationForm.remove({}, function (err) {
                if (err) throw err;
                console.log("Migration Form removed.");
                cb();
            });
        },
        function (cb) {
            let stream = NindsModel.find({}).stream();
            stream.on('data', function (ninds) {
                stream.pause();
                let formId = ninds.get('formId');
                MigrationForm.find({'ids.id': formId}, function (err, existingForms) {
                    if (err) throw err;
                    if (existingForms.length === 0) {
                        let newForm = createForm(ninds);
                        console.log('start cde of form: ' + formId);
                        let cdes = ninds.get('cdes');
                        if (cdes.length > 0)
                            newForm.formElements.push({
                                elementType: 'section',
                                instructions: {value: ''},
                                label: '',
                                formElements: []
                            });
                        async.forEachSeries(cdes, function (cde, doneOneCDE) {
                            let cdeId = cde.cdeId;
                            mongo_cde.byOtherIdAndNotRetired('NINDS', cdeId, function (err, existingCde) {
                                if (err) throw (err + ' cdeId: ' + cdeId);
                                else {
                                    let question = {
                                        cde: {
                                            tinyId: existingCde.tinyId,
                                            name: existingCde.naming[0].designation,
                                            version: existingCde.version,
                                            ids: existingCde.ids
                                        },
                                        datatype: existingCde.valueDomain.datatype,
                                        uom: existingCde.valueDomain.uom
                                    };
                                    if (question.datatype === 'Value List') {
                                        question.cde.permissibleValues = existingCde.valueDomain.permissibleValues;
                                        question.multiselect = cde.inputRestrictions === 'Multiple Pre-Defined Values Selected';

                                        let permissibleValues = [];
                                        let pvsArray = cde.permissibleValue.split(';');
                                        let isPvValueNumber = /^\d+$/.test(pvsArray[0]);
                                        let pdsArray = cde.permissibleDescription.split(';');
                                        if (pvsArray.length !== pdsArray.length) {
                                            console.log('*******************permissibleValue and permissibleDescription do not match.');
                                            console.log('*******************ninds:\n' + ninds);
                                            console.log('*******************cde:\n' + cde);
                                            process.exit(1);
                                        }
                                        for (let i = 0; i < pvsArray.length; i++) {
                                            if (pvsArray[i].length > 0) {
                                                let pv = {
                                                    permissibleValue: pvsArray[i],
                                                    valueMeaningDefinition: pdsArray[i],
                                                    codeSystemName: "NINDS"
                                                };
                                                if (isPvValueNumber) {
                                                    pv.valueMeaningName = pdsArray[i];
                                                } else {
                                                    pv.valueMeaningName = pvsArray[i];
                                                }
                                                permissibleValues.push(pv);
                                            }
                                        }
                                        question.answers = permissibleValues;
                                    } else if (question.datatype === 'Text') {
                                        question.datatypeText = existingCde.valueDomain.datatypeText;
                                    } else if (question.datatype === 'Number') {
                                        question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
                                    } else if (question.datatype === 'Date') {
                                        question.datatypeDate = existingCde.valueDomain.datatypeDate;
                                    } else {
                                        throw 'Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id;
                                    }
                                    var formElement = {
                                        elementType: 'question',
                                        instructions: {value: cde.instruction},
                                        question: question,
                                        formElements: []
                                    };
                                    if (cde.questionText === 'N/A' || cde.questionText.trim().length === 0) {
                                        formElement.label = existingCde.naming[0].designation;
                                        formElement.hideLabel = true;
                                    } else {
                                        formElement.label = cde.questionText;
                                    }
                                    newForm.formElements[0].formElements.push(formElement);
                                    doneOneCDE();
                                }
                            });
                        }, function doneAll() {
                            console.log('finished all cdes in form ' + formId);
                            var newFormObj = new MigrationForm(newForm);
                            newFormObj.save(function (err) {
                                if (err) throw err;
                                else {
                                    count++;
                                    console.log('count: ' + count);
                                    stream.resume();
                                }
                            });
                        });
                    } else if (existingForms.length === 1) {
                        var existingForm = existingForms[0];
                        mergeIntoForm(ninds, existingForm);
                        existingForm.markModified("classification");
                        existingForm.markModified("formElements");
                        existingForm.save(function (err) {
                            if (err) throw err;
                            else stream.resume();
                        });
                    } else {
                        console.log(existingForms.length + ' forms found, ids.id:' + ninds.formId);
                        process.exit(1);
                    }
                });
            });

            stream.on('end', function (err) {
                if (err) throw err;
                if (cb) cb();
            });
        }], function () {
        console.log('Finished.');
        process.exit(0);
    });
}

run();
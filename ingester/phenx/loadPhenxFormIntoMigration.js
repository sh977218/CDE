var async = require('async');
var MigrationProtocolModel = require('../createMigrationConnection').MigrationProtocolModel;
var MigrationForm = require('../createMigrationConnection').MigrationFormModel;
var classificationShared = require('../../modules/system/shared/classificationShared');
var updateShare = require('../updateShare');
var MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;

var importDate = new Date().toJSON();
var count = 0;
var phenxOrg;

function checkExistingNaming(existingNaming, protocol) {
    let crfModuleGuideline = protocol.get('crfModuleGuideline').trim();
    let description = protocol.get('description').trim();
    let existFormName;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation.trim() === crfModuleGuideline && existingName.definition.trim() === description)
            existFormName = true;
    });
    if (!existFormName && crfModuleGuideline.length > 0) {
        let newFormName = {
            designation: crfModuleGuideline,
            definition: description,
            languageCode: "EN-US"
        };
        existingNaming.push(newFormName);
        console.log('added new form name to form id: ' + protocol.get('formId'));
        console.log('new formName: ' + crfModuleGuideline);
        console.log('protocol._id: ' + protocol.id);
    }
}
function checkExistingReferenceDocuments(existingReferenceDocuments, protocol) {
    let downloadLink = protocol.get('downloadLink').trim();
    let existReferenceDocument;
    existingReferenceDocuments.forEach(function (existingReferenceDocument) {
        if (existingReferenceDocument.uri.trim() === downloadLink)
            existReferenceDocument = true;
    });
    if (!existReferenceDocument && downloadLink && downloadLink.length > 0) {
        let newReferenceDocument = {
            uri: (downloadLink.indexOf('http://') !== -1 || downloadLink.indexOf('https://') !== -1) ? downloadLink : ''
        };
        existingReferenceDocuments.push(newReferenceDocument);
        console.log('added new reference document: ' + protocol.get('formId'));
        console.log('newCde reference: ' + downloadLink);
        console.log('protocol._id: ' + protocol.id);
    }
}
function mergeForm(protocol, existingForm) {
    let newForm = createForm(protocol);
    updateShare.mergeNaming(newForm, existingForm);
    updateShare.mergeSources(newForm, existingForm);
    updateShare.mergeIds(newForm, existingForm);
    updateShare.mergeProperties(newForm, existingForm);
    updateShare.mergeReferenceDocument(newForm, existingForm);

    existingForm.updated = importDate;
    classificationShared.transferClassifications(newForm, existingForm);
}

function createForm(protocol) {
    let formId = protocol.get('formId');
    let naming = [];
    let formName = {
        designation: protocol.get('crfModuleGuideline').trim(), definition: protocol.get('description').trim(),
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        },
        tags: [],
        source: 'protocol'
    };
    naming.push(formName);

    let sources = [];
    sources.push({
        sourceName: 'protocol',
        updated: protocol.get('versionDate')
    });

    let ids = [];
    let crfId = {
        source: 'protocol',
        id: formId,
        'version': protocol.get('versionNum').length > 0 ? Number(protocol.get('versionNum')).toString() : ''
    };
    if (formId && formId.length > 0) ids.push(crfId);

    let referenceDocuments = [];
    let referenceDocument = {
        uri: (protocol.get('downloadLink').indexOf('http://') !== -1 || protocol.get('downloadLink').indexOf('https://') !== -1) ? protocol.get('downloadLink') : '',
        source: 'protocol'
    };
    if (referenceDocument.uri.length > 0) referenceDocuments.push(referenceDocument);

    let domainSubDomain = {
        "name": "Domain",
        elements: [{
            "name": protocol.get('domainName'),
            "elements": []
        }]
    };

    if (protocol.get('domainName') !== protocol.get('subDomainName')) {
        domainSubDomain.elements[0].elements.push({
            "name": protocol.get('subDomainName'),
            "elements": []
        });
    }

    let elements = [];
    let diseaseElement;
    if (protocol.get('diseaseName') === 'Traumatic Brain Injury') {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                "name": protocol.get('diseaseName'),
                "elements": [{
                    "name": protocol.get('subDiseaseName'),
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
                "name": protocol.get('diseaseName'),
                "elements": [domainSubDomain]
            }]
        };
    }
    elements.push(domainSubDomain);
    elements.push(diseaseElement);
    let classification = [{stewardOrg: {name: 'protocol'}, elements: elements}];
    return {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: 'batchloader'},
        sources: sources,
        created: importDate,
        imported: importDate,
        isCopyrighted: protocol.get('copyright'),
        noRenderAllowed: protocol.get('copyright'),
        stewardOrg: {name: 'protocol'},
        registrationState: {registrationStatus: "Qualified"},
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: classification,
        properties: [],
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
            MigrationOrgModel.findOne({"name": 'PhenX'}).exec(function (err, org) {
                if (err) throw err;
                else if (org) {
                    phenxOrg = org;
                    cb();
                } else {
                    new MigrationOrgModel({name: "PhenX", classification: []}).save(function (e, o) {
                        if (o) throw o;
                        else {
                            phenxOrg = org;
                            cb();
                        }
                    })
                }
            });
        },
        function (cb) {
            let stream = MigrationProtocolModel.find({}).stream();
            stream.on('data', function (protocol) {
                stream.pause();
                let formName = protocol.get('crfModuleGuideline').toLowerCase();
                if (formName.indexOf("summary") > -1 ||
                    formName.indexOf("recommendations") > -1 ||
                    formName.indexOf("recommended") > -1 ||
                    formName.indexOf("overview") > -1 ||
                    formName.indexOf("guidelines") > -1
                ) {
                    stream.resume();
                } else {
                    let formId = protocol.get('formId');
                    MigrationForm.find({'ids.id': formId}, function (err, existingForms) {
                        if (err) throw err;
                        if (existingForms.length === 0) {
                            let newForm = createForm(protocol);
                            console.log('start cde of form: ' + formId);
                            let cdes = protocol.get('cdes');
                            if (cdes.length > 0)
                                newForm.formElements.push({
                                    elementType: 'section',
                                    instructions: {value: ''},
                                    label: '',
                                    formElements: []
                                });
                            async.forEachSeries(cdes, function (cde, doneOneCDE) {
                                let cdeId = cde.cdeId;
                                mongo_cde.byOtherIdAndNotRetired('protocol', cdeId, function (err, existingCde) {
                                    if (err || !existingCde) throw (err);
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
                                                console.log('*******************protocol:\n' + protocol);
                                                console.log('*******************cde:\n' + cde);
                                                process.exit(1);
                                            }
                                            for (let i = 0; i < pvsArray.length; i++) {
                                                if (pvsArray[i].length > 0) {
                                                    let pv = {
                                                        permissibleValue: pvsArray[i],
                                                        valueMeaningDefinition: pdsArray[i]
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
                                        } else if (question.datatype === 'File') {
                                            question.datatypeDate = existingCde.valueDomain.datatypeDate;
                                        } else {
                                            throw 'Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id;
                                        }
                                        let formElement = {
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
                                new MigrationForm(newForm).save(function (err) {
                                    if (err) throw err;
                                    else {
                                        count++;
                                        console.log('count: ' + count);
                                        stream.resume();
                                    }
                                });
                            });
                        } else if (existingForms.length === 1) {
                            let existingForm = existingForms[0];
                            mergeForm(protocol, existingForm);
                            existingForm.markModified("classification");
                            existingForm.markModified("formElements");
                            existingForm.save(function (err) {
                                if (err) throw err;
                                else stream.resume();
                            });
                        } else {
                            console.log(existingForms.length + ' forms found, formId: ' + protocol.formId);
                            process.exit(1);
                        }
                    });
                }
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
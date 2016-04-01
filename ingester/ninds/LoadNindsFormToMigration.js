var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    FormModel = require('./createConnection').FormModel,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

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
            uri: (downloadLink.indexOf('http://') != -1 || downloadLink.indexOf('https://') != -1) ? downloadLink : ''
        };
        existingReferenceDocuments.push(newReferenceDocument);
        console.log('added new reference document: ' + ninds.get('formId'));
        console.log('newCde reference: ' + downloadLink);
        console.log('ninds._id: ' + ninds.id);
    }
}
function transferForm(existingForm, ninds) {
    // add newForm naming if no name existing
    var existingNaming = existingForm.get('naming');
    checkExistingNaming(existingNaming, ninds);

    // add newForm referenceDocument if no referenceDocument existing
    var existingReferenceDocuments = existingForm.get('referenceDocuments');
    checkExistingReferenceDocuments(existingReferenceDocuments, ninds);

    classificationShared.transferClassifications(createForm(ninds), existingForm)
};

function createForm(ninds) {
    var formId = ninds.get('formId');
    var naming = [];
    var formName = {
        designation: ninds.get('crfModuleGuideline').trim(), definition: ninds.get('description').trim(),
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    };
    naming.push(formName);

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
        uri: (ninds.get('downloadLink').indexOf('http://') != -1 || ninds.get('downloadLink').indexOf('https://') != -1) ? ninds.get('downloadLink') : ''
    };
    if (referenceDocument.uri.length > 0) {
        referenceDocuments.push(referenceDocument);
    }

    var elements = [];
    var domainElement = {
        name: 'Domain',
        elements: [{
            "name": ninds.get('domainName'),
            "elements": [{
                "name": ninds.get('subDomainName'),
                "elements": []
            }]
        }]
    };
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
                        "elements": [{
                            "name": ninds.get('domainName'),
                            "elements": [{
                                "name": ninds.get('subDomainName'),
                                "elements": []
                            }]
                        }]
                    }]
                }]
            }]
        };
    } else {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                "name": ninds.get('diseaseName'),
                "elements": [{
                    "name": 'Domain',
                    "elements": [{
                        "name": ninds.get('domainName'),
                        "elements": [{
                            "name": ninds.get('subDomainName'),
                            "elements": []
                        }]
                    }]
                }]
            }]
        };
    }
    elements.push(domainElement);
    elements.push(diseaseElement);
    var classification = [{stewardOrg: {name: 'NINDS'}, elements: elements}];
    var newForm = {
        tinyId: mongo_data.generateTinyId(),
        isCopyrighted: ninds.get('copyRight'),
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: classification,
        formElements: []
    };
    return newForm;
}
function run(cb) {
    FormModel.remove({}, function () {
        var stream = NindsModel.find({}).stream();
        stream.on('data', function (ninds) {
            stream.pause();
            if (ninds) {
                var formId = ninds.get('formId');
                var filterName = ninds.get('crfModuleGuideline').replace('\nInternational Spinal Cord Society (ISCOS)', '').trim();
                ninds.set('crfModuleGuideline', filterName);
                FormModel.find({'ids.id': formId}, function (err, existingForms) {
                    if (err) throw err;
                    if (existingForms.length === 0) {
                        var newForm = createForm(ninds);
                        console.log('start cde of form: ' + formId);
                        var cdes = ninds.get('cdes');
                        async.forEachSeries(cdes, function (cde, doneOneCDE) {
                            var cdeId = cde.cdeId;
                            mongo_cde.byOtherId('NINDS', cdeId, function (err, existingCde) {
                                if (err) {
                                    console.log(err + ' cdeId: ' + cdeId);
                                    throw err;
                                }
                                var question = {
                                    cde: {
                                        tinyId: existingCde.tinyId,
                                        name: existingCde.naming[0].designation,
                                        version: existingCde.version,
                                        permissibleValues: existingCde.valueDomain.permissibleValues,
                                        ids: existingCde.ids
                                    },
                                    datatype: existingCde.valueDomain.datatype,
                                    datatypeNumber: existingCde.valueDomain.datatypeNumber,
                                    datatypeText: existingCde.valueDomain.datatypeText,
                                    uom: existingCde.valueDomain.uom,
                                    answers: existingCde.valueDomain.permissibleValues,
                                    multiselect: cde.inputRestrictions === 'Multiple Pre-Defined Values Selected' ? true : false
                                };
                                var formElement = {
                                    elementType: 'question',
                                    instructions: {value: cde.instruction},
                                    label: cde.questionText,
                                    question: question,
                                    formElements: []
                                };
                                newForm.formElements.push(formElement);
                                doneOneCDE();
                            });
                        }, function doneAll() {
                            console.log('finished all cdes in form ' + formId);
                            var newFormObj = new FormModel(newForm);
                            newFormObj.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    throw err;
                                }
                                stream.resume();
                            });
                        });
                    } else if (existingForms.length === 1) {
                        var existingForm = existingForms[0];
                        if (existingForm) {
                            transferForm(existingForm, ninds);
                            existingForm.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    throw err;
                                }
                                stream.resume();
                            })
                        }
                    } else {
                        console.log(existingForms.length + ' forms found, ids.id:' + form.formId);
                        process.exit(1);
                    }
                })
            } else {
                stream.resume();
            }
        });

        stream.on('end', function (err) {
            if (err) throw err;
            if (cb) cb();
            console.log('finished');
            process.exit(0);
        });
    })
}

run();
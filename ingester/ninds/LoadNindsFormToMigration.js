var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    FormModel = require('./createConnection').FormModel,
    classificationShared = require('../../modules/system/shared/classificationShared'),
    logger = require('./log')
    ;

function checkExistingNaming(existingNaming, newCde, ninds) {
    var existCdeName, existQuestionText;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation === newCde.cdeName && newCde.cdeName.length > 0)
            existCdeName = true;
        if (existingName.designation === newCde.questionText && newCde.questionText.length > 0 && newCde.questionText != 'N/A')
            existQuestionText = true;
    });
    if (!existCdeName && newCde.cdeName.length > 0) {
        var newCdeName = {designation: newCde.cdeName, definition: newCde.definitionDescription, languageCode: "EN-US"};
        existingNaming.push(newCdeName);
        logger.info('added new cde name to cde id: ' + newCde.cdeId);
        logger.info('newCde cdeName: ' + newCde.cdeName);
        logger.info('ninds._id: ' + ninds._id);
    }
    if (!existQuestionText && newCde.questionText.length > 0 && newCde.questionText != 'N/A') {
        var newQuestionText = {
            designation: newCde.questionText,
            languageCode: "EN-US",
            context: {
                contextName: 'Question Text'
            }
        };
        existingNaming.push(newQuestionText);
        logger.info('added new question text: ' + newCde.cdeId);
        logger.info('newCde questionText: ' + newCde.questionText);
        logger.info('ninds._id: ' + ninds._id);
    }
}
function checkExistingIds(existingIds, newCde, ninds) {
    var existCaDSRId, existVariableName, existAliasesForVariableName;
    existingIds.forEach(function (existingId) {
        if (existingId.source === 'caDSR' && existingId.id === newCde.cadsrId)
            existCaDSRId = true;
        if (existingId.source === 'NINDS Variable Name' && existingId.id === newCde.variableName)
            existVariableName = true;
        if (existingId.source === 'NINDS Variable Name Alias' && existingId.id === newCde.aliasesForVariableName)
            existAliasesForVariableName = true;
    });
    if (!existCaDSRId && newCde.cadsrId.length > 0) {
        var newCaDSRId = {source: 'caDSR', id: newCde.cadsrId};
        existingIds.push(newCaDSRId);
        logger.info('added new cadsr id: ' + newCde.cdeId);
        logger.info('newCde cadsrId: ' + newCde.cadsrId);
        logger.info('ninds._id: ' + ninds._id);
    }
    if (!existVariableName && newCde.variableName.length > 0) {
        var newVariableName = {source: 'NINDS Variable Name', id: newCde.varibleName};
        existingIds.push(newVariableName);
        logger.info('added new ninds variable id: ' + newCde.cdeId);
        logger.info('newCde varibleName: ' + newCde.varibleName);
        logger.info('ninds._id: ' + ninds._id);
    }
    if (!existAliasesForVariableName && newCde.aliasesForVariableName.length > 0) {
        var newAliasesForVariableName = {
            source: 'NINDS Variable Name Alias',
            id: newCde.aliasesForVariableName
        };
        existingIds.push(newAliasesForVariableName);
        logger.info('added new ninds variable alias id: ' + newCde.cdeId);
        logger.info('newCde aliasesForVariableName: ' + newCde.aliasesForVariableName);
        logger.info('ninds._id: ' + ninds._id);
    }
}
function checkExistingInstructions(existingInstructions, newCde, ninds) {
    var existInstruction;
    existingInstructions.forEach(function (existingInstruction) {
        if (existingInstruction.Disease === ninds.diseaseName && existingInstruction.instruction.value === newCde.instruction && newCde.instruction != 'No instructions available')
            existInstruction = true;
    });
    if (!existInstruction && newCde.instruction.length > 0 && newCde.instruction != 'No instructions available') {
        var newInstruction = {Disease: ninds.diseaseName, instruction: {value: newCde.instruction}};
        existingInstructions.push(newInstruction);
        logger.info('added new instruction: ' + newCde.cdeId);
        logger.info('newCde instruction: ' + newCde.instruction);
        logger.info('ninds._id: ' + ninds._id);
    }
}
function checkExistingProperties(existingProperties, newCde, ninds) {
    var existPreviousTitleProperty, existGuidelinesProperty;
    existingProperties.forEach(function (existingProperty) {
        if (existingProperty.key === 'NINDS Previous Title' && existingProperty.value === newCde.previousTitle)
            existPreviousTitleProperty = true;
        if (existingProperty.key === 'NINDS Guidelines' && existingProperty.value === newCde.crfModuleGuideline)
            existGuidelinesProperty = true;
    });
    if (!existPreviousTitleProperty && newCde.previousTitle.length > 0) {
        var newPreviousTitleProperty = {key: 'NINDS Previous Title', value: newCde.previousTitle};
        existingProperties.push(newPreviousTitleProperty);
        logger.info('added new previous title property: ' + newCde.cdeId);
        logger.info('newCde crfModuleGuideline: ' + newCde.crfModuleGuideline);
        logger.info('ninds._id: ' + ninds._id);
    }
    if (!existGuidelinesProperty && newCde.crfModuleGuideline.length > 0) {
        var newGuidelinesProperty = {key: 'NINDS Guidelines', value: newCde.crfModuleGuideline};
        existingProperties.push(newGuidelinesProperty);
        logger.info('added new guideline property: ' + newCde.cdeId);
        logger.info('newCde crfModuleGuideline: ' + newCde.crfModuleGuideline);
        logger.info('ninds._id: ' + ninds._id);
    }
}
function checkExistingReferenceDocuments(existingReferenceDocuments, newCde, ninds) {
    var existReferenceDocument;
    existingReferenceDocuments.forEach(function (existingReferenceDocument) {
        if (newCde.reference !== 'No references available') {
            if (existingReferenceDocument.title === newCde.reference)
                existReferenceDocument = true;
        }
    });
    if (!existReferenceDocument && newCde.reference.length > 0 && newCde.reference != 'No references available') {
        var newReferenceDocument = {
            title: newCde.reference,
            uri: newCde.reference.indexOf('http://www.') != -1 ? newCde.reference : ''
        };
        existingReferenceDocuments.push(newReferenceDocument);
        logger.info('added new reference document: ' + newCde.cdeId);
        logger.info('newCde reference: ' + newCde.reference);
        logger.info('ninds._id: ' + ninds._id);
    }
}
function transferForm(existingCde, ninds) {
    // add newCde naming if no name existing
    var existingNaming = existingCde.get('naming');
    checkExistingNaming(existingNaming, newCde, ninds);

    // add newCde ids if no id existing
    var existingIds = existingCde.get('ids');
    checkExistingIds(existingIds, newCde, ninds);

    // add newCde instruction if no instruction existing
    var existingInstructions = existingCde.get('instructions');
    checkExistingInstructions(existingInstructions, newCde, ninds);

    // add newCde property if no property existing
    var existingProperties = existingCde.get('properties');
    checkExistingProperties(existingProperties, newCde, ninds);

    // add newCde referenceDocument if no referenceDocument existing
    var existingReferenceDocuments = existingCde.get('referenceDocuments');
    checkExistingReferenceDocuments(existingReferenceDocuments, newCde, ninds);

    if (!newCde.classification.length || newCde.classification.length === 0)
        logger.info('x');
    classificationShared.transferClassifications(createCde(newCde, ninds), existingCde)
};

function createForm(ninds) {
    var naming = [];
    var formName = {
        designation: ninds.get('crfModuleGuideline'), definition: ninds.get('description'),
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    };
    naming.push(formName);

    var ids = [];
    var crfId = {source: 'CRF Id', id: ninds.get('formId')};
    if (ninds.get('formId') && ninds.get('formId').length > 0)
        ids.push(crfId);

    var referenceDocuments = [];
    var referenceDocument = {
        title: ninds.get('crfModuleGuideline'),
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
                "name": ninds.get('subDomainname'),
                "elements": []
            }]
        }]
    };
    var diseaseElement = {
        name: 'Disease',
        elements: [{
            "name": ninds.get('diseaseName'),
            "elements": [{
                "name": ninds.get('subDiseaseName'),
                "elements": []
            }]
        }]
    };
    elements.push(domainElement);
    elements.push(diseaseElement);
    var classification = [{stewardOrg: {name: 'NINDS'}, elements: elements}];
    var newForm = {
        isCopyrighted: ninds.get('copyRight'),
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        version: ninds.get('versionNum'),
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: classification
    };
    if (ninds.get('cdes').length == 0) {
        return newForm;
    } else {
        var formElements = [];
        async.forEachSeries(ninds.get('cdes'), function (cde, doneOne) {
            mongo_cde.byOtherId('NINDS', cde.cdeId, function (err, existingCde) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                var cde = {
                    tinyId: existingCde.tinyId,
                    name: existingCde.naming[0].designation,
                    version: existingCde.version,
                    permissibleValues: existingCde.valueDomain.permissibleValues,
                    ids: existingCde.ids
                };
                var question = {
                    cde: cde,
                    datatype: existingCde.valueDomain.datatype,
                    datatypeNumber: existingCde.valueDomain.datatypeNumber,
                    datatypeText: existingCde.valueDomain.datatypeText,
                    uom: existingCde.valueDomain.uom,
                    answers: existingCde.valueDomain.permissibleValues,
                    multiselect: cde.inputRestrictions === 'Multiple Pre-Defined Values Selected' ? true : cde.inputRestrictions === 'Single Pre-Defined Value Selected' ? false : null
                };
                var formElement = {
                    elementType: {type: 'question'},
                    instructions: existingCde.instructions[0],
                    label: existingCde.naming[0],
                    question: question,
                    formElements: []
                };
                formElements.push(formElement);
                doneOne();
            });
        }, function doneAll() {
            newForm.formElements = formElements;
            return newForm;
        });
    }
}
function a(cb) {
    FormModel.remove({}, function () {
        var stream = NindsModel.find({}).stream();
        stream.on('data', function (ninds) {
            stream.pause();
            if (ninds) {
                FormModel.find({'ids.id': ninds.formId}, function (err, existingForms) {
                    if (err) throw err;
                    if (existingForms.length === 0) {
                        var newForm = createForm(ninds);
                        var newFormObj = new FormModel(newForm);
                        newFormObj.save(function () {
                            stream.resume();
                        });
                    } else if (existingForms.length === 1) {
                        var existingForm = existingForms[0];
                        if (existingForm) {
                            transferForm(existingForm, ninds);
                            existingForm.save(function () {
                                stream.resume();
                            })
                        }
                    }
                    else {
                        logger.info(existingForms.length + ' forms found, ids.id:' + form.formId);
                        process.exit(1);
                    }
                })
            } else {
                stream.resume();
            }
        });

        stream.on('end', function (err) {
            if (err) throw err;
            cb();
        });
    })
}

a();
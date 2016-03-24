var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    DataElementModel = require('./createConnection').DataElementModel,
    OrgModel = require('./createConnection').OrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared'),
    logger = require('./log')
    ;

var counter = 0;
var nindsOrg = null;

function checkExistingNaming(existingNaming, newCde, ninds) {
    var existCdeName, existQuestionText;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation.toLowerCase() === newCde.cdeName.toLowerCase() && newCde.cdeName.length > 0)
            existCdeName = true;
        if (existingName.designation.toLowerCase() === newCde.questionText.toLowerCase() && newCde.questionText.length > 0 && newCde.questionText != 'N/A')
            existQuestionText = true;
    });
    if (!existCdeName && newCde.cdeName.length > 0) {
        var newCdeName = {designation: newCde.cdeName, definition: newCde.definitionDescription, languageCode: "EN-US"};
        existingNaming.push(newCdeName);
        console.log('added new cde name to cde id: ' + newCde.cdeId);
        console.log('newCde cdeName: ' + newCde.cdeName);
        console.log('ninds._id: ' + ninds._id);
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
        console.log('added new question text: ' + newCde.cdeId);
        console.log('newCde questionText: ' + newCde.questionText);
        console.log('ninds._id: ' + ninds._id);
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
        console.log('added new cadsr id: ' + newCde.cdeId);
        console.log('newCde cadsrId: ' + newCde.cadsrId);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existVariableName && newCde.variableName.length > 0) {
        var newVariableName = {source: 'NINDS Variable Name', id: newCde.varibleName};
        existingIds.push(newVariableName);
        console.log('added new ninds variable id: ' + newCde.cdeId);
        console.log('newCde varibleName: ' + newCde.varibleName);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existAliasesForVariableName && newCde.aliasesForVariableName.length > 0) {
        var newAliasesForVariableName = {
            source: 'NINDS Variable Name Alias',
            id: newCde.aliasesForVariableName
        };
        existingIds.push(newAliasesForVariableName);
        console.log('added new ninds variable alias id: ' + newCde.cdeId);
        console.log('newCde aliasesForVariableName: ' + newCde.aliasesForVariableName);
        console.log('ninds._id: ' + ninds._id);
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
        console.log('added new instruction: ' + newCde.cdeId);
        console.log('newCde instruction: ' + newCde.instruction);
        console.log('ninds._id: ' + ninds._id);
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
        console.log('added new previous title property: ' + newCde.cdeId);
        console.log('newCde crfModuleGuideline: ' + newCde.crfModuleGuideline);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existGuidelinesProperty && newCde.crfModuleGuideline.length > 0) {
        var newGuidelinesProperty = {key: 'NINDS Guidelines', value: newCde.crfModuleGuideline};
        existingProperties.push(newGuidelinesProperty);
        console.log('added new guideline property: ' + newCde.cdeId);
        console.log('newCde crfModuleGuideline: ' + newCde.crfModuleGuideline);
        console.log('ninds._id: ' + ninds._id);
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
        console.log('added new reference document: ' + newCde.cdeId);
        console.log('newCde reference: ' + newCde.reference);
        console.log('ninds._id: ' + ninds._id);
    }
}
function transferCde(existingCde, newCde, ninds) {
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
        console.log('x');
    classificationShared.transferClassifications(createCde(newCde, ninds), existingCde)
}

function createCde(cde, ninds) {
    var naming = [];
    var cdeName = {
        designation: cde.cdeName, definition: cde.definitionDescription,
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    };
    var questionTextName = {
        designation: cde.questionText,
        languageCode: "EN-US",
        context: {
            contextName: 'Question Text'
        }
    };
    naming.push(cdeName);
    if (questionTextName.designation != 'N/A')
        naming.push(questionTextName);

    var ids = [];
    var nindsId = {source: 'NINDS', id: cde.cdeId, version: Number(cde.versionNum).toString()};
    var caDSRId = {source: 'caDSR', id: cde.cadsrId};
    var nindsVariableId = {source: 'NINDS Variable Name', id: cde.variableName};
    var nindsVariableAliasId = {
        source: 'NINDS Variable Name Alias',
        id: cde.aliasesForVariableName
    };
    ids.push(nindsId);
    if (cde.cadsrId && cde.cadsrId.length > 0)
        ids.push(caDSRId);
    if (cde.variableName && cde.variableName.length > 0)
        ids.push(nindsVariableId);
    if (cde.aliasesForVariableName && cde.aliasesForVariableName.length > 0)
        ids.push(nindsVariableAliasId);

    var instructions = [];
    var instruction = {Disease: ninds.diseaseName, instruction: {value: cde.instruction}};
    if (cde.instruction && cde.instruction.length > 0)
        instructions.push(instruction);

    var properties = [];
    var previousTitleProperty = {key: 'NINDS Previous Title', value: cde.previousTitle};
    var guidelinesProperty = {key: 'NINDS Guidelines', value: cde.crfModuleGuideline};
    if (cde.previousTitle && cde.previousTitle.length > 0)
        properties.push(previousTitleProperty);
    if (cde.crfModuleGuideline && cde.crfModuleGuideline.length > 0)
        properties.push(guidelinesProperty);

    var referenceDocuments = [];
    var referenceDocument = {
        title: cde.reference,
        uri: cde.reference.indexOf('http://www.') != -1 ? cde.reference : ''
    };
    if (referenceDocument.title && referenceDocument.title.length > 0 && referenceDocument.title != 'No references available')
        referenceDocuments.push(referenceDocument);


    var valueDomain = {
        uom: cde.measurementType
    };
    var permissibleValues = [];
    var pvsArray = cde.permissibleValue.split(';');
    var pdsArray = cde.permissibleDescription.split(';');
    if (pvsArray.length != pdsArray.length) {
        console.log('*******************permissibleValue and permisslbeDescription do not match.');
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
        process.exit(1);
    }
    for (var i = 0; i < pvsArray.length; i++) {
        var permissibleValue = {
            permissibleValue: pvsArray[i],
            valueMeaningName: pvsArray[i],
            valueMeaningDefinition: pdsArray[i]
        };
        if (permissibleValue.permissibleValue.length > 0)
            permissibleValues.push(permissibleValue);
    }
    if (cde.dataType === 'Alphanumeric') {
        if (cde.inputRestrictions === 'Free-Form Entry') {
            valueDomain.datatypeText = {maxLength: Number(cde.size)};
            valueDomain.datatype = 'Text';
        } else if (cde.inputRestrictions === 'Single Pre-Defined Value Selected' || cde.inputRestrictions === 'Multiple Pre-Defined Values Selected') {
            valueDomain.permissibleValues = permissibleValues;
            valueDomain.datatype = 'Value List';
        } else {
            console.log('unknown cde.inputRestrictions found:' + cde.inputRestritions);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            process.exit(1);
        }
    }
    else if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
        valueDomain.datatypeNumber = {minValue: Number(cde.minValue), maxValue: Number(cde.maxValue)};
        valueDomain.datatype = 'Number';
    } else if (cde.dataType === 'Date or Date & Time') {
        valueDomain.datatype = 'Date';
    } else {
        console.log('unknown cde.dataType found:' + cde.dataType);
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
        process.exit(1);
    }

    var elements = [];
    var populationArray = cde.population.split(';');
    var populationElement = {
        name: 'Population',
        elements: []
    };
    populationArray.forEach(function (p) {
        if (p.length > 0) {
            populationElement.elements.push({
                "name": p,
                "elements": []
            })
        }
    });
    var domainElement = {
        name: 'Domain',
        elements: [{
            "name": cde.domain,
            "elements": [{
                "name": cde.subDomain,
                "elements": []
            }]
        }]
    };
    var diseaseElement = {
        name: 'Disease',
        elements: [{
            "name": ninds.diseaseName,
            "elements": [{
                "name": ninds.subDiseaseName,
                "elements": []
            }]
        }]
    };
    elements.push(populationElement);
    elements.push(domainElement);
    elements.push(diseaseElement);
    var classification = [{stewardOrg: {name: 'NINDS'}, elements: elements}];

    return {
        stewardOrg: {name: "NINDS"},
        registrationState: {registrationStatus: "Qualified"},
        source: 'NINDS',
        version: Number(cde.versionNum).toString(),
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        instructions: instructions,
        properties: properties,
        valueDomain: valueDomain,
        classification: classification
    };
}
function a(cb) {
    async.series([
        function (cb) {
            DataElementModel.remove({}, function () {
                cb();
            })
        },
        function (cb) {
            OrgModel.remove({}, function () {
                new OrgModel({name: 'NINDS'}).save(function () {
                    cb();
                });
            })
        },
        function (cb) {
            OrgModel.findOne({"name": 'NINDS'}).exec(function (error, org) {
                nindsOrg = org;
                cb();
            });
        },
        function (cb) {
            var stream = NindsModel.find({}).stream();
            stream.on('data', function (ninds) {
                stream.pause();
                if (ninds && ninds.get('cdes').length > 0) {
                    async.forEachSeries(ninds.get('cdes'), function (cde, doneOneCde) {
                        DataElementModel.find({'ids.id': cde.cdeId}, function (err, existingCdes) {
                            if (err) throw err;
                            if (existingCdes.length === 0) {
                                var cls = ["Domain"];
                                cls.push(ninds.get('domainName'));
                                classificationShared.addCategory({elements: nindsOrg.classifications}, cls);

                                cls = ["Disease"];
                                cls.push(ninds.get('diseaseName'));
                                if (ninds.get('subDiseaseName').length > 0)
                                    cls.push(ninds.get('subDiseaseName'));

                                cls.push("Domain");
                                cls.push(ninds.get('domainName'));
                                classificationShared.addCategory({elements: nindsOrg.classifications}, cls);

                                var newCde = createCde(cde, ninds);
                                var newCdeObj = new DataElementModel(newCde);
                                newCdeObj.save(function () {
                                    doneOneCde();
                                });
                            } else if (existingCdes.length === 1) {
                                var existingCde = existingCdes[0];
                                if (existingCde) {
                                    transferCde(existingCde, cde, ninds);
                                    existingCde.save(function () {
                                        doneOneCde();
                                    })
                                }
                            }
                            else {
                                console.log(existingCdes.length + ' cdes found, ids.id:' + cde.cdeId);
                                process.exit(1);
                            }
                        })
                    }, function doneAllCdes() {
                        stream.resume();
                    })
                } else {
                    stream.resume();
                }
            });

            stream.on('end', function (err) {
                if (err) throw err;
                nindsOrg.markModified('classifications');
                nindsOrg.save(function () {
                    if (cb) cb();
                    process.exit(0);
                });
            });
        }
    ]);
}

a();
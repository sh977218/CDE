var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    DataElementModel = require('./createConnection').DataElementModel,
    OrgModel = require('./createConnection').OrgModel,
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

var nindsOrg = null;
var newline = '<br>';
var importDate = new Date().toJSON();

function removeNewline(s) {
    return s.replace(/\n/g, '  ').trim();
}

function checkExistingNaming(existingNaming, newCde, ninds) {
    var existCdeName, existQuestionText;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation.toLowerCase() === newCde.cdeName.toLowerCase() && newCde.cdeName.length > 0)
            existCdeName = true;
        if (existingName.designation.toLowerCase() === newCde.questionText.toLowerCase() && newCde.questionText.length > 0 && newCde.questionText != 'N/A')
            existQuestionText = true;
    });
    if (!existCdeName && newCde.cdeName && newCde.cdeName.length > 0) {
        var newCdeName = {designation: newCde.cdeName, definition: newCde.definitionDescription, languageCode: "EN-US"};
        existingNaming.push(newCdeName);
        console.log('added new cde name to cde id: ' + newCde.cdeId);
        console.log('newCde cdeName: ' + newCde.cdeName);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existQuestionText && newCde.questionText && newCde.questionText.length > 0 && newCde.questionText != 'N/A') {
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
    if (!existCaDSRId && newCde.cadsrId && newCde.cadsrId.length > 0) {
        var newCaDSRId = {source: 'caDSR', id: newCde.cadsrId};
        existingIds.push(newCaDSRId);
        console.log('added new cadsr id: ' + newCde.cdeId);
        console.log('newCde cadsrId: ' + newCde.cadsrId);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existVariableName && newCde.variableName && newCde.variableName.length > 0) {
        var newVariableName = {source: 'NINDS Variable Name', id: newCde.varibleName};
        existingIds.push(newVariableName);
        console.log('added new ninds variable id: ' + newCde.cdeId);
        console.log('newCde varibleName: ' + newCde.varibleName);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existAliasesForVariableName && newCde.aliasesForVariableName && newCde.aliasesForVariableName.length > 0) {
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
function checkExistingProperties(existingProperties, newCde, ninds) {
    var existPreviousTitleProperty, existGuidelinesProperty;
    var existingGuidelinesProperties;
    existingProperties.forEach(function (existingProperty) {
        if (existingProperty.key === 'NINDS Previous Title' && existingProperty.value === newCde.previousTitle)
            existPreviousTitleProperty = true;
        if (existingProperty.key === 'NINDS Guidelines') {
            existingGuidelinesProperties = existingProperty;
            if (existingGuidelinesProperties.value.indexOf(ninds.get('formId')) != -1)
                existGuidelinesProperty = true;
        }
    });
    if (!existPreviousTitleProperty && newCde.previousTitle && newCde.previousTitle.length > 0) {
        var newPreviousTitleProperty = {key: 'NINDS Previous Title', value: newCde.previousTitle};
        existingProperties.push(newPreviousTitleProperty);
        console.log('added new previous title property: ' + newCde.cdeId);
        console.log('newCde crfModuleGuideline: ' + newCde.previousTitle);
        console.log('ninds._id: ' + ninds._id);
    }
    if (!existGuidelinesProperty && newCde.instruction && newCde.instruction.length > 0) {
        var newGuidelinesProperty = ninds.get('formId') + newline + newCde.instruction + newline;
        existingGuidelinesProperties.value = existingGuidelinesProperties.value + newGuidelinesProperty;
        console.log('added new guideline property: ' + newCde.cdeId);
        console.log('newCde crfModuleGuideline: ' + newCde.instruction);
        console.log('ninds._id: ' + ninds._id);
    }
}
function checkExistingReferenceDocuments(existingReferenceDocuments, newCde, ninds) {
    var existReferenceDocument;
    existingReferenceDocuments.forEach(function (existingReferenceDocument) {
        if (existingReferenceDocument.title === removeNewline(newCde.reference) && newCde.reference !== 'No references available')
            existReferenceDocument = true;
    });
    if (!existReferenceDocument && newCde.reference && newCde.reference.length > 0 && newCde.reference != 'No references available') {
        var newReferenceDocument = {
            title: removeNewline(newCde.reference),
            uri: ''
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

    // add newCde property if no property existing
    var existingProperties = existingCde.get('properties');
    checkExistingProperties(existingProperties, newCde, ninds);

    // add newCde referenceDocument if no referenceDocument existing
    var existingReferenceDocuments = existingCde.get('referenceDocuments');
    checkExistingReferenceDocuments(existingReferenceDocuments, newCde, ninds);

    existingCde.created = importDate;
    classificationShared.transferClassifications(createCde(newCde, ninds), existingCde);
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

    var properties = [];
    var previousTitleProperty = {key: 'NINDS Previous Title', value: cde.previousTitle};
    var guidelinesProperty = {
        key: 'NINDS Guidelines',
        value: ninds.get('formId') + newline + cde.instruction + newline,
        valueFormat: 'html'
    };
    if (cde.previousTitle && cde.previousTitle.length > 0)
        properties.push(previousTitleProperty);
    if (cde.instruction && cde.instruction.length > 0)
        properties.push(guidelinesProperty);

    var referenceDocuments = [];
    var referenceDocument = {
        title: removeNewline(cde.reference),
        uri: (cde.reference.indexOf('http://www.') != -1 || cde.reference.indexOf('https://www.') != -1) ? cde.reference : ''
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

    var newCde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: "NINDS"},
        createdBy: {username: 'batchloader'},
        created: importDate,
        imported: importDate,
        registrationState: {registrationStatus: "Qualified"},
        source: 'NINDS',
        version: Number(cde.versionNum).toString(),
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        properties: properties,
        valueDomain: valueDomain,
        classification: []
    };

    var classifToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];
    var subDomainToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];

    if (ninds.get('diseaseName') === 'Traumatic Brain Injury') {
        classifToAdd.push(ninds.get('subDiseaseName'));
        subDomainToAdd.push(ninds.get('subDiseaseName'));
    }

    classifToAdd.push('Domain');
    subDomainToAdd.push('Domain');

    classifToAdd.push(cde.domain);
    subDomainToAdd.push(cde.domain);

    classifToAdd.push(cde.subDomain);
    subDomainToAdd.push(cde.subDomain);

    classificationShared.classifyItem(newCde, "NINDS", classifToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, classifToAdd);

    classificationShared.classifyItem(newCde, "NINDS", subDomainToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, subDomainToAdd);

    var populationArray = cde.population.split(';');
    populationArray.forEach(function (p) {
        if (p.length > 0) {
            classificationShared.classifyItem(newCde, "NINDS", ['Population', p]);
            classificationShared.addCategory({elements: nindsOrg.classifications}, ['Population', p]);
        }
    });

    var domainToAdd = ['Domain', cde.domain, cde.subDomain];
    classificationShared.classifyItem(newCde, "NINDS", domainToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, domainToAdd);

    return newCde;
}
function run(cb) {
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
                                var newCde = createCde(cde, ninds);
                                var newCdeObj = new DataElementModel(newCde);
                                newCdeObj.save(function (err) {
                                    if (err) throw err;
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

run();
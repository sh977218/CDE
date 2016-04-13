var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    DataElementModel = require('./createConnection').DataElementModel,
    OrgModel = require('./createConnection').OrgModel,
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

var nindsOrg = null;
var newline = '<br>';
var today = new Date().toJSON();

function removeNewline(s) {
    return s.replace(/\n/g, '  ').trim();
}

/**
 * @param existingNaming
 * @param {{cdeName:string, questionText,definitionDescription,cdeId,variableName,cdeName}} newCde
 */
function checkExistingNaming(existingNaming, newCde) {
    var existCdeName, existQuestionText;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation.toLowerCase() === newCde.cdeName.toLowerCase() && newCde.cdeName.length > 0) existCdeName = true;
        if (existingName.designation.toLowerCase() === newCde.questionText.toLowerCase() && newCde.questionText.length > 0 && newCde.questionText !== 'N/A') existQuestionText = true;
    });
    if (!existCdeName && newCde.cdeName && newCde.cdeName.length > 0)
        existingNaming.push({
            designation: newCde.cdeName,
            definition: newCde.definitionDescription,
            languageCode: "EN-US"
        });
    if (!existQuestionText && newCde.questionText && newCde.questionText.length > 0 && newCde.questionText !== 'N/A')
        existingNaming.push({
            designation: newCde.questionText,
            languageCode: "EN-US",
            context: {
                contextName: 'Question Text'
            }
        });
}

/**
 * @param existingIds
 * @param {{variableName,cdeId,cadsrId,variableName}} newCde
 */
function checkExistingIds(existingIds, newCde) {
    var existCaDSRId, existVariableName;
    existingIds.forEach(function (existingId) {
        if (existingId.source === 'caDSR') {
            if (existingId.id === newCde.cadsrId) existCaDSRId = true;
            else {
                console.log('newCde has different caDSR Id. newCde: ' + newCde.cdeId);
                //noinspection JSUnresolvedVariable
                process.exit(0);
            }
        }
        if (existingId.source === 'NINDS Variable Name') {
            if (existingId.id === newCde.variableName) existVariableName = true;
            else {
                console.log('newCde has different NINDS Variable Name. newCde: ' + newCde.cdeId);
                //noinspection JSUnresolvedVariable
                process.exit(0);
            }
        }
    });
    if (!existCaDSRId && newCde.cadsrId && newCde.cadsrId.length > 0)
        existingIds.push({
            source: 'caDSR',
            id: newCde.cadsrId
        });
    if (!existVariableName && newCde.variableName && newCde.variableName.length > 0)
        existingIds.push({
            source: 'NINDS Variable Name',
            id: newCde.variableName
        });

}

/**
 * @param existingProperties
 * @param {{cdeId,aliasesForVariableName,previousTitle,instruction}} newCde
 * @param ninds
 */
function checkExistingProperties(existingProperties, newCde, ninds) {
    var existPreviousTitleProperty, existGuidelinesProperty, existAliasesForVariableNameProperty;
    var existingGuidelinesProperties;
    existingGuidelinesProperties = '';
    existingProperties.forEach(function (existingProperty) {
        if (existingProperty.key === 'NINDS Previous Title') {
            if (existingProperty.value === newCde.previousTitle) {
                existPreviousTitleProperty = true;
            } else {
                console.log('newCde has different NINDS Previous Title. newCde: ' + newCde.cdeId);
                //noinspection JSUnresolvedVariable
                process.exit(0);
            }
        }
        if (existingProperty.key === 'NINDS Guidelines') {
            existingGuidelinesProperties = existingProperty;
            if (existingGuidelinesProperties.value.indexOf(ninds.get('formId')) !== -1)
                existGuidelinesProperty = true;
        }
        if (existingProperty.key === 'Aliases for Variable Name') {
            if (existingProperty.value === newCde.aliasesForVariableName) {
                existAliasesForVariableNameProperty = true;
            } else {
                console.log('newCde has different Aliases for Variable Name. newCde: ' + newCde.cdeId);
                //noinspection JSUnresolvedVariable
                process.exit(0);
            }
        }
    });
    if (!existPreviousTitleProperty && newCde.previousTitle && newCde.previousTitle.length > 0)
        existingProperties.push({key: 'NINDS Previous Title', value: newCde.previousTitle});
    if (!existGuidelinesProperty && newCde.instruction && newCde.instruction.length > 0)
        existingGuidelinesProperties.value += ninds.get('formId') + newline + newCde.instruction + newline;
    if (!existAliasesForVariableNameProperty && newCde.aliasesForVariableName && newCde.aliasesForVariableName.length > 0 && newCde.aliasesForVariableName !== 'Aliases for variable name not defined')
        existingProperties.push({key: 'Aliases for Variable Name', value: newCde.aliasesForVariableName});
}

/**
 * @param existingReferenceDocuments
 * @param {{reference:string}} newCde
 */
function checkExistingReferenceDocuments(existingReferenceDocuments, newCde) {
    var existReferenceDocument;
    existingReferenceDocuments.forEach(function (existingReferenceDocument) {
        if (existingReferenceDocument.title === removeNewline(newCde.reference) && newCde.reference !== 'No references available')
            existReferenceDocument = true;
    });
    if (!existReferenceDocument && newCde.reference && newCde.reference.length > 0 && newCde.reference !== 'No references available')
        existingReferenceDocuments.push({
            title: removeNewline(newCde.reference),
            uri: ''
        });
}

function transferCde(existingCde, newCde, ninds) {
    // merge naming
    var existingNaming = existingCde.get('naming');
    checkExistingNaming(existingNaming, newCde);

    // merge ids
    var existingIds = existingCde.get('ids');
    checkExistingIds(existingIds, newCde);

    // merge property
    var existingProperties = existingCde.get('properties');
    checkExistingProperties(existingProperties, newCde, ninds);

    // merge referenceDocument
    var existingReferenceDocuments = existingCde.get('referenceDocuments');
    checkExistingReferenceDocuments(existingReferenceDocuments, newCde);

    existingCde.created = today;
    classificationShared.transferClassifications(createCde(newCde, ninds), existingCde);
}

/**
 * @param {{cdeId,population,subDomain,domain,minValue,maxValue,dataType,size,permissibleDescription,inputRestrictions,measurementType,permissibleValue,reference,versionNum,cdeName,definitionDescription,questionText,cadsrId,variableName,previousTitle,instruction,aliasesForVariableName}} cde
 * @param ninds
 */
function createCde(cde, ninds) {
    var naming = [{
        designation: cde.cdeName, definition: cde.definitionDescription,
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    }];
    if (cde.questionText !== 'N/A')
        naming.push({
            designation: cde.questionText,
            languageCode: "EN-US",
            context: {
                contextName: 'Question Text'
            }
        });

    var ids = [{source: 'NINDS', id: cde.cdeId, version: Number(cde.versionNum).toString()}];
    if (cde.cadsrId && cde.cadsrId.length > 0)
        ids.push({source: 'caDSR', id: cde.cadsrId});
    if (cde.variableName && cde.variableName.length > 0)
        ids.push({source: 'NINDS Variable Name', id: cde.variableName});

    var properties = [];
    if (cde.previousTitle && cde.previousTitle.length > 0)
        properties.push({key: 'NINDS Previous Title', value: cde.previousTitle});
    if (cde.instruction && cde.instruction.length > 0)
        properties.push({
            key: 'NINDS Guidelines',
            value: ninds.get('formId') + newline + cde.instruction + newline,
            valueFormat: 'html'
        });
    if (cde.aliasesForVariableName && cde.aliasesForVariableName.length > 0 && cde.aliasesForVariableName !== 'Aliases for variable name not defined')
        properties.push({
            key: 'Aliases for Variable Name',
            value: cde.aliasesForVariableName
        });

    var referenceDocuments = [];
    if (removeNewline(cde.reference) && removeNewline(cde.reference).length > 0 && removeNewline(cde.reference) !== 'No references available')
        referenceDocuments.push({
            title: removeNewline(cde.reference),
            uri: (cde.reference.indexOf('http://www.') !== -1 || cde.reference.indexOf('https://www.') !== -1) ? cde.reference : ''
        });


    var valueDomain = {
        uom: cde.measurementType
    };
    var permissibleValues = [];
    var pvsArray = cde.permissibleValue.split(';');
    var pdsArray = cde.permissibleDescription.split(';');
    if (pvsArray.length !== pdsArray.length) {
        console.log('*******************permissibleValue and permissibleDescription do not match.');
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
        //noinspection JSUnresolvedVariable
        process.exit(1);
    }
    for (var i = 0; i < pvsArray.length; i++) {
        if (pvsArray[i].length > 0)
            permissibleValues.push({
                permissibleValue: pvsArray[i],
                valueMeaningName: pvsArray[i],
                valueMeaningDefinition: pdsArray[i]
            });
    }
    if (cde.dataType === 'Alphanumeric') {
        if (cde.inputRestrictions === 'Free-Form Entry') {
            valueDomain.datatypeText = {maxLength: Number(cde.size)};
            valueDomain.datatype = 'Text';
        } else if (cde.inputRestrictions === 'Single Pre-Defined Value Selected' || cde.inputRestrictions === 'Multiple Pre-Defined Values Selected') {
            valueDomain.permissibleValues = permissibleValues;
            valueDomain.datatype = 'Value List';
        } else {
            console.log('unknown cde.inputRestrictions found:' + cde.inputRestrictions);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            //noinspection JSUnresolvedVariable
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
        //noinspection JSUnresolvedVariable
        process.exit(1);
    }

    var newCde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: "NINDS"},
        createdBy: {username: 'batchloader'},
        created: today,
        imported: today,
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

    var classificationToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];
    var subDomainToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];

    if (ninds.get('diseaseName') === 'Traumatic Brain Injury') {
        classificationToAdd.push(ninds.get('subDiseaseName'));
        subDomainToAdd.push(ninds.get('subDiseaseName'));
    }

    classificationToAdd.push('Domain');
    subDomainToAdd.push('Domain');

    classificationToAdd.push(cde.domain);
    subDomainToAdd.push(cde.domain);

    classificationToAdd.push(cde.subDomain);
    subDomainToAdd.push(cde.subDomain);

    classificationShared.classifyItem(newCde, "NINDS", classificationToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, classificationToAdd);

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
function run() {
    async.series([
        function (cb) {
            DataElementModel.remove({}, function (err) {
                if (err) throw err;
                OrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new OrgModel({name: 'NINDS'}).save(function (e) {
                        if (e) throw e;
                        cb();
                    });
                });
            });
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
                                    existingCde.markModified("classification");
                                    existingCde.save(function () {
                                        doneOneCde();
                                    });
                                }
                            }
                            else {
                                console.log(existingCdes.length + ' cdes found, ids.id:' + cde.cdeId);
                                //noinspection JSUnresolvedVariable
                                process.exit(1);
                            }
                        });
                    }, function doneAllCdes() {
                        stream.resume();
                    });
                } else stream.resume();
            });

            stream.on('end', function (err) {
                if (err) throw err;
                nindsOrg.markModified('classifications');
                nindsOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                });
            });
        }
    ]);
}

run();
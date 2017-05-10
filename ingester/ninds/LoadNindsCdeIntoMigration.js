var async = require('async');
var _ = require("lodash");
var MigrationNindsModel = require('./../createMigrationConnection').MigrationNindsModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var mongo_data = require('../../modules/system/node-js/mongo-data');
var classificationShared = require('../../modules/system/shared/classificationShared');

var cdeCounter = 0;
var nindsOrg = null;
var newline = '<br>';
var today = new Date().toJSON();

function mergeCde(existingCde, newCde) {
    // Naming
    existingCde.naming = _.uniqWith(existingCde.naming.concat(newCde.naming), (a, b) => {
        if (a.designation === b.designation
            && a.definition === b.definition
            && a.definitionFormat === b.definitionFormat
            && a.languageCode === b.languageCode
            && a.source === b.source
            && a.context && a.context.contextName === b.context.contextName
            && b.context && a.context.contextName === b.context.contextName
            && a.context.acceptability === b.context.acceptability) {
            b.tags = _.concat(a.tags, b.tags);
            return true;
        } else return false;
    });
    _.forEach(existingCde.naming, naming => {
        naming.tags = _.uniqWith(naming.tags, (a, b) => {
            return a.tag === b.tag;
        })
    });

    // Sources
    existingCde.sources = newCde.sources.concat(_.differenceWith(existingCde.sources, newCde.sources, (a, b) => {
        return a.sourceName === b.sourceName;
    }));

    // IDs
    existingCde.ids = newCde.ids.concat(_.differenceWith(existingCde.ids, newCde.ids, (a, b) => {
        return a.source === b.source;
    }));


    // Properties
    existingCde.properties = newCde.properties.concat(_.difference(existingCde.properties, newCde.properties,
        (a, b) => a.key === b.key && a.source && b.source));

    // ReferenceDocuments
    existingCde.referenceDocuments = newCde.referenceDocuments.concat(_.difference(existingCde.referenceDocuments, newCde.referenceDocuments,
        (a, b) => a.key === b.key && a.source && b.source));

    // PermissibleValues
    if (newCde.valueDomain.datatype === 'Value List' && existingCde.valueDomain.datatype === 'Value List') {
        let fullList = _.concat(existingCde.valueDomain.permissibleValues, newCde.valueDomain.permissibleValues);
        let uniqueList = _.uniqWith(fullList, function (a, b) {
            return a.permissibleValue === b.permissibleValue
                && a.valueMeaningDefinition === b.valueMeaningDefinition
                && a.valueMeaningName === b.valueMeaningName
                && a.codeSystemName === b.codeSystemName;
        });
        existingCde.valueDomain.permissibleValues = uniqueList;
        existingCde.markModified("valueDomain");
    } else if (newCde.valueDomain.datatype !== 'Value List' && existingCde.valueDomain.datatype !== 'Value List') {
    } else {
        console.log("newCde datatype: " + newCde.valueDomain.datatype);
        console.log("existingCde datatype: " + existingCde.valueDomain.datatype);
        process.exit(1);
    }
    existingCde.created = today;
    classificationShared.transferClassifications(newCde, existingCde);
}

function createCde(cde, ninds) {
    let naming = [{
        designation: cde.cdeName, definition: cde.definitionDescription,
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        },
        tags: [],
        source: 'NINDS'
    }];
    if (cde.questionText) _.trim(cde.questionText);
    if (cde.questionText && cde.questionText !== 'N/A')
        naming.push({
            designation: cde.questionText,
            languageCode: "EN-US",
            context: {
                contextName: 'Question Text'
            },
            tags: [{tag: "Question Text"}],
            source: 'NINDS'
        });

    let sources = [{
        sourceName: 'NINDS',
        updated: cde.versionDate,
        datatype: cde.dataType
    }];

    let ids = [{source: 'NINDS', id: cde.cdeId, version: Number(cde.versionNum).toString()}];
    if (cde.cadsrId) ids.push({source: 'caDSR', id: cde.cadsrId});
    if (cde.variableName) ids.push({source: 'NINDS Variable Name', id: cde.variableName});

    let properties = [];
    if (cde.previousTitle) properties.push({key: 'NINDS Previous Title', value: cde.previousTitle, source: 'NINDS'});
    if (cde.instruction)
        properties.push({
            key: 'NINDS Guidelines',
            value: ninds.get('formId') + newline + cde.instruction + newline,
            valueFormat: 'html',
            source: 'NINDS'
        });
    if (cde.aliasesForVariableName && cde.aliasesForVariableName !== 'Aliases for variable name not defined')
        properties.push({
            key: 'Aliases for Variable Name',
            value: cde.aliasesForVariableName,
            source: 'NINDS'
        });

    let referenceDocuments = [];
    if (cde.reference) _.trim(cde.reference);
    if (cde.reference && cde.reference == 'No references available')
        referenceDocuments.push({
            title: cde.reference,
            uri: (cde.reference.indexOf('http://www.') !== -1 || cde.reference.indexOf('https://www.') !== -1) ? cde.reference : '',
            source: 'NINDS'
        });

    let valueDomain = {
        uom: cde.measurementType
    };
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
    if (cde.inputRestrictions === 'Free-Form Entry') {
        if (cde.dataType === 'Alphanumeric') {
            valueDomain.datatype = 'Text';
            valueDomain.datatypeText = {maxLength: Number(cde.size)};
        } else if (cde.dataType === 'Date or Date & Time') {
            valueDomain.datatype = 'Date';
        } else if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
            valueDomain.datatype = 'Number';
            valueDomain.datatypeNumber = {
                minValue: Number(cde.minValue),
                maxValue: Number(cde.maxValue)
            };
        } else if (cde.dataType === 'File') {
        } else {
            console.log('unknown cde.dataType found:' + cde.dataType);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            process.exit(1);
        }

    } else if (cde.inputRestrictions === 'Single Pre-Defined Value Selected' || cde.inputRestrictions === 'Multiple Pre-Defined Values Selected') {
        if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
            valueDomain.datatypeValueList = {datatype: 'Number'};
        }
        else if (cde.dataType === 'Alphanumeric') {
            valueDomain.datatypeValueList = {datatype: 'Text'};
        }
        else if (cde.dataType === 'Date or Date & Time') {
            valueDomain.datatypeValueList = {datatype: 'Date'};
        } else if (cde.dataType === 'File') {
        } else {
            console.log('unknown cde.dataType found:' + cde.dataType);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            process.exit(1);
        }
        valueDomain.permissibleValues = permissibleValues;
        valueDomain.datatype = 'Value List';
    } else {
        console.log('unknown cde.inputRestrictions found:' + cde.inputRestrictions);
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
        process.exit(1);
    }

    let newCde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: "NINDS"},
        createdBy: {username: 'batchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        sources: sources,
        version: Number(cde.versionNum).toString(),
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        properties: properties,
        valueDomain: valueDomain,
        classification: []
    };

    let diseaseToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];
    let subDomainToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];

    let classificationToAdd = [
        'Disease',
        ninds.get('diseaseName')
    ];

    if (ninds.get('diseaseName') === 'Traumatic Brain Injury') {
        diseaseToAdd.push(ninds.get('subDiseaseName'));
        classificationToAdd.push(ninds.get('subDiseaseName'));
        subDomainToAdd.push(ninds.get('subDiseaseName'));
    }

    classificationToAdd.push('Classification');
    classificationToAdd.push(cde.classification);

    diseaseToAdd.push('Domain');
    subDomainToAdd.push('Domain');

    diseaseToAdd.push(cde.domain);
    subDomainToAdd.push(cde.domain);

    diseaseToAdd.push(cde.subDomain);
    subDomainToAdd.push(cde.subDomain);

    classificationShared.classifyItem(newCde, "NINDS", diseaseToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, diseaseToAdd);

    classificationShared.classifyItem(newCde, "NINDS", subDomainToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, subDomainToAdd);

    classificationShared.classifyItem(newCde, "NINDS", classificationToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, classificationToAdd);

    let populationArray = cde.population.split(';');
    populationArray.forEach(function (p) {
        if (p.length > 0) {
            classificationShared.classifyItem(newCde, "NINDS", ['Population', p]);
            classificationShared.addCategory({elements: nindsOrg.classifications}, ['Population', p]);
        }
    });
    let domainToAdd = ['Domain', cde.domain, cde.subDomain];
    classificationShared.classifyItem(newCde, "NINDS", domainToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, domainToAdd);
    return newCde;
}

function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
                if (err) throw err;
                console.log("Migration Data Element removed.");
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({"name": 'NINDS'}).exec(function (err, org) {
                if (err) throw err;
                else if (org) {
                    nindsOrg = org;
                    cb();
                } else {
                    new MigrationOrgModel({name: "NINDS", classification: []}).save(function (e, o) {
                        if (o) throw o;
                        else {
                            nindsOrg = org;
                            cb();
                        }
                    })
                }
            });
        },
        function (cb) {
            let stream = MigrationNindsModel.find({}).stream();
            stream.on('data', function (ninds) {
                stream.pause();
                if (ninds && ninds.get('cdes').length > 0) {
                    async.forEachSeries(ninds.get('cdes'), function (cde, doneOneCde) {
                        MigrationDataElementModel.find({'ids.id': cde.cdeId}, function (err, existingCdes) {
                            if (err) throw err;
                            else if (existingCdes.length > 1) {
                                console.log(existingCdes.length + ' cdes found, ids.id:' + cde.cdeId);
                                process.exit(1);
                            } else {
                                let newCde = createCde(cde, ninds);
                                if (existingCdes.length === 0) {
                                    new MigrationDataElementModel(newCde).save(function (err) {
                                        if (err) throw err;
                                        cdeCounter++;
                                        console.log('cdeCounter: ' + cdeCounter);
                                        doneOneCde();
                                    });
                                } else {
                                    let existingCde = existingCdes[0];
                                    mergeCde(existingCde, newCde, ninds);
                                    existingCde.markModified("classification");
                                    existingCde.save(function () {
                                        doneOneCde();
                                    });
                                }
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
                });
            });
        }
    ], function () {
        process.exit(0);
    });
}

run();
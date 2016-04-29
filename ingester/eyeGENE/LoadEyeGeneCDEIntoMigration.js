var async = require('async'),
    MigrationEyeGeneLoincModel = require('./../createConnection').MigrationEyeGeneLoincModel,
    MigrationEyeGeneAnswerListModel = require('./../createConnection').MigrationEyeGeneAnswerListModel,
    MigrationDataElementModel = require('./../createConnection').MigrationDataElementModel,
    MigrationOrgModel = require('./../createConnection').MigrationOrgModel
    ;


var cdeCounter = 0;
var eyeGeneOrg = null;
var newline = '<br>';
var today = new Date().toJSON();

function createCde(eyeGene) {
    var naming = [{
        designation: eyeGene.LONG_COMMON_NAME,
        definition: '',
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    }];

    var ids = [{source: 'EyeGene', id: eyeGene.LOINC_NUM}];

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
    return newCde;
}
function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new MigrationOrgModel({name: 'NINDS'}).save(function (e) {
                        if (e) throw e;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({"name": 'EyeGene'}).exec(function (error, org) {
                eyeGeneOrg = org;
                cb();
            });
        },
        function (cb) {
            var stream = MigrationEyeGeneLoincModel.find({}).stream();
            stream.on('data', function (eyeGene) {
                stream.pause();
                MigrationDataElementModel.find({'ids.id': eyeGene.LOINC_NUM}, function (err, existingCdes) {
                    if (err) throw err;
                    if (existingCdes.length === 0) {
                        var newCde = createCde(eyeGene);
                        var newCdeObj = new MigrationDataElementModel(newCde);
                        newCdeObj.save(function (err) {
                            if (err) throw err;
                            cdeCounter++;
                            console.log('cdeCounter: ' + cdeCounter);
                        });
                    } else {
                        console.log('duplicated id: ' + eyeGene.LOINC_NUM);
                        process.exit(1);
                    }
                });
                stream.resume();
            });

            stream.on('end', function (err) {
                if (err) throw err;
                eyeGeneOrg.markModified('classifications');
                eyeGeneOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                });
            });
        }]);
}

run();
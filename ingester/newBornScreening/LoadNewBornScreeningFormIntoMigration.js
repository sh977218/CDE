


function createForm(loinc) {

    var newForm = {
        tinyId: tinyId,
        version: version,
        createdBy: {username: 'BatchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: source,
        naming: naming,
        ids: ids,
        properties: properties,
        referenceDocuments: referenceDocuments,
        stewardOrg: {name: stewardOrgName},
        classification: [{stewardOrg: {name: stewardOrgName}, elements: []}],
        formElements: [{
            elementType: 'section',
            instructions: {value: ''},
            cardinality: CARDINALITY_MAP[loinc['PANEL HIERARCHY']['PANEL HIERARCHY'].Cardinality],
            label: loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['LOINC Name'],
            formElements: []
        }]
    };
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        newForm.formElements[0].instructions.value = loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'][0].Description;
    }
    var classType = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Class/Type'];
    var classificationType = CLASSIFICATION_TYPE_MAP[classType];
    var classificationToAdd = ['Newborn Screening', 'Classification', classificationType];
    classificationShared.classifyItem(newForm, stewardOrgName, classificationToAdd);
    classificationShared.addCategory({elements: newBornScreeningOrg.classifications}, classificationToAdd);
    return newForm;
}

var async = require('async');
var MigrationNewbornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewbornScreeningCDEModel;
var MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;

var LoadLoincFormIntoMigration = require('../loinc/Format/form/LoadLoincCFormIntoMigration');

var orgName = 'NLM';
var org;
var loincIdArray = [];
var formCount = 0;

function run() {
    async.series([
        function (cb) {
            LoadLoincCdeIntoMigration.setStewardOrg(orgName);
            LoadLoincCdeIntoMigration.setClassificationOrgName('Newborn screening');
            cb(null, 'Finished set parameters');
        },
        function (cb) {
            MigrationFormModel.remove({}, function (removeMigrationFormModelError) {
                if (removeMigrationFormModelError) throw removeMigrationFormModelError;
                console.log('Removed all migration form');
                cb(null, 'Finished removing migration form');
            });
        },
        function (cb) {
            MigrationOrgModel.remove({}, function (removeMigrationOrgError) {
                if (removeMigrationOrgError) throw removeMigrationOrgError;
                console.log('Removed all migration org');
                cb(null, 'Finished removing migration org');
            })
        },
        function (cb) {
            new MigrationOrgModel({name: orgName}).save(function (createMigrationOrgError, o) {
                if (createMigrationOrgError) throw createMigrationOrgError;
                console.log('Created migration org of ' + orgName);
                org = o;
                cb(null, 'Finished creating migration org');
            });
        },
        function (cb) {
            MigrationNewbornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: 'panel'}}).exec(function (findNewbornScreeningFormError, newbornScreeningForms) {
                if (findNewbornScreeningFormError) throw findNewbornScreeningFormError;
                newbornScreeningForms.forEach(function (n) {
                    loincIdArray.push(n.get('LOINC_NUM'));
                });
                cb(null, 'Finished retrieving all newborn screening form id.');
            })
        },
        function (cb) {
            LoadLoincFormIntoMigration.runArray(loincIdArray, org, function (form, next) {
                formCounter++;
                console.log('formCounter: ' + formCounter);
            }, function (results) {

            })

        }
    ], function (err, results) {
        process.exit(0);
    });
}

run();
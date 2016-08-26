var async = require('async');
var CLASSIFICATION_TYPE_MAP = require('../Mapping/LOINC_CLASSIFICATION_TYPE_MAP').map;
var MigrationLoincClassMappingModel = require('./../createMigrationConnection').MigrationLoincClassificationMappingModel;
var classificationShared = require('../../../modules/system/shared/classificationShared');

var classificationOrgName = '';
exports.setClassificationOrgName = function (o) {
    classificationOrgName = o;
};

exports.parseClassification = function (loinc, newCde, org, cb) {
    var classTypeString = '';
    var classification = '';
    var classificationType = '';
    if (loinc['BASIC ATTRIBUTES']) {
        classTypeString = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Class/Type'];
        var classTypeArray = classTypeString.split('/');
        if (classTypeArray.length === 0) {
            console.log('No Class/Type found in loinc id: ' + loinc.loincId);
            process.exit(1);
        } else if (classTypeArray.length === 2) {
            classification = classTypeArray[0];
            classificationType = classTypeArray[1];
        } else if (classTypeArray.length === 3) {
            classification = classTypeArray[0] + '/' + classTypeArray[1];
            classificationType = classTypeArray[2];
        } else {
            console.log('Unknown Class/Type found in loinc id: ' + loinc.loincId);
            process.exit(1);
        }
    }
    if (classificationOrgName === '') {
        console.log('classificationOrgName is empty. Please set it first.');
        process.exit(1);
    }
    var classificationToAdd = [classificationOrgName, 'Classification'];
    MigrationLoincClassMappingModel.find({
        type: CLASSIFICATION_TYPE_MAP[classificationType],
        key: classification
    }).exec(function (err, mappings) {
        if (err) throw err;
        else if (mappings.length === 0) {
            console.log("Can not find classification map.");
            process.exit(1);
        } else if (mappings.length === 1) {
            classificationToAdd.push(mappings[0].get('value'));
        }
        else {
            console.log("More than one classification map found");
            process.exit(1);
        }
        classificationShared.classifyItem(newCde, newCde.stewardOrg.name, classificationToAdd);
        classificationShared.addCategory({elements: org.classifications}, classificationToAdd);
        return cb();
    });
};
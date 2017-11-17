var async = require('async');
var CLASSIFICATION_TYPE_MAP = require('../Mapping/LOINC_CLASSIFICATION_TYPE_MAP').map;
var MigrationLoincClassMappingModel = require('../../createMigrationConnection').MigrationLoincClassificationMappingModel;
var classificationShared = require('@std/esm')(module)('../../../modules/system/shared/classificationShared');

exports.parseClassification = function (loinc, elt, org, classificationOrgName, classificationArray, cb) {
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
    var classificationToAdd = JSON.parse(JSON.stringify(classificationArray));
    classificationToAdd.push('Classification');
    MigrationLoincClassMappingModel.find({
        Type: CLASSIFICATION_TYPE_MAP[classificationType],
        Abbreviation: classification
    }).exec(function (err, mappings) {
        if (err) throw err;
        else if (mappings.length === 0) {
            console.log("Can not find classification map.");
            process.exit(1);
        } else if (mappings.length === 1) {
            classificationToAdd.push(mappings[0].get('Value'));
        } else {
            console.log("More than one classification map found. ");
            console.log("Type: " + CLASSIFICATION_TYPE_MAP[classificationType]);
            console.log("Abbreviation: " + classification);
            process.exit(1);
        }
        classificationShared.classifyItem(elt, classificationOrgName, classificationToAdd);
        classificationShared.addCategory({elements: org.classifications}, classificationToAdd);
        return cb();
    });
};
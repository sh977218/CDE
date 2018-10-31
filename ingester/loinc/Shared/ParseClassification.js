const _ = require('lodash');
const CLASSIFICATION_TYPE_MAP = require('../Mapping/LOINC_CLASSIFICATION_TYPE_MAP').map;
const MigrationLoincClassificationMappingModel = require('../../createMigrationConnection').MigrationLoincClassificationMappingModel;

exports.parseClassification = async (loinc, orgInfo) => {
    if (loinc.loinc) loinc = loinc.loinc;
    if (!orgInfo.classificationOrgName) return [];
    let classification = '';
    let classificationType = '';
    let basicAttributes = loinc['BASIC ATTRIBUTES'];
    if (!basicAttributes) reject("No BASIC ATTRIBUTES found in " + loinc.loincId);
    let classTypeString = basicAttributes['Class/Type'];
    let classTypeArray = classTypeString.split('/');
    if (classTypeArray.length === 0)
        reject('No Class/Type found in loinc id: ' + loinc.loincId);
    else if (classTypeArray.length === 2) {
        classification = classTypeArray[0];
        classificationType = classTypeArray[1];
    }
    else if (classTypeArray.length === 3) {
        classification = classTypeArray[0] + '/' + classTypeArray[1];
        classificationType = classTypeArray[2];
    } else reject('Unknown Class/Type found in loinc id: ' + loinc.loincId);

    let type = CLASSIFICATION_TYPE_MAP[classificationType];
    let classificationMap = await MigrationLoincClassificationMappingModel.findOne({
        Type: type,
        Abbreviation: classification
    });
    if (!classificationMap) {
        console.log(loinc.loincId + ' type: ' + type + ' Abbreviation: ' + classification + ' in classificationMap is null. See README and update the map.');
        process.exit(1);
    }
    let classificationArray = [{
        stewardOrg: {name: orgInfo.classificationOrgName},
        elements: []
    }];
    let iterator = classificationArray[0].elements;
    if (!_.isEmpty(orgInfo.classification)) {
        orgInfo.classification.forEach(c => {
            iterator.push({
                name: c,
                elements: []
            });
            iterator = iterator[0].elements;
        })
    }
    iterator.push({
        name: classificationMap.get('Value'),
        elements: []
    });
    return classificationArray;
};
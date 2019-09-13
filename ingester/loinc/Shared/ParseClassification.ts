import { isEmpty } from 'lodash';
import { map as CLASSIFICATION_TYPE_MAP } from 'ingester/loinc/Mapping/LOINC_CLASSIFICATION_TYPE_MAP';
import { LOINC_CLASSIFICATION_MAPPING } from 'ingester/createMigrationConnection';

export async function parseClassification(loinc, orgInfo) {
    if (loinc.loinc) {
        loinc = loinc.loinc;
    }
    if (!orgInfo.classificationOrgName) {
        console.log('classificationOrgName is empty');
        console.log('orgInfo: ' + orgInfo);
        process.exit(1);
    }
    let classification = '';
    let classificationType = '';
    const basicAttributes = loinc['BASIC ATTRIBUTES'];
    if (!basicAttributes) {
        console.log('No BASIC ATTRIBUTES found in ' + loinc.loincId);
        process.exit(1);
    }
    const classTypeString = basicAttributes['Class/Type'];
    const classTypeArray = classTypeString.split('/');
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

    const type = CLASSIFICATION_TYPE_MAP[classificationType];
    const classificationMap = await LOINC_CLASSIFICATION_MAPPING.findOne({
        Type: type,
        Abbreviation: classification
    });
    if (!classificationMap) {
        console.log(loinc.loincId + ' type: ' + type + ' Abbreviation: ' + classification + ' in classificationMap is null. See README and update the map.');
        process.exit(1);
    }
    const classificationArray = [{
        stewardOrg: {name: orgInfo.classificationOrgName},
        elements: []
    }];
    let iterator = classificationArray[0].elements;
    if (!isEmpty(orgInfo.classification)) {
        orgInfo.classification.forEach(c => {
            iterator.push({
                name: c,
                elements: []
            });
            iterator = iterator[0].elements;
        });
    }
    iterator.push({
        name: classificationMap.get('Value'),
        elements: []
    });
    return classificationArray;
}

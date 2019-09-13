import { map as CLASSIFICATION_TYPE_MAP } from 'ingester/loinc/Mapping/LOINC_CLASSIFICATION_TYPE_MAP';
import { LOINC_CLASSIFICATION_MAPPING } from 'ingester/createMigrationConnection';
import { classifyItem } from 'shared/system/classificationShared';

export async function parseClassification(loinc, elt, classificationOrgName, classificationArray) {
    const basicAttributes = loinc['Basic Attributes'];
    if (!basicAttributes) {
        console.log('No Basic Attributes ' + loinc['LOINC Code']);
        process.exit(1);
    }
    const basicAttributesClass = basicAttributes.Class;
    const basicAttributesType = basicAttributes.Type;

    const type = CLASSIFICATION_TYPE_MAP[basicAttributesType];
    if (!type) {
        console.log(basicAttributesType + ' is not in the map.');
        process.exit(1);
    }
    const foundLoincClassification: any = await LOINC_CLASSIFICATION_MAPPING.findOne({
        Abbreviation: basicAttributesClass,
        Type: type
    });
    if (!foundLoincClassification) {
        console.log(`${loinc['LOINC Code']} ${type} ${basicAttributesClass} not in LOINC_CLASSIFICATION_MAPPING. See README and update the map.`);
        process.exit(1);
    }
    classifyItem(elt, classificationOrgName, classificationArray.concat([foundLoincClassification.value]));
}

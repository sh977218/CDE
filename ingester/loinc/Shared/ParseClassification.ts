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
        console.log(`${loinc['LOINC Code']} has ${basicAttributesType} is not in the loinc classification type map.`);
        process.exit(1);
    }
    let foundLoincClassification: any = await LOINC_CLASSIFICATION_MAPPING.findOne({
        Abbreviation: basicAttributesClass,
        Type: type
    }).lean();
    if (!foundLoincClassification) {
        const errMsg = `${loinc['LOINC Code']} ${type} ${basicAttributesClass} not in LOINC_CLASSIFICATION_MAPPING.`;
        classificationOrgName = 'LOINC(TEST)';
        console.log(errMsg);
        foundLoincClassification = {Value: `LOINC(TEST) ${type} ${basicAttributesClass}`};
    }
    classifyItem(elt, classificationOrgName, classificationArray.concat([foundLoincClassification.Value]));
}

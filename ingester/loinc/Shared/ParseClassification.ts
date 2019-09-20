import { classifyItem } from 'shared/system/classificationShared';

export async function parseClassification(loinc, elt, classificationOrgName, classificationArray) {
    classifyItem(elt, classificationOrgName, classificationArray);
}

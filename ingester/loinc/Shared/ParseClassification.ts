import { classifyItem } from 'shared/system/classificationShared';

export async function parseClassification(elt, classificationOrgName, classificationArray) {
    classifyItem(elt, classificationOrgName, classificationArray);
}

import { classifyItem } from 'server/classification/orgClassificationSvc';

export async function parseClassification(elt, classificationOrgName, classificationArray) {
    classifyItem(elt, classificationOrgName, classificationArray);
}

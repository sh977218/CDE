import { mergeClassificationByOrg } from 'ingester/shared/utility';

export function parseNinrClassification() {
    const classification = [];
    classification.push({
        stewardOrg: {
            name: 'NINR',
        },
        elements: [{
            name: 'Social Determinants of Health',
            elements: []
        }]

    });
    return classification;
}

export function addNinrClassification(existingCde, newCdeObj) {
    mergeClassificationByOrg(existingCde, newCdeObj, 'NINR');
}

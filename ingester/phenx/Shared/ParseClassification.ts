import { forEach, uniq } from 'lodash';

export function parseClassification(measure) {
    let classification = [{stewardOrg: {name: 'PhenX'}, elements: []}];
    let classificationArray = measure.classification;
    let uniqueClassifications = uniq(classificationArray);

    let elements = classification[0].elements;
    forEach(uniqueClassifications, c => {
        elements.push({
            name: c,
            elements: []
        });
        elements = elements[0].elements;
    });
    return classification;
}
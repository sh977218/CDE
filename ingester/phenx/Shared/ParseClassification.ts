import { forEach, uniq } from 'lodash';

export function parseClassification(protocol) {
    let classification = [{stewardOrg: {name: 'PhenX'}, elements: []}];
    let classificationArray = protocol.classification.split('»').map(s => s.trim());

    let uniqueClassifications = uniq(classificationArray).filter(c => c !== 'Home' && c !== 'Protocols');

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
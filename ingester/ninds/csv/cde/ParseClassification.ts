import { isEmpty } from 'lodash';
import { getCell } from 'ingester/ninds/csv/shared/utility';

function parseClassificationFromKeys(row, keys) {

    keys.forEach(k => {
        let classificationValue = row[k];
    });
}

export function parseClassification(row) {
    const classification = [{
        stewardOrg: {name: 'NINDS'},
        elements: [{
            name: 'Preclinical TBI',
            elements: []
        }]
    }];
    const allKeys = Object.keys(row);
    const populationKeys = allKeys.filter(k => k.indexOf('population.') !== -1);
    const domainKeys = allKeys.filter(k => k.indexOf('domain.') !== -1);
    const classificationKeys = allKeys.filter(k => k.indexOf('classification.') !== -1);
    const taxonomyString = getCell(row, 'Taxonomy');

    if (!isEmpty(taxonomyString)) {
        const taxonomyArray = taxonomyString.split(';').filter(t => t);
        if (taxonomyArray.length > 0) {
            classification[0].elements[0].elements.push({name: 'Taxonomy', elements: []});
        }
        taxonomyArray.forEach(t => {
            classification[0].elements[0].elements[0].elements.push({name: t, elements: []});
        });
    }
    return classification;
}

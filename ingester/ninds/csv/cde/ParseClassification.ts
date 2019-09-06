import { isEmpty } from 'lodash';
import { getCell } from 'ingester/ninds/csv/shared/utility';


export function parseClassification(row) {
    const classification = [{
        stewardOrg: {name: 'NINDS'},
        elements: [{
            name: 'Preclinical TBI',
            elements: []
        }]
    }];
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

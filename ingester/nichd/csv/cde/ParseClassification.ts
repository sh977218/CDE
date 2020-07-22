import { isEmpty, trim } from 'lodash';

export function parseNichdClassification() {
    const classification = [{
        stewardOrg: {
            name: 'NICHD',
        },
        elements: [{
            name: 'NBSTRN Krabbe Disease',
            elements: []
        }]
    }];
    return classification;
}

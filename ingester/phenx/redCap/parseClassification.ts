import { trim } from 'lodash';

export function parseClassification(protocol) {
    return [{
        stewardOrg: {name: 'PhenX'},
        elements: [{
            name: 'Domain',
            elements: [{
                name: trim(protocol.domainCollection)
            }]
        }]
    }];

}

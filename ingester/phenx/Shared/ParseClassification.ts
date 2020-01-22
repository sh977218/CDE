export function parseClassification(protocol) {
    const classification = [{
        stewardOrg: {name: 'PhenX'},
        elements: [{
            name: protocol.domainCollection,
            elements: []
        }]
    }];

    return classification;
}

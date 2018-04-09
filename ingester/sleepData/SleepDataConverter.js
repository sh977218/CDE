let mongo_data = require('../../server/system/mongo-data');
let UOM_MAP = require('./UOM_MAP').UOM_MAP;

exports.SleepDataConverter = function () {
};

exports.SleepDataConverter.prototype.convert = function (sleep, classification, DOMAINS) {
    let cde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: 'NSRR'},
        registrationState: {registrationStatus: 'Incomplete'},
        naming: [{
            designation: sleep.display_name,
            definition: sleep.description
        }],
        ids: [{id: sleep.id}],
        properties: [],
        valueDomain: {
            uom: '',
            datatype: 'Text',
            permissibleValues: []
        },
        classification: [{
            stewardOrg: {
                name: 'NSRR',
            },
            elements: [{name: classification, elements: []}]
        }]
    };

    let units = sleep.units;
    let uom = UOM_MAP[units.trim()];
    if (uom) cde.valueDomain.uom = uom;
    else if (uom !== '') console.log('unmapped unit: ' + units);

    let type = sleep.type.trim();
    if (type === 'choices') {
        cde.valueDomain.datatype = 'Value List';
        let domain = sleep.domain;
        if (domain) {
            cde.valueDomain.permissibleValues = DOMAINS[domain];
        }
    } else if (type === 'numeric' || type === 'integer') {
        cde.valueDomain.datatype = 'Number';
    } else if (type === 'time' || type === 'Date') {
        cde.valueDomain.datatype = 'Date';
    } else if (type === 'text' || type === 'string' || type === 'identifier') {
        cde.valueDomain.datatype = 'Text';
    } else console.log('unmapped type: ' + type);

    let labels = sleep.labels.trim();
    if (labels)
        cde.properties.push({
            key: 'labels',
            value: sleep.labels
        });
    return cde;
};


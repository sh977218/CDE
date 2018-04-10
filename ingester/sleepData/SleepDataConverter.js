let mongo_data = require('../../server/system/mongo-data');

exports.SleepDataConverter = function () {
};

exports.SleepDataConverter.prototype.convert = function (sleep, classification, VARIABLES, DOMAINS) {
    let cde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: 'NSRR'},
        registrationState: {registrationStatus: 'Incomplete'},
        naming: [],
        ids: [],
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

    let names = sleep.display_name;
    let definitions = sleep.definition;
    if (names.length >= 1 && definitions.length >= 1) {
        cde.naming.push({
                designation: names[0],
                definition: definitions[0]
            }
        )
    }

    if (sleep.id.length === 1) {
        cde.ids.push({
            id: sleep.id[0]
        })
    }

    let pArray = [{key: 'equipment', value: sleep.equipment},
        {key: 'formula', value: sleep.formula},
        {key: 'time', value: sleep.time}];
    pArray.forEach(p => {
        if (p.value.length > 0) {
            cde.properties.push({
                key: p.key,
                value: p.value.join(',')
            });
        }
    });

    let shhs = sleep.shhs;
    if (shhs[0]) {
        let variable = VARIABLES[shhs[0]];
        let type = variable.type.trim();
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

        let units = variable.units;
        cde.valueDomain.uom = units.trim();
    }

    return cde;
};


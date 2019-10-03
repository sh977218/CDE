let mongo_data = require('../../server/system/mongo-data');

exports.SleepDataConverter = function () {
};

exports.SleepDataConverter.prototype.convert = function (sleep, classification, VARIABLES, DOMAINS) {
    let cde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: 'NSRR'},
        registrationState: {registrationStatus: 'Incomplete'},
        naming: [],
        designations: [],
        definitions: [],
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
        }],
        dataSets: [{
            stringType: 'Sleep Data',
            studyUri: "https://sleepdata.org/datasets/shhs"
        }]
    };

    let designations = sleep.display_name;
    if (designations.length >= 1 && designations.length >= 1) {
        cde.designations.push({
            designation: designations[0],
            tags: []
        });
    }
    let definitions = sleep.definition;
    if (definitions.length >= 1 && definitions.length >= 1) {
        cde.definitions.push({
            definition: definitions[0],
            tags: []
        });
    }

    if (designations.length >= 1 && definitions.length >= 1) {
        cde.naming.push({
            designation: designations[0],
            definition: definitions[0],
            tags: []
        });
    }
    if (sleep && sleep.id && sleep.id.length === 1) {
        cde.ids.push({
            source: 'NSSR',
            id: sleep.id[0]
        })
    } else {
        process.exit(1);
    }
    sleep.shhs.forEach(s => {
        cde.ids.push({
            source: 'NSSR_shhs',
            id: s
        })
    });

    let pArray = [
        {key: 'equipment', value: sleep.equipment},
        {key: 'formula', value: sleep.formula},
        {key: 'time', value: sleep.time},
        {key: 'method', value: sleep.method},
        {key: 'source', value: sleep.source}
    ];
    pArray.forEach(p => {
        let pValue = p.value.join(',');
        if (pValue.length > 0) {
            cde.properties.push({
                key: p.key,
                value: pValue
            });
        }
    });

    let shhs = sleep.shhs;
    if (shhs[0]) {
        let variable = VARIABLES[shhs[0]];
        if (variable) {
            cde.designations.push({
                designation: variable.display_name,
                tags: ['Question Text']
            });
            cde.definitions.push({
                definition: variable.description,
                tags: ['Question Text']
            });

            cde.naming.push({
                designation: variable.display_name,
                definition: variable.description,
                tags: ['Question Text']
            });

            let type = variable.type.trim();
            if (type === 'choices') {
                cde.valueDomain.datatype = 'Value List';
                let domain = variable.domain;
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
    }

    sleep.category.forEach(c => {
        let dashIndex = c.indexOf('-');
        if (dashIndex > -1) c = c.substr(dashIndex + 1, c.length);
        cde.classification[0].elements[0].elements.push({name: c.trim(), elements: []})
    });

    return cde;
}
;


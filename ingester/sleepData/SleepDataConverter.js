var mongo_data = require('../../server/system/mongo-data');

var unmappedUnits = [];
var unmappedType = [];

var UOM_MAP = {
    '': '',
    'days from index date': '',
    'number of events': '',
    'days': '',
    'years': '',
    'milliseconds': '',
    'seconds from start of recording': '',
    'milliseconds squared': '',
    'beats per minute': '',
    'percent': '',
    'car accidents': '',
    'millimeters of mercury': '',
    'naps': '',
    'hours': '',
    'miles': '',
    'kilograms per square meter': '',
    'centimeters': '',
    'kilograms': '',
    'index': '',
    'milligrams per deciliter': '',
    'millimeters': '',
    'liters': '',
    'events per hour': '',
    'seconds': '',
    'central apnea events': '',
    'pack years': '',
    'cans': '',
    'arousals': '',
    'oxygen desaturation events': '',
    'obstructive apnea event': '',
    'minutes': '',
    'stage shifts': '',
    'microvolts squared per hertz': '',
    'obstructive apnea events': '',
    'hypopnea events': '',
    'cups': '',
    'drinks': '',
    'cigarettes': '',
    'drinks per day': '',
    'glasses': '',
    'bottles': '',
    'cigars': '',
    'bowls': '',
    'hertz': '',
    'cigarettes per day': '',
    'kilograms per meter squared': '',
    'readings': '',
    'picograms per milliliter': '',
    'micrograms per milliliter': '',
    'nanograms per milliliter': '',
    'periods': '',
    'ovaries': '',
    'days per week,days per week': '',
    'micro-units per milliliter': '',
    'units per liter': '',
    'degrees': '',
    'events': '',
    'central apneas': '',
    'obstructive apneas': '',
    'desaturations per hour': '',
    'minutes per day': '',
    'medications': '',
    'missing items': '',
    'days per week': ''
};

// exports.SleepDataConverter = function () {
//
// };

exports.SleepDataConverter.prototype.convert = function (sleep, DOMAINS) {

    let cde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: 'NSRR'},
        registrationState: {registrationStatus: 'Incomplete'},
        naming: [{
            designation: sleep.display_name,
            definition: sleep.description,
            tags: sleep.labels.split(';')
        }],
        ids: [{id: sleep.id}],
        valueDomain: {
            uom: '',
            datatype: 'Text',
            permissibleValues: []
        },
        classification: [{
            stewardOrg: {
                name: 'NSRR'
            }
        }]
    };

    let units = sleep.units;
    let uom = UOM_MAP[units.trim()];
    if (uom) {
        cde.valueDomain.uom = uom;
    } else if (uom !== '') {
        unmappedUnits.push(units);
    }

    let type = sleep.type.trim();
    if (type === 'choices') {
        cde.valueDomain.datatype = 'Value List';
        let domain = sleep.domain;
        if (domain) {
            cde.valueDomain.permissibleValues = DOMAINS[domain];
        }
    } else if (type === 'numeric' || type === 'integer') {
        cde.valueDomain.datatype = 'Number';
    } else if (type === 'time') {
        cde.valueDomain.datatype = 'Date';
    } else if (type === 'text' || type === 'string' || type === 'identifier') {
        cde.valueDomain.datatype = 'Text';
    } else unmappedType.push(type);

    return cde;
};


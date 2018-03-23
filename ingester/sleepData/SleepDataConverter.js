var mongo_data = require('../../server/system/mongo-data');

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
    'days per week': '',
    'percentage of oxygen saturation': '',
    'hour': '',
    'milligrams per decaliter': '',
    'grams per liter': '',
    'milligrams per liter': '',
    'microliters': '',
    'meters per second': '',
    'ohms': '',
    'samples': '',
    'cigars per day': '',
    'pipes': '',
    'weeks': '',
    'accidents': '',
    'pounds': '',
    'years from index date': '',
    'ppm': '',
    'limb movements': '',
    'limb movements per hour': '',
    'percentage of oxygen saturation': '',
    'ohms': '',
    'micrograms per deciliter': '',
    'milliliters per minute': '',
    'micrograms per liter': '',
    'micrograms': '',
    'centimeters (cm)': '',
    'kilograms per meter squared (kg/m2)': '',
    'millimeters (mm)': '',
    'kilograms (kg)': '',
    'beats per minute (bpm)': '',
    'millimeters of mercury (mmHg)': '',
    'minutes (min)': '',
    'drinks per week': '',
    'percent (%)': '',
    'seconds (s)': '',
    'minutes (min)': '',
    'seconds (s)': '',
    'hours (h)': '',
    'periodic limb movements': '',
    'hertz (Hz)': '',
    'microvolts squared per hertz (uV2/Hz)': '',
    'beers': '',
    'pipe bowls': '',
    'pipes/cigars': '',
    'desaturation events': '',
    'kilograms per meters squared (kg/m2)': '',
    'nights': '',
    'arousals per hour': '',
    'sleep bouts': '',
    'naps per day': '',
    'activity counts': '',
    'wake bouts': '',
    'good days': '',
    'weekend days': '',
    'non-workdays': '',
    'reliable days': '',
    'centimeters of water': '',
    'mmol per mol': '',
    'packs': '',
    'hours per day': '',
    'micrograms to milligrams': '',
    'milliliters': '',
    'micrograms per microliter': '',
    'snacks': '',
    'grams per day': '',
    'kilocalories per day': '',
    'minutes per week': '',
    'workdays': '',
    'invalid nights': '',
    'valid nights': '',
    'days since enrollment': '',
    'kilograms per meters squared': '',
    'naps per weekday': '',
    'lux': '',
    'workdays': '',
    'bouts': '',
    'counts per minute': '',
    'decibels': ''
};

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
    } else if (type === 'time') {
        cde.valueDomain.datatype = 'Date';
    } else if (type === 'text' || type === 'string' || type === 'identifier') {
        cde.valueDomain.datatype = 'Text';
    } else if (type === 'date') {
        cde.valueDomain.datatype = 'Date';
    } else console.log('unmapped type: ' + type);

    let labels = sleep.labels.trim();
    if (labels)
        cde.properties.push({
            key: 'labels',
            value: sleep.labels
        });
    return cde;
};


import { isEmpty } from 'lodash';
import { QuestionTypeNumber, QuestionTypeText } from 'shared/de/dataElement.model';
import { getCell } from 'ingester/ninds/csv/shared/utility';

const UOM_MAP: any = {
    '': '',
    Tesla: 'tesla',
    millisecond: 'ms',
    degree: 'degree',
    Hertz: 'hz',
    'degree of arc': 'degree of arc',
    'centimeter per second': 'cm/s',
    'milliliter per minute': 'ml/min',
    decibel: 'decibel',
    Inches: 'in',
    Centimeters: 'cm',
    kilogram: 'kg',
    'degree Celsius': 'degree Celsius',
    'beats per minute': 'beats/min',
    'breaths per minute': 'breaths/min',
    'millimeter of mercury': 'mm/mercury',
    feet: 'ft',
    Centimeter: 'cm',
    year: 'yr',
    Year: 'yr',
    month: 'mo',
    'grams per deciliter': 'gm/dl',
    picograms: 'picograms',
    femtoliter: 'femtoliter',
    'million cells per microliter': 'mc/ml',
    'thousand cells per microliter': 'kc/ml',
    medication: 'medication',
    Day: 'd',
    'milligram per liter': 'mg/l',
    Gram: 'g',
    unit: 'unit',
    Minute: 'min',
    liter: 'l',
    meter: 'm',
    'milligram per gram': 'mg/g',
    'Count per microliter': 'c/ml',
    Percentage: '%',
    'nanogram per milliliter': 'ng/ml',
    'milliliter per minute per 1.73 meter^2': 'ml/min/1.74 m^2',
    Times: 'times',
    'cubic millimeter': 'm^3',
    minute: 'min',
    'unit per liter': 'unit/l',
    second: 's',
    centimeter: 'cm',
    lx: 'lx',
    Hour: 'h',
    Millimeter: 'mm',
    millimeter: 'mm',
    'milligram per deciliter': 'mg/dl',
    'milliliter per minute per 1.73 square meters': 'ml/min/1.73 m^2',
    'Degree Celsius': 'Cel',
    milligram: 'mg',
    Decibel: 'cB',
    milliAmpere: 'mA',
    hours: 'h',
    hour: 'h',
    'units per liter': 'u/l',
    percentage: '%',
    Newton: 'N',
    day: 'd',
    gram: 'g',
    mm: 'mm',
    cm: 'cm',
    percent: '%',
    days: 'd',
    'Meter per second': 'm/s',
    'Hour per Day': 'h/d',
    minutes: 'min',
    'hour:minutes': 'h:m',
    'cm/s': 'cm/s',
    s: 's',
    Second: 's',
    mA: 'mA',
    Hz: 'Hz',
    ms: 'ms',
    Millisecond: 'ms',
    Minutes: 'min',
    Seconds: 's',
    Meter: 'm',
    millimeters: 'mm',
    centimeters: 'cm',
    'hh:mm': 'h:m',
    'RPM/s': 'RPM/s',
    RPM: 'RPM',
    Month: 'mo',
    'Centimeter per second': 'cm/s',
    kHz: 'kHz',
    dB: 'dB',
    Celcius: 'Cel',
    integer: 'integer',
    count: 'count',
    Degree: 'Degree',
    Microliters: 'uL',
    Days: 'd',
    Chambers: '',
};

const DATA_TYPE_MAP: any = {
    Alphanumeric: 'Text',
    'Date or Date & Time': 'Date',
    'Numeric Values': 'Number',
    Numeric: 'Number',
    'numeric Values': 'Number',
    'Numeric values': 'Number',
    Time: 'Text',
    alphanumeric: 'Text',
    GUID: 'Text',
    File: 'File'
};

export function parseValueDomain(row: any) {
    const unitOfMeasure = getCell(row, 'Unit of Measure');
    const uom = UOM_MAP[unitOfMeasure];
    if (uom === undefined) {
        console.log(`${unitOfMeasure} is not in the uom map.`);
        process.exit(1);
    }
    const valueDomain: any = {
        uom,
        permissibleValues: []
    };

    const inputRestrictionString = getCell(row, 'Input Restriction').toLowerCase();

    const valueListInputRestriction = ['single pre-defined value selected', 'multiple pre-defined values selected'];
    if (valueListInputRestriction.indexOf(inputRestrictionString) !== -1) {
        valueDomain.datatype = 'Value List';
        const permissibleValueString = getCell(row, 'Permissible Values');
        const permissibleValueOutputCodes = getCell(row, 'Permissible Value Output Codes');
        if (permissibleValueString) {
            const permissibleValueArray = permissibleValueString.split(';').filter(t => t);
            const pvCodes = permissibleValueOutputCodes.split(';').filter(t => t);
            permissibleValueArray.forEach((pv: any, i) => {
                const permissibleValue: any = {
                    permissibleValue: pvCodes[i] ? pvCodes[i] : pv,
                    valueMeaningName: pv
                };
                valueDomain.permissibleValues.push(permissibleValue);
            });
        } else {
            console.log('bad pvs');
            process.exit(1);
        }
    } else {
        const datatypeString = getCell(row, 'Datatype');
        const datatype = DATA_TYPE_MAP[datatypeString];

        if (isEmpty(datatype)) {
            console.log(`${datatypeString} is not in data type map.`);
            process.exit(1);
        }

        if (datatype === 'Text') {
            valueDomain.datatype = 'Text';
            const datatypeText: QuestionTypeText = {};
            const maximumCharacterQuantity = getCell(row, 'Maximum Character Quantity');
            const maximumCharacterQuantityNumber = Number(maximumCharacterQuantity);
            if (!isNaN(maximumCharacterQuantityNumber)) {
                datatypeText.maxLength = maximumCharacterQuantityNumber;
            }
            if (!isEmpty(datatypeText)) {
                valueDomain.datatypeText = datatypeText;
            }
        }
        if (datatype === 'Number') {
            valueDomain.datatype = 'Number';
            const datatypeNumber: QuestionTypeNumber = {};
            const minimumValue = getCell(row, 'Minimum Value');
            const minimumValueNumber = Number(minimumValue);
            if (!isNaN(minimumValueNumber)) {
                datatypeNumber.minValue = minimumValueNumber;
            }
            const maximumValue = getCell(row, 'Maximum Value');
            const maximumValueNumber = Number(maximumValue);
            if (!isNaN(maximumValueNumber)) {
                datatypeNumber.maxValue = maximumValueNumber;
            }
            if (!isEmpty(datatypeNumber)) {
                valueDomain.datatypeNumber = datatypeNumber;
            }
        }
    }

    return valueDomain;
}

export function parseNhlbiValueDomain(row: any) {
    const unitOfMeasure = getCell(row, 'Measurement Type');
    const uom = UOM_MAP[unitOfMeasure];
    if (uom === undefined) {
        console.log(`${unitOfMeasure} is not in the uom map. NhlbiValueDomain`);
        /*
                process.exit(1);
        */
    }
    const valueDomain: any = {
        uom,
        permissibleValues: []
    };

    const inputRestrictionString = getCell(row, 'Input Restrictions').toLowerCase();
    const datatypeString = getCell(row, 'Data Type');

    const valueListInputRestriction = ['Single Pre-Defined Value Selected', 'Multiple Pre-Defined Values Selected']
        .map(i => i.toLowerCase());
    if (valueListInputRestriction.indexOf(inputRestrictionString) !== -1) {
        valueDomain.datatype = 'Value List';
        const permissibleValueString = getCell(row, 'Permissible Values');
        const permissibleValueOutputCodes = getCell(row, 'Permissible Value Descriptions');
        if (permissibleValueString) {
            const permissibleValueArray = permissibleValueString.split(';').filter(t => t);
            const pvCodes = permissibleValueOutputCodes.split(';').filter(t => t);
            permissibleValueArray.forEach((pv: any, i) => {
                const permissibleValue: any = {
                    permissibleValue: pvCodes[i] ? pvCodes[i] : pv,
                    valueMeaningName: pv
                };
                valueDomain.permissibleValues.push(permissibleValue);
            });
        } else {
            const variableName = getCell(row, 'Name');
            console.log(`bad pvs: name '${variableName}' inputRestriction '${inputRestrictionString}'  datatype: '${datatypeString}' permissibleValue '${permissibleValueString}' permissibleValueDescriptions '${permissibleValueOutputCodes}' `);
            // @TODO remove, this is temp fix.
            valueDomain.datatype = 'Text';
//            process.exit(1);
        }
    } else {
        let datatype = DATA_TYPE_MAP[datatypeString];
        if (isEmpty(datatype)) {
            console.log(`${datatypeString} is not in data type map.`);
            datatype = 'Text';
        }

        if (datatype === 'Text') {
            valueDomain.datatype = 'Text';
            const datatypeText: QuestionTypeText = {};
            const maximumCharacterQuantity = getCell(row, 'Maximum Character Quantity');
            const maximumCharacterQuantityNumber = Number(maximumCharacterQuantity);
            if (!isNaN(maximumCharacterQuantityNumber)) {
                datatypeText.maxLength = maximumCharacterQuantityNumber;
            }
            if (!isEmpty(datatypeText)) {
                valueDomain.datatypeText = datatypeText;
            }
        }
        if (datatype === 'Number') {
            valueDomain.datatype = 'Number';
            const datatypeNumber: QuestionTypeNumber = {};
            const minimumValue = getCell(row, 'Minimum Value');
            const minimumValueNumber = Number(minimumValue);
            if (!isNaN(minimumValueNumber)) {
                datatypeNumber.minValue = minimumValueNumber;
            }
            const maximumValue = getCell(row, 'Maximum Value');
            const maximumValueNumber = Number(maximumValue);
            if (!isNaN(maximumValueNumber)) {
                datatypeNumber.maxValue = maximumValueNumber;
            }
            if (!isEmpty(datatypeNumber)) {
                valueDomain.datatypeNumber = datatypeNumber;
            }
        }
    }

    return valueDomain;
}

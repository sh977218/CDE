import { isEmpty } from 'lodash';
import { QuestionTypeNumber, QuestionTypeText } from 'shared/de/dataElement.model';
import { getCell } from 'ingester/ninds/csv/shared/utility';

const UOM_MAP: any = {
    '': '',
    Centimeter: 'cm',
    Day: 'd',
    Gram: 'g',
    Minute: 'min',
    Percentage: '%',
    minute: 'min',
    second: 's',
    centimeter: 'cm',
    lx: 'lx',
    Hour: 'h',
    Millimeter: 'mm',
    'Degree Celsius': 'Cel',
    milligram: 'mg',
    Decibel: 'cB',
    milliAmpere: 'mA',
    hours: 'h',
    hour: 'h',
    percentage: '%',
    Newton: 'N',
    day: 'd',
    gram: 'g',
    mm: 'mm',
    cm: 'cm',
    percent: '%',
    days: 'd',
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
        console.log(`${unitOfMeasure} is not in the uom map.`);
        process.exit(1);
    }
    const valueDomain: any = {
        uom,
        permissibleValues: []
    };

    const inputRestrictionString = getCell(row, 'Input Restrictions').toLowerCase();

    const valueListInputRestriction = ['Single Pre-Defined Value Selected', 'Multiple Pre-Defined Values Selected'];
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
            console.log('bad pvs');
            process.exit(1);
        }
    } else {
        const datatypeString = getCell(row, 'Data Type');
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

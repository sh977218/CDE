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
    GUID: 'Text'
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
            if (!isEmpty(maximumCharacterQuantity)) {
                datatypeText.maxLength = Number(maximumCharacterQuantity);
            }
            if (!isEmpty(datatypeText)) {
                valueDomain.datatypeText = datatypeText;
            }
        }
        if (datatype === 'Number') {
            valueDomain.datatype = 'Number';
            const datatypeNumber: QuestionTypeNumber = {};
            const minimumValue = getCell(row, 'Minimum Value');
            if (!isEmpty(minimumValue)) {
                datatypeNumber.minValue = Number(minimumValue);
            }
            const maximumValue = getCell(row, 'Maximum Value');
            if (!isEmpty(maximumValue)) {
                datatypeNumber.maxValue = Number(maximumValue);
            }
            if (!isEmpty(datatypeNumber)) {
                valueDomain.datatypeNumber = datatypeNumber;
            }
        }
    }

    return valueDomain;
}

import { QuestionTypeText } from 'shared/de/dataElement.model';
import { DEFAULT_NHLBI_CONFIG, getCell } from 'ingester/nhlbi/shared/utility';
import { isEmpty } from 'lodash';

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

    'Time: Year': 'a',
    'Time: Hour': 'h',
    'Time: Day': 'd',
    'Time: Month': 'mo',
    'Time: Week': 'wk',
    'Time: Minute': 'min',
    'Time: Second': 's',
    'Pressure: Millimeters of Mercury': 'mm[Hg]',
    'Length: Centimeter': 'cm',
    'Percentage: Percentage': '%',
    'pH: pH': '[pH]',
    Count: '{count}',
    'Volume: Liters/minute': 'L/min',
    'Length: Millimeter': 'mm',
    'Rate: Meter per Second': 'm/s',
    'Area: Square Centimeter': 'cm2',
    'Pulmonary vascular resistance: dynes per second per centimeters to the negative fifth power': 'dyn/s/cm-5',
};

export function parseNhlbiValueDomain(row: any) {
    const isthId = getCell(row, DEFAULT_NHLBI_CONFIG.source);
    const unitOfMeasure = getCell(row, 'Measurement Type');

    let uom = UOM_MAP[unitOfMeasure];
    if (uom === undefined) {
        uom = getCell(row, 'Unit of Measure (UCUM)');
        if (uom === undefined) {
            console.log(`${unitOfMeasure} is not in the uom map, or mapped in CSV. NhlbiValueDomain`);
            process.exit(1);
        }
    }
    const valueDomain: any = {
        datatype: 'Text',
        uom,
        permissibleValues: [],
    };

    const datatype = getCell(row, 'CDE-R Data Type');

    if (datatype === 'Value List') {
        valueDomain.datatype = 'Value List';
        const permissibleValueString = getCell(row, 'Permissible Values');
        if (permissibleValueString) {
            const permissibleValueArray = permissibleValueString.split(';').filter(t => t);
            permissibleValueArray.forEach((pv: any, i) => {
                const permissibleValue: any = {
                    permissibleValue: pv,
                    valueMeaningName: pv,
                };
                valueDomain.permissibleValues.push(permissibleValue);
            });
        } else {
            console.log(
                `Error: bad pvs: ISTH ID '${isthId}' datatype: '${datatype}' permissibleValue '${permissibleValueString}'`
            );
            process.exit(1);
        }
    } else if (datatype === 'Text') {
        valueDomain.datatype = 'Text';
        const datatypeText: QuestionTypeText = {};
        if (!isEmpty(datatypeText)) {
            valueDomain.datatypeText = datatypeText;
        }
    } else if (datatype === 'Number') {
        valueDomain.datatype = 'Number';
    } else if (datatype === 'Date') {
        valueDomain.datatype = 'Date';
    } else {
        console.log(`Error: Unknown data type: ISTH ID '${isthId}' datatype: '${datatype}'`);
        process.exit(1);
    }

    return valueDomain;
}

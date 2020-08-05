import { isEmpty, trim } from 'lodash';
import { map as RED_CAP_DATA_TYPE_MAP, validationTypeMap as VALIDATION_TYPE_MAP } from './REDCAP_DATATYPE_MAP';

export function parseValueDomain(row) {
    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };

    const fieldNote = trim(row['Field Note']);
    if (fieldNote) {
        const uomIndex = fieldNote.indexOf('| |');
        if (uomIndex !== -1) {
            valueDomain.uom = fieldNote.substr(0, uomIndex).trim();
        }
    }

    const fieldType = trim(row['Field Type']);
    const validationType = trim(row['Text Validation Type OR Show Slider Number']);
    const choicesCalculationsORSliderLabels = trim(row['Choices, Calculations, OR Slider Labels']);
    const datatype = RED_CAP_DATA_TYPE_MAP[fieldType];
    if (datatype) {
        valueDomain.datatype = datatype;
    } else {
        console.log('Unknown datatype: ' + fieldType);
        process.exit(1);
    }

    if (datatype === 'Text') {
        const _datatype = VALIDATION_TYPE_MAP[validationType];
        if (!isEmpty(_datatype)) {
            valueDomain.datatype = _datatype;
        }
    } else if (datatype === 'Date') {
        valueDomain.datatypeDate = {
            format: validationType.replace('date_', '')
        };
    } else if (datatype === 'Number') {
        valueDomain.datatypeNUmber = {
            precision: validationType === 'integer' ? 2 : 0
        };
        const textValidationMin = row['Text Validation Min'].trim();
        const textValidationMax = row['Text Validation Max'].trim();
        if (textValidationMin.length > 0) {
            valueDomain.datatypeNUmber.minValue = parseInt(textValidationMin, 10);
        }
        if (textValidationMax.length > 0) {
            valueDomain.datatypeNUmber.maxValue = parseInt(textValidationMax, 10);
        }
    } else if (datatype === 'Value List') {
        if (fieldType === 'yesno') {
            valueDomain.permissibleValues = [{
                permissibleValue: '1',
                valueMeaningName: 'Yes'
            }, {
                permissibleValue: '0',
                valueMeaningName: 'No'
            }];
        } else {
            if (!isEmpty(choicesCalculationsORSliderLabels)) {
                const permissibleValues = [];
                const pvArray = choicesCalculationsORSliderLabels.split('|');
                pvArray.forEach(pvText => {
                    if (pvText) {
                        const commaIndex = pvText.indexOf(',');
                        const permissibleValue = pvText.substr(0, commaIndex);
                        const valueMeaningName = pvText.substr(commaIndex + 1, pvText.length - 1);
                        permissibleValues.push({
                            permissibleValue: permissibleValue.trim(),
                            valueMeaningName: valueMeaningName.trim()
                        });
                    }
                });
                valueDomain.permissibleValues = permissibleValues;
            } else {
                valueDomain.datatype = 'Text';
            }
        }
    } else if (datatype === 'File') {
        valueDomain.datatype = 'File';
    } else {
        throw new Error('Unknown datatype: ' + fieldType);
    }

    return valueDomain;
}

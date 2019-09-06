import { isEmpty } from 'lodash';
import { map as RED_CAP_DATA_TYPE_MAP } from './REDCAP_DATATYPE_MAP';

export function parseValueDomain(row) {
    let valueDomain: any = {};

    let fieldNote = row['Field Note'].trim();
    let uomIndex = fieldNote.indexOf('| |');
    if (uomIndex !== -1) valueDomain.uom = fieldNote.substr(0, uomIndex).trim();

    let fieldType = row['Field Type'].trim();
    let validationType = row['Text Validation Type OR Show Slider Number'];
    let choicesCalculationsORSliderLabels = row['Choices, Calculations, OR Slider Labels'];
    if (validationType) validationType = validationType.trim();
    let datatype = RED_CAP_DATA_TYPE_MAP[fieldType];
    valueDomain.datatype = datatype;
    if (datatype === 'Date') {
        valueDomain.datatypeDate = {
            format: validationType.replace('date_', '')
        }
    } else if (datatype === 'Number') {
        valueDomain.datatypeNUmber = {
            precision: validationType === 'integer' ? 2 : 0
        };
        let textValidationMin = row['Text Validation Min'].trim();
        let textValidationMax = row['Text Validation Max'].trim();
        if (textValidationMin.length > 0) {
            valueDomain.datatypeNUmber.minValue = parseInt(textValidationMin);
        }
        if (textValidationMax.length > 0) {
            valueDomain.datatypeNUmber.maxValue = parseInt(textValidationMax);
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
                let permissibleValues = [];
                let pvArray = choicesCalculationsORSliderLabels.split('|');
                pvArray.forEach(pvText => {
                    if (pvText) {
                        let commaIndex = pvText.indexOf(',');
                        let permissibleValue = pvText.substr(0, commaIndex);
                        let valueMeaningName = pvText.substr(commaIndex + 1, pvText.length - 1);
                        permissibleValues.push({
                            permissibleValue: permissibleValue.trim(),
                            valueMeaningName: valueMeaningName.trim()
                        })
                    }
                });
                valueDomain.permissibleValues = permissibleValues;
            } else {
                valueDomain.datatype = 'Text';
            }
        }
    } else if (datatype === 'Text') {
        if (validationType.trim() === 'number') {
            valueDomain.datatype = 'Number';
        }

    } else if (datatype === 'File') {
    } else {
        throw 'Unknow datatype: ' + fieldType;
    }
    return valueDomain;
}
import { externalCodeSystemsMap } from 'shared/mapping/fhir/index';

export function isCodingToValueList(container, coding) {
    function isCodingInContainer(container, c) {
        let pvs = Array.isArray(container.answers) ? container.answers : container.permissibleValues;
        return pvs.some(pv => pv.permissibleValue === c.code && externalCodeSystemsMap[pv.codeSystemName] === c.system);
    }
    if (Array.isArray(coding)) {
        return coding.every(c => isCodingInContainer(container, c));
    } else {
        return isCodingInContainer(container, coding);
    }
}

export function isItemTypeToContainer(container, type) { // http://hl7.org/fhir/item-type
    // NOT IMPLEMENTED: boolean, time, url, open-choice(choice+string), attachment, reference
    switch (type) {
        case 'display':
            return container.isScore;
        case 'choice':
            return container.datatype === 'Value List';
        case 'date':
            return container.datatype === 'Date' && ['Hour', 'Minute', 'Second'].indexOf(container.datatypeDate.precision) <= -1;
        case 'dateTime':
            return container.datatype === 'Date' && ['Hour', 'Minute', 'Second'].indexOf(container.datatypeDate.precision) > -1;
        case 'quantity':
            return container.datatype === 'Number'
                && (Array.isArray(container.unitsOfMeasure) && container.unitsOfMeasure.length || container.uom);
        case 'decimal':
            return container.datatype === 'Number'
                && (!container.datatypeNumber || typeof(container.datatypeNumber.precision) !== 'number'
                    || container.datatypeNumber.precision < 0);
        case 'integer':
            return container.datatype === 'Number'
                && !(!container.datatypeNumber || typeof(container.datatypeNumber.precision) !== 'number'
                    || container.datatypeNumber.precision < 0);
        case 'text':
            return ['Value List', 'Date', 'Number'].indexOf(container.datatype) <= -1
                && container.datatypeText && container.datatypeText.showAsTextArea;
        case 'string':
            return ['Value List', 'Date', 'Number'].indexOf(container.datatype) <= -1
                && !(container.datatypeText && container.datatypeText.showAsTextArea);
        default:
            return false;
    }
}

export function quantityToUnitsOfMeasure(container, quantity) {
    if (Array.isArray(container.unitsOfMeasure)) {
        let matches = container.unitsOfMeasure.filter(u => quantity.code === u.code
            && (quantity.system ? quantity.system === externalCodeSystemsMap[u.system] : !u.system));
        return matches.length ? matches[0] : undefined;
    } else {
        return container.uom === quantity.unit ? container.uom : undefined;
    }
}

export function typedValueToValue(container, type, v) {
    if (!isItemTypeToContainer(container, type)) {
        return false;
    }
    switch (type) {
        case 'display':
            return true;
        case 'choice':
            let coding = typeof(v.valueCoding) !== 'undefined' ? v.valueCoding : v.valueCodeableConcept.coding;
            if (!isCodingToValueList(container, coding)) {
                return false;
            }
            if (Array.isArray(coding)) {
                if (container.multiselect) {
                    container.answer = coding.map(c => c.code);
                } else {
                    container.answer = coding.length ? coding[0].code : undefined;
                }
            } else {
                if (container.multiselect) {
                    container.answer = [coding.code];
                } else {
                    container.answer = coding.code;
                }
            }
            return true;
        case 'boolean':
            container.answer = v.valueBoolean ? '1' : '0';
            return true;
        case 'quantity':
            let unit = quantityToUnitsOfMeasure(container, v.valueQuantity);
            if (typeof(unit) === 'undefined') {
                return false;
            }
            container.answerUom = unit;
            container.answer = '' + v.valueQuantity.value;
            return true;
        case 'integer':
            container.answer = '' + v.valueInteger;
            return true;
        case 'decimal':
            container.answer = '' + v.valueDecimal;
            return true;
        case 'date':
            container.answer = v.valueDate;
            return true;
        case 'dateTime':
            container.answer = v.valueDateTime;
            return true;
        case 'string':
            container.answer = v.valueString;
            return true;
        case 'text':
            container.answer = v.valueText;
            return true;
        default:
            return false;
    }
}

export function valuedElementToItemType(elem) {
    if (typeof(elem.valueBoolean) !== 'undefined') return 'boolean';
    if (typeof(elem.valueCoding) !== 'undefined') return 'choice';
    if (typeof(elem.valueCodeableConcept) !== 'undefined') return 'choice';
    if (typeof(elem.valueDate) !== 'undefined') return 'date';
    if (typeof(elem.valueDateTime) !== 'undefined') return 'dateTime';
    if (typeof(elem.valueDecimal) !== 'undefined') return 'decimal';
    if (typeof(elem.valueInteger) !== 'undefined') return 'integer';
    if (typeof(elem.valueQuantity) !== 'undefined') return 'quantity';
    if (typeof(elem.valueString) !== 'undefined') return 'string';
    if (typeof(elem.valueText) !== 'undefined') return 'text';
    else return '';
}

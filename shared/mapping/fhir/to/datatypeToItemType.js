import { codeSystemOut } from 'shared/mapping/fhir/fhirDatatypes';
import { newCodeableConcept } from 'shared/mapping/fhir/datatypes/codeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatypes/coding';
import { capString } from 'shared/system/util';

export function containerToItemType(container) { // http://hl7.org/fhir/item-type
    // NOT IMPLEMENTED: boolean, time, url, open-choice(choice+string), attachment, reference
    if (container.isScore) return 'display';
    switch (container.datatype) {
        case 'Value List':
            return 'choice';
        case 'Date':
            return ['Hour', 'Minute', 'Second'].indexOf(container.datatypeDate.precision) > -1 ? 'dateTime' : 'date';
        case 'Number':
            if (Array.isArray(container.unitsOfMeasure) && container.unitsOfMeasure.length || container.uom) {
                return 'quantity';
            }
            return !container.datatypeNumber || typeof(container.datatypeNumber.precision) !== 'number' || container.datatypeNumber.precision < 0
                ? 'decimal' : 'integer';
        default:
            return container.datatypeText && container.datatypeText.showAsTextArea ? 'text' : 'string';
    }
}

export function containerValueListToCoding(container, value, multi = false) {
    function valueToCoding(container, v) {
        let pvs = Array.isArray(container.answers) ? container.answers : container.permissibleValues;
        let matches = pvs.filter(a => a.permissibleValue === v);
        if (matches.length) {
            return permissibleValueToCoding(matches[0]);
        }
        return {code: v};
    }
    if (Array.isArray(value)) {
        let result = value.map(v => valueToCoding(container, v));
        if (multi) {
            return result.length ? result : undefined;
        } else {
            return result.length ? result[0] : undefined;
        }
    } else {
        let result = valueToCoding(container, value);
        if (multi) {
            return [result];
        } else {
            return result;
        }
    }
}

export function itemTypeToItemDatatype(type, hasCodeableConcept = false) {
    if (type === 'choice') return hasCodeableConcept ? 'CodeableConcept' : 'Coding';
    return type;
}

export function permissibleValueToCoding(pv) {
    return newCoding(pv.codeSystemName, pv.permissibleValue, pv.codeSystemVersion,
        pv.valueMeaningName && pv.valueMeaningName !== pv.permissibleValue ? pv.valueMeaningName : undefined);
}

export function questionValueToFhirValue(q, container, hasCodeableConcept = false) {
    let qType = containerToItemType(q.question);
    container['value' + capString(itemTypeToItemDatatype(qType, hasCodeableConcept))]
        = valueToTypedValue(q.question, qType, q.question.answer, undefined, q.question.answerUom, hasCodeableConcept);
}

export function valueToQuantity(container, value, comparator, valueUom) {
    let quantity = {
        comparator: comparator && comparator !== '=' ? comparator : undefined,
        value: parseFloat(value),
    };
    if (Array.isArray(container.unitsOfMeasure)) {
        if (valueUom) {
            quantity.code = valueUom.code;
            quantity.system = valueUom.system;
        } else if (container.unitsOfMeasure.length) {
            quantity.code = container.unitsOfMeasure[0].code;
            quantity.system = container.unitsOfMeasure[0].system;
        }
        quantity.system = codeSystemOut(quantity.system);
    } else {
        quantity.unit = container.uom;
    }
    return quantity;
}

export function valueToTypedValue(container, type, value, comparator = '=', valueUom = undefined, hasCodeableConcept = false) {
    switch (type) {
        case 'choice':
            if (hasCodeableConcept) {
                let coding = containerValueListToCoding(container, value, true);
                return coding ? newCodeableConcept(coding) : undefined;
            }
            return containerValueListToCoding(container, value);
        case 'boolean':
            return !!value;
        case 'quantity':
            return valueToQuantity(container, value, comparator, valueUom);
        case 'integer':
            return parseInt(value);
        case 'decimal':
            return parseFloat(value);
        default: // handles date(with time) text
            return value;
    }
}

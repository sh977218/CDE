import { codeSystemOut } from 'shared/mapping/fhir';
import { newCodeableConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { CodeAndSystem, PermissibleValue } from 'shared/models.model';
import { DatatypeContainer, ValueDomain } from 'shared/de/dataElement.model';
import { FhirCoding, FhirQuantity } from 'shared/mapping/fhir/fhir.model';
import { Question } from 'shared/form/form.model';

export function containerToItemType(container: Question | ValueDomain): string { // http://hl7.org/fhir/item-type
    // NOT IMPLEMENTED: boolean, time, url, open-choice(choice+string), attachment, reference
    if ((container as Question).isScore) return 'display';
    switch (container.datatype) {
        case 'Value List':
            return 'choice';
        case 'Date':
            const precision = container.datatypeDate && container.datatypeDate.precision;
            return precision && ['Hour', 'Minute', 'Second'].indexOf(precision) > -1 ? 'dateTime' : 'date';
        case 'Number':
            if (Array.isArray((container as Question).unitsOfMeasure) && (container as Question).unitsOfMeasure.length || (container as ValueDomain).uom) {
                return 'quantity';
            }
            return !container.datatypeNumber || typeof(container.datatypeNumber.precision) !== 'number' || container.datatypeNumber.precision < 0
                ? 'decimal' : 'integer';
        default:
            return container.datatypeText && container.datatypeText.showAsTextArea ? 'text' : 'string';
    }
}

export function containerValueListToCoding(container: Question | ValueDomain, value: string | string[], multi: boolean = false): FhirCoding | FhirCoding[] | undefined {
    function valueToCoding(container: Question | ValueDomain, v: string) {
        let pvs = Array.isArray((container as Question).answers) ? (container as Question).answers : (container as ValueDomain).permissibleValues;
        let matches = (pvs || []).filter(a => a.permissibleValue === v);
        if (matches.length) {
            return permissibleValueToCoding(matches[0]);
        }
        return {code: v};
    }
    if (Array.isArray(value)) {
        let result = value.map(v => valueToCoding(container, v));
        return multi ? (result.length ? result : undefined) : result[0];
    } else {
        let result = valueToCoding(container, value);
        return multi ? [result] : result;
    }
}

export function itemTypeToItemDatatype(type: string, hasCodeableConcept: boolean = false): string {
    if (type === 'choice') return hasCodeableConcept ? 'CodeableConcept' : 'Coding';
    return type;
}

export function permissibleValueToCoding(pv: PermissibleValue): FhirCoding {
    return newCoding(
        pv.codeSystemName,
        pv.valueMeaningCode ? pv.valueMeaningCode : pv.permissibleValue,
        pv.codeSystemVersion,
        pv.valueMeaningName && pv.valueMeaningName !== pv.permissibleValue ? pv.valueMeaningName : undefined);
}

export function valueToQuantity(container: Question | ValueDomain, value: string, comparator: string, valueUom?: CodeAndSystem): FhirQuantity {
    let quantity: FhirQuantity = {
        comparator: comparator && comparator !== '=' ? comparator : undefined,
        value: parseFloat(value),
    };
    if (Array.isArray((container as Question).unitsOfMeasure)) {
        if (valueUom) {
            quantity.code = valueUom.code;
            quantity.system = valueUom.system;
        } else if ((container as Question).unitsOfMeasure.length) {
            container = container as Question;
            quantity.code = container.unitsOfMeasure[0].code;
            quantity.system = container.unitsOfMeasure[0].system;
        }
        quantity.system = codeSystemOut(quantity.system);
    } else {
        quantity.unit = (container as ValueDomain).uom;
    }
    return quantity;
}

export function valueToTypedValue(container: Question | ValueDomain, type: string, value: string, comparator: string = '=', valueUom?: CodeAndSystem, hasCodeableConcept: boolean = false): any {
    switch (type) {
        case 'choice':
            if (hasCodeableConcept) {
                let coding = containerValueListToCoding(container, value, true);
                return coding ? newCodeableConcept(coding as FhirCoding[]) : undefined;
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

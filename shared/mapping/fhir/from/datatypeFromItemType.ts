import { ValueDomain, ValueDomainValueList } from 'shared/de/dataElement.model';
import { isScore, questionQuestionMulti } from 'shared/form/fe';
import { Question, QuestionValueList } from 'shared/form/form.model';
import { codeSystemOut } from 'shared/mapping/fhir';
import { FhirCoding, FhirQuantity, FhirValue } from 'shared/mapping/fhir/fhir.model';
import { CodeAndSystem, PermissibleValue } from 'shared/models.model';

export function isCodingToValueList(
    container: Question | ValueDomain,
    coding: FhirCoding | FhirCoding[]
): container is QuestionValueList | ValueDomainValueList {
    function isCodingInContainer(container: Question | ValueDomain, c: FhirCoding) {
        const pvs: PermissibleValue[] = Array.isArray((container as QuestionValueList).answers)
            ? (container as QuestionValueList).answers
            : (container as ValueDomainValueList).permissibleValues;
        return pvs.some(pv => pv.permissibleValue === c.code && codeSystemOut(pv.codeSystemName) === c.system);
    }

    if (Array.isArray(coding)) {
        return coding.every(c => isCodingInContainer(container, c));
    } else {
        return isCodingInContainer(container, coding);
    }
}

export function isItemTypeToContainer(container: Question | ValueDomain, type: string): boolean {
    // http://hl7.org/fhir/item-type
    // NOT IMPLEMENTED: boolean, time, url, open-choice(choice+string), attachment, reference
    if (container.datatype === 'Externally Defined') {
        return true;
    }
    switch (type) {
        case 'display':
            return isScore(container as Question);
        case 'choice':
            return container.datatype === 'Value List';
        case 'date':
            return (
                container.datatype === 'Date' &&
                ['Hour', 'Minute', 'Second'].indexOf(container.datatypeDate.precision || '') <= -1
            );
        case 'dateTime':
            return (
                container.datatype === 'Date' &&
                ['Hour', 'Minute', 'Second'].indexOf(container.datatypeDate.precision || '') > -1
            );
        case 'quantity':
            return (
                container.datatype === 'Number' &&
                ((Array.isArray((container as Question).unitsOfMeasure) &&
                    !!(container as Question).unitsOfMeasure.length) ||
                    !!(container as ValueDomain).uom)
            );
        case 'decimal':
            return (
                container.datatype === 'Number' &&
                (!container.datatypeNumber ||
                    typeof container.datatypeNumber.precision !== 'number' ||
                    container.datatypeNumber.precision < 0)
            );
        case 'integer':
            return (
                container.datatype === 'Number' &&
                !(
                    !container.datatypeNumber ||
                    typeof container.datatypeNumber.precision !== 'number' ||
                    container.datatypeNumber.precision < 0
                )
            );
        case 'text':
            return (
                ['Value List', 'Date', 'Number'].indexOf(container.datatype) <= -1 &&
                container.datatype === 'Text' &&
                !!container.datatypeText?.showAsTextArea
            );
        case 'string':
            return (
                ['Value List', 'Date', 'Number'].indexOf(container.datatype) <= -1 &&
                !(container.datatype === 'Text' && container.datatypeText && container.datatypeText.showAsTextArea)
            );
        default:
            return false;
    }
}

export function quantityToUnitsOfMeasure(
    container: Question | ValueDomain,
    quantity: FhirQuantity
): CodeAndSystem | undefined {
    if (Array.isArray((container as Question).unitsOfMeasure)) {
        container = container as Question;
        const matches = container.unitsOfMeasure.filter(
            u => quantity.code === u.code && (quantity.system ? quantity.system === codeSystemOut(u.system) : !u.system)
        );
        return matches.length ? matches[0] : undefined;
    } else {
        container = container as ValueDomain;
        return container.uom && container.uom === quantity.unit ? { code: container.uom } : undefined;
    }
}

export function typedValueToValue(container: Question, type: string, v: FhirValue): boolean {
    if (!isItemTypeToContainer(container, type)) {
        return false;
    }
    switch (type) {
        case 'display':
            return true;
        case 'choice':
            /* tslint:disable */
            const coding = typeof v.valueCoding !== 'undefined' ? v.valueCoding : v.valueCodeableConcept!.coding!;
            /* tslint:enable */
            if (!isCodingToValueList(container, coding)) {
                console.log(container.datatype);
                return false;
            } else {
                console.log(container.datatype);
            }
            if (Array.isArray(coding)) {
                container.answer = questionQuestionMulti(container)
                    ? coding.map(c => c.code)
                    : coding.length
                    ? coding[0].code
                    : undefined;
            } else {
                container.answer = questionQuestionMulti(container) ? [coding.code] : coding.code;
            }
            return true;
        case 'boolean':
            container.answer = v.valueBoolean ? '1' : '0';
            return true;
        case 'quantity':
            if (!v.valueQuantity) {
                v.valueQuantity = {};
            }
            const unit = quantityToUnitsOfMeasure(container, v.valueQuantity);
            if (typeof unit === 'undefined') {
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

export function valuedElementToItemType(elem: FhirValue): string {
    if (typeof elem.valueBoolean !== 'undefined') {
        return 'boolean';
    }
    if (typeof elem.valueCoding !== 'undefined') {
        return 'choice';
    }
    if (typeof elem.valueCodeableConcept !== 'undefined') {
        return 'choice';
    }
    if (typeof elem.valueDate !== 'undefined') {
        return 'date';
    }
    if (typeof elem.valueDateTime !== 'undefined') {
        return 'dateTime';
    }
    if (typeof elem.valueDecimal !== 'undefined') {
        return 'decimal';
    }
    if (typeof elem.valueInteger !== 'undefined') {
        return 'integer';
    }
    if (typeof elem.valueQuantity !== 'undefined') {
        return 'quantity';
    }
    if (typeof elem.valueString !== 'undefined') {
        return 'string';
    }
    if (typeof (elem as any).valueText !== 'undefined') {
        return 'text';
    }
    return '';
}

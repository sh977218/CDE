import { questionMulti } from 'shared/form/fe';
import { FormQuestion } from 'shared/form/form.model';
import {
    containerToItemType, itemTypeToItemDatatype, valueToTypedValue
} from 'shared/mapping/fhir/to/datatypeToItemType';
import { FhirValue } from 'shared/mapping/fhir/fhir.model';
import { capString } from 'shared/system/util';

export function questionToFhirValue(q: FormQuestion, fhirObj: FhirValue, fhirMulti: boolean = false, prefix?: string, hasCodeableConcept: boolean = false): void {
    let qType = containerToItemType(q.question);
    if (fhirMulti) {
        let answer = questionMulti(q) ? q.question.answer : [q.question.answer];
        storeTypedValue(
            answer.map((a: string) => valueToTypedValue(q.question, qType, a, undefined, q.question.answerUom, hasCodeableConcept)),
            fhirObj, qType, prefix, hasCodeableConcept);
    } else {
        let answer = questionMulti(q) ? q.question.answer[0] : q.question.answer;
        storeTypedValue(
            valueToTypedValue(q.question, qType, answer, undefined, q.question.answerUom, hasCodeableConcept),
            fhirObj, qType, prefix, hasCodeableConcept);
    }
}

export function storeTypedValue(value: any, obj: FhirValue, qType: string, prefix: string = 'value', hasCodeableConcept: boolean = false): void {
    obj[prefix + capString(itemTypeToItemDatatype(qType, hasCodeableConcept))] = value;
}

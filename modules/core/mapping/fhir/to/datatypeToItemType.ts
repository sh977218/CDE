import { questionMulti } from 'shared/form/fe';
import { FormQuestion } from 'shared/form/form.model';
import {
    containerToItemType, itemTypeToItemDatatype, valueToTypedValue
} from 'shared/mapping/fhir/to/datatypeToItemType';
import { FhirValue } from 'shared/mapping/fhir/fhir.model';
import { capitalize } from 'shared/util';

export function questionToFhirValue(q: FormQuestion, fhirObj: FhirValue, fhirMulti: boolean = false, prefix?: string,
                                    hasCodeableConcept: boolean = false): void {
    const qType = containerToItemType(q.question);
    if (fhirMulti) {
        const answer = questionMulti(q.question) ? q.question.answer : [q.question.answer];
        storeTypedValue(
            answer.map((a: string) => valueToTypedValue(q.question, qType, a, undefined, q.question.answerUom, hasCodeableConcept)),
            fhirObj, qType, prefix, hasCodeableConcept);
    } else {
        const answer = questionMulti(q.question) ? q.question.answer[0] : q.question.answer;
        storeTypedValue(
            valueToTypedValue(q.question, qType, answer, undefined, q.question.answerUom, hasCodeableConcept),
            fhirObj, qType, prefix, hasCodeableConcept);
    }
}

export function storeTypedValue(value: any, obj: FhirValue, qType: string, prefix: string = 'value',
                                hasCodeableConcept: boolean = false): void {
    obj[prefix + capitalize(itemTypeToItemDatatype(qType, hasCodeableConcept))] = value;
}

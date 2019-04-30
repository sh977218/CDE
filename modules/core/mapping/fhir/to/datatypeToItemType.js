import { capString } from 'shared/system/util';
import { questionMulti } from 'shared/form/fe';
import {
    containerToItemType, itemTypeToItemDatatype, valueToTypedValue
} from 'shared/mapping/fhir/to/datatypeToItemType';

export function questionToFhirValue(q, fhirObj, fhirMulti = false, prefix = undefined, hasCodeableConcept = false) {
    let qType = containerToItemType(q.question);
    if (fhirMulti) {
        let answer = questionMulti(q) ? q.question.answer : [q.question.answer];
        storeTypedValue(
            answer.map(a => valueToTypedValue(q.question, qType, a, undefined, q.question.answerUom, hasCodeableConcept)),
            fhirObj, qType, prefix, hasCodeableConcept);
    } else {
        let answer = questionMulti(q) ? q.question.answer[0] : q.question.answer;
        storeTypedValue(
            valueToTypedValue(q.question, qType, answer, undefined, q.question.answerUom, hasCodeableConcept),
            fhirObj, qType, prefix, hasCodeableConcept);
    }
}

export function storeTypedValue(value, obj, qType, prefix = 'value', hasCodeableConcept = false) {
    obj[prefix + capString(itemTypeToItemDatatype(qType, hasCodeableConcept))] = value;
}

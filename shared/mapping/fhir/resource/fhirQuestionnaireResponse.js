import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';

export function newQuestionnaireResponse(encounter = undefined, patient = undefined, questionnaire = undefined) {
    return {
        resourceType: 'QuestionnaireResponse',
        authored: encounter ? encounter.period.start : undefined,
        context: encounter ? toRef(encounter) : undefined,
        id: undefined,
        questionnaire: questionnaire && toRef(questionnaire),
        status: 'completed',
        subject: patient ? toRef(patient) : undefined,
    };
}

export function newQuestionnaireResponseItem(linkId) {
    return {
        answer: undefined,
        item: undefined,
        linkId,
    };
}

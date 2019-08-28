import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import {
    FhirEncounter, FhirPatient, FhirQuestionnaire, FhirQuestionnaireResponse, FhirQuestionnaireResponseItem
} from 'shared/mapping/fhir/fhirResource.model';

export function newQuestionnaireResponse(patient?: FhirPatient, encounter?: FhirEncounter,
                                         questionnaire?: FhirQuestionnaire): FhirQuestionnaireResponse {
    return {
        resourceType: 'QuestionnaireResponse',
        authored: encounter ? encounter.period && encounter.period.start : undefined,
        context: encounter ? toRef(encounter) : undefined,
        id: undefined,
        questionnaire: questionnaire && toRef(questionnaire),
        status: 'completed',
        subject: patient ? toRef(patient) : undefined,
    };
}

export function newQuestionnaireResponseItem(linkId: string): FhirQuestionnaireResponseItem {
    return {
        answer: undefined,
        item: undefined,
        linkId,
    };
}

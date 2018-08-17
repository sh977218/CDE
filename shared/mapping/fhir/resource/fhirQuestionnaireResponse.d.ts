import {
    FhirEncounter, FhirPatient, FhirQuestionnaire, FhirQuestionnaireResponse, FhirQuestionnaireResponseItem
} from 'shared/mapping/fhir/fhirResource.model';

declare function newQuestionnaireResponse(encounter?: FhirEncounter, patient?: FhirPatient, questionnaire?: FhirQuestionnaire): FhirQuestionnaireResponse;
declare function newQuestionnaireResponseItem(linkId?: string): FhirQuestionnaireResponseItem;

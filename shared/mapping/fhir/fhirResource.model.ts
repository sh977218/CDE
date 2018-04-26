import {
    FhirAddress,
    FhirCodeableConcept,
    FhirContactPoint,
    FhirHumanName,
    FhirIdentifier,
    FhirReference
} from 'shared/mapping/fhir/fhir.model';

export type FhirEncounter = any;
export type FhirEndpoint = any;
export type FhirObservation = any;

export type FhirOrganization = {
    active?: boolean,
    address?: FhirAddress[],
    alias?: string,
    contact?: {
        address?: FhirAddress,
        name?: FhirHumanName,
        purpose?: FhirCodeableConcept,
        telecom?: FhirContactPoint[],
    }[],
    endpoint?: FhirReference<FhirEndpoint>[],
    identifier?: FhirIdentifier[],
    name?: string,
    partOf?: FhirReference<FhirOrganization>,
    telecom?: FhirContactPoint[],
    type?: FhirCodeableConcept[],
};

export type FhirQuestionnaire = any;
export type FhirQuestionnaireItem = any;

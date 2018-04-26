import { FhirOrganization } from 'shared/mapping/fhir/fhirResource.model';

export type FhirAddress = {
    city?: string,
    country?: string,
    district?: string,
    line?: string[],
    period?: FhirPeriod,
    postalCode?: string,
    state?: string,
    text?: string,
    type?: FhirCode,
    use?: FhirCode,
};

export type FhirCode = string;

export type FhirCodeableConcept = {
    coding: FhirCoding,
    text: string,
};

export type FhirCoding = {
    code?: string,
    display?: string,
    system?: FhirUri,
    userSelected?: boolean;
    version?: string,
};

export type FhirContactPoint = any;

export type FhirDatetime = string;

export type FhirHumanName = {
    family?: string,
    given?: string[],
    period?: FhirPeriod,
    prefix?: string[],
    suffix?: string[],
    text?: string,
    use?: FhirCode,
};

export type FhirIdentifier = {
    assigner: FhirReference<FhirOrganization>,
    period: FhirPeriod,
    type?: FhirCodeableConcept,
    system: FhirUri,
    use?: string,
    value?: string,
};

export type FhirPeriod = {
    start: FhirDatetime,
    end: FhirDatetime,
};

export type FhirQuantity = {
    code?: string,
    comparator?: string,
    unit?: string,
    system?: string,
    value?: number,
};

export class FhirReference<T> {
    display?: string;
    identifier?: FhirIdentifier;
    reference?: string;
}

export type FhirUri = string;

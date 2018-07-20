import {
    FhirAddress, FhirBase64Binary, FhirCode,
    FhirCodeableConcept, FhirCoding,
    FhirContactPoint, FhirDateTime, FhirDuration, FhirEffective, FhirExtension,
    FhirHumanName,
    FhirIdentifier, FhirInstant, FhirMeta, FhirNarrative, FhirPeriod, FhirQuantity, FhirRange, FhirRatio,
    FhirReference, FhirSampledData, FhirTime, FhirUri, FhirValue
} from 'shared/mapping/fhir/fhir.model';

export class FhirResource {
    id?: string;
    implicitRules?: FhirUri;
    language?: FhirCode;
    meta?: FhirMeta;
}

export class FhirDomainResource extends FhirResource {
    contained?: FhirResource[];
    extension?: FhirExtension[];
    modifierExtension?: FhirExtension[];
    resourceType: string; // not documented, XML: is the node name
    text?: FhirNarrative;
}

export type FhirAccount = any;
export type FhirAnnotation = any;
export type FhirAppointment = any;

export class FhirBundle {
    //// searchset from api
    // this.smart.patient.api.search({type: 'Procedure'}).then(results => {
    //     if (results && results.data && results.data.entry && results.data.entry.length) {
    //         this.patientProcedures = results.data.entry.filter(e => !!e.resource).map(e => e.resource);
    //     }
    // }).catch(function(res){
    //     if (res.status) console.log('Error Response', res.status);
    //     if (res.message) console.log('Error', res.message);
    // });
    entry?: {
        fullUrl?: FhirUri,
        link?: {
            relation: string,
            url: FhirUri,
        }[],
        request?: { // transaction related
            ifMatch?: string,
            ifModifiedSince?: FhirInstant,
            ifNoneExist?: string,
            ifNoneMatch?: string,
            method: FhirCode<'GET'|'POST'|'PUT'|'DELETE'>,
            url: FhirUri,
        },
        resource?: FhirResource,
        response?: { // transaction related
            etag?: string,
            lastModified?: FhirInstant,
            location?: FhirUri,
            outcome?: FhirResource,
            status: string,
        },
        search?: { // type=searchset only
            mode: 'match'|'include'|'outcome',
            score: number, // decimal 0<x<1
        }
    }[];
    identifier?: FhirIdentifier;
    link?: {
        relation: string,
        url: FhirUri,
    }[];
    signature?: FhirSignature;
    total?: number; // unsigned int, type=searchset only
    type: FhirCode<'document'|'message'|'transaction'|'transaction-response'|'batch'|'batch-response'|'history'|'searchset'|'collection'>;
}

export type FhirCondition = any;

export class FhirDevice extends FhirDomainResource {
    contact?: FhirContactPoint[];
    expirationDate?: FhirDateTime;
    identifier?: FhirIdentifier[];
    location?: FhirReference<FhirLocation>;
    lotNumber?: string;
    manufacturer?: string;
    manufactureDate?: FhirDateTime;
    model?: string;
    note?: FhirAnnotation[];
    owner?: FhirReference<FhirOrganization>;
    patient?: FhirReference<FhirPatient>;
    safety?: FhirCodeableConcept[];
    status?: FhirCode;
    type?: FhirCodeableConcept;
    udi?: {
        carrierAIDC: FhirBase64Binary,
        carrierHRF: string,
        deviceIdentifier?: string,
        entryType: FhirCode,
        issuer: FhirUri,
        jurisdiction: FhirUri,
        name?: string,
    };
    url?: FhirUri;
    version?: string;
}

export type FhirDeviceMetric = any;

export class FhirEncounter extends FhirDomainResource {
    account?: FhirReference<FhirAccount>[];
    appointment?: FhirReference<FhirAppointment>;
    class?: FhirCoding;
    classHistory?: {
        class: FhirCoding,
        period: FhirPeriod
    }[];
    diagnosis?: {
        condition: FhirReference<any>,
        rank?: number,
        role?: FhirCodeableConcept[]
    }[];
    episodeOfCare?: FhirReference<FhirEpisodeOfCare>[];
    hospitalization?: {
        admitSource?: FhirCodeableConcept;
        destination?: FhirReference<FhirLocation>;
        dietPreference?: FhirCodeableConcept[];
        dischargeDisposition?: FhirCodeableConcept;
        origin?: FhirReference<FhirLocation>;
        preAdmissionIdentifier?: FhirIdentifier;
        reAdmission?: FhirCodeableConcept;
        specialArrangement?: FhirCodeableConcept[];
        specialCourtesy?: FhirCodeableConcept[];
    }[];
    incomingReferral?: FhirReference<FhirReferralRequest>[];
    identifier?: FhirIdentifier[];
    length?: FhirDuration;
    location?: {
        location: FhirReference<FhirLocation>,
        period?: FhirPeriod,
        status?: FhirCode
    }[];
    participant?: {
        individual?: FhirReference<any>,
        period?: FhirPeriod,
        type?: FhirCodeableConcept[]
    }[];
    partOf?: FhirReference<FhirEncounter>;
    period?: FhirPeriod;
    priority?: FhirCodeableConcept;
    reason?: FhirCodeableConcept[];
    serviceProvider?: FhirReference<FhirOrganization>;
    status: FhirCode;
    statusHistory?: {
        status: FhirCode,
        period: FhirPeriod
    }[];
    subject?: FhirReference<FhirPatient | FhirGroup>;
    type?: FhirCodeableConcept[];
}

export type FhirEndpoint = any;
export type FhirEpisodeOfCare = any;
export type FhirGroup = any;
export type FhirLocation = any;
export type FhirMedicalAdministration = any;
export type FhirMedication = any;

export class FhirObservationComponent extends FhirDomainResource implements FhirValue {
    code: FhirCodeableConcept;
    dataAbsentReason?: FhirCodeableConcept;
    interpretation?: FhirCodeableConcept;
    referenceRange?: any[];
    valueAttachment?: any;
    valueBoolean?: boolean;
    valueCodeableConcept?: FhirCodeableConcept;
    valueDateTime?: FhirDateTime;
    valuePeriod?: FhirPeriod;
    valueQuantity?: FhirQuantity;
    valueRange?: FhirRange;
    valueRatio?: FhirRatio;
    valueSampledData?: FhirSampledData;
    valueString?: string;
    valueTime?: FhirTime;
}

export class FhirObservation extends FhirObservationComponent implements FhirEffective {
    basedOn?: FhirReference<any>[];
    bodySite?: FhirCodeableConcept;
    category?: FhirCodeableConcept[];
    comment?: string;
    component?: FhirObservationComponent[];
    context?: FhirReference<FhirEncounter | any>;
    device?: FhirReference<FhirDevice | FhirDeviceMetric>;
    effectiveDateTime?: FhirDateTime;
    effectivePeriod?: FhirPeriod;
    identifier?: FhirIdentifier[];
    issued?: FhirInstant;
    method?: FhirCodeableConcept;
    performer?: FhirReference<FhirPatient | any>[];
    related?: any[];
    specimen?: FhirReference<any>;
    status: FhirCode;
    subject?: FhirReference<FhirPatient | FhirGroup | any>;
}

export class FhirOrganization extends FhirDomainResource {
    active?: boolean;
    address?: FhirAddress[];
    alias?: string;
    contact?: {
        address?: FhirAddress,
        name?: FhirHumanName,
        purpose?: FhirCodeableConcept,
        telecom?: FhirContactPoint[],
    }[];
    endpoint?: FhirReference<FhirEndpoint>[];
    identifier?: FhirIdentifier[];
    name?: string;
    partOf?: FhirReference<FhirOrganization>;
    telecom?: FhirContactPoint[];
    type?: FhirCodeableConcept[];
}

export type FhirPatient = any;
export type FhirPractitioner = any;

export class FhirProcedure {
    basedOn?: FhirReference<any>[];
    bodySite?: FhirCodeableConcept[];
    category?: FhirCodeableConcept; // ?????????????
    code: FhirCodeableConcept; // ??????????
    complication?: FhirCodeableConcept[];
    complicationDetail?: FhirReference<FhirCondition>[];
    context?: FhirReference<FhirEncounter|FhirEpisodeOfCare>;
    definition?: FhirReference<any>[];
    focalDevice?: {
        action?: FhirCodeableConcept,
        manipulated: FhirReference<FhirDevice>
    }[];
    followUp?: FhirCodeableConcept[];
    identifier?: FhirIdentifier[];
    location?: FhirReference<FhirLocation>;
    note?: FhirAnnotation[];
    notDone?: boolean;
    notDoneReason?: FhirCodeableConcept;
    outcome?: FhirCodeableConcept;
    partOf?: FhirReference<FhirMedicalAdministration|FhirObservation|FhirProcedure>;
    performedDateTime?: FhirDateTime;
    performedPeriod?: FhirPeriod;
    performer?: {
        actor: FhirReference<FhirDevice|FhirOrganization|FhirPatient|FhirPractitioner|FhirRelatedPerson>
        onBehalfOf?: FhirReference<FhirOrganization>
        role?: FhirCodeableConcept,
    }[];
    reasonCode?: FhirCodeableConcept[];
    reasonReference?: FhirReference<FhirCondition|FhirObservation>[];
    report?: FhirReference<any>;
    status: FhirCode<'preparation'|'in-progress'|'suspended'|'aborted'|'completed'|'entered-in-error'|'unknown'>;
    subject?: FhirReference<FhirPatient|FhirGroup>;
    usedCode?: FhirCodeableConcept[];
    usedReference?: FhirReference<FhirDevice|FhirMedication|FhirSubstance>[];
}

export type FhirQuestionnaire = any;
export type FhirQuestionnaireItem = any;
export type FhirReferralRequest = any;
export type FhirRelatedPerson = any;
export type FhirSignature = any;
export type FhirSubstance = any;

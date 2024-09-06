import {
    FhirAddress,
    FhirBackboneElement,
    FhirBase64Binary,
    FhirCode,
    FhirCodeableConcept,
    FhirCoding,
    FhirContactPoint,
    FhirDate,
    FhirDateTime,
    FhirDuration,
    FhirEffective,
    FhirElement,
    FhirElementBase,
    FhirExtension,
    FhirHumanName,
    FhirIdentifier,
    FhirInstant,
    FhirMarkdown,
    FhirMeta,
    FhirNarrative,
    FhirPeriod,
    FhirQuantity,
    FhirRange,
    FhirRatio,
    FhirReference,
    FhirSampledData,
    FhirTime,
    FhirUri,
    FhirValue,
} from 'shared/mapping/fhir/fhir.model';

export class FhirResource {
    id?: string;
    implicitRules?: FhirUri;
    language?: FhirCode;
    meta?: FhirMeta;
}

export type supportedFhirResources = 'Observation' | 'Procedure' | 'QuestionnaireResponse';
export const supportedFhirResourcesArray = ['Observation', 'Procedure', 'QuestionnaireResponse'];
export type supportedFhirResourcesExt = FhirObservation | FhirProcedure | FhirQuestionnaireResponse | FhirQuestionnaire;

export class FhirDomainResource extends FhirResource implements FhirElement {
    [key: string]: any;

    contained?: FhirResource[];
    extension?: FhirExtension[];
    modifierExtension?: FhirExtension[];
    resourceType!: supportedFhirResources | 'Device' | 'Questionnaire' | 'Encounter'; // not documented, XML: is the node name
    text?: FhirNarrative;
}

export interface FhirIdentifiableResource {
    code?: FhirCodeableConcept | FhirCodeableConcept[] | FhirCoding | FhirCoding[];
    id?: string;
    identifier?: FhirIdentifier | FhirIdentifier[];
}

export type FhirAccount = any;

export class FhirAnnotation extends FhirElementBase {
    authorReference?: FhirReference<FhirPractitioner | FhirPatient | FhirRelatedPerson>;
    authorString?: string;
    time?: FhirDateTime;
    text!: string;
}

export type FhirAppointment = any;
export type FhirAttachment = any;

export class FhirBundle {
    //// searchset from api
    // this.smart.patient.api.search({type: 'Procedure'}).then(results => {
    //     if (results?.data?.entry?.length) {
    //         this.patientProcedures = results.data.entry.filter(e => !!e.resource).map(e => e.resource);
    //     }
    // }).catch(function(res){
    //     if (res.status) console.log('Error Response', res.status);
    //     if (res.message) console.log('Error', res.message);
    // });
    entry?: {
        fullUrl?: FhirUri;
        link?: {
            relation: string;
            url: FhirUri;
        }[];
        request?: {
            // transaction related
            ifMatch?: string;
            ifModifiedSince?: FhirInstant;
            ifNoneExist?: string;
            ifNoneMatch?: string;
            method: FhirCode<'GET' | 'POST' | 'PUT' | 'DELETE'>;
            url: FhirUri;
        };
        resource?: FhirResource;
        response?: {
            // transaction related
            etag?: string;
            lastModified?: FhirInstant;
            location?: FhirUri;
            outcome?: FhirResource;
            status: string;
        };
        search?: {
            // type=searchset only
            mode: 'match' | 'include' | 'outcome';
            score: number; // decimal 0<x<1
        };
    }[];
    identifier?: FhirIdentifier;
    link?: {
        relation: string;
        url: FhirUri;
    }[];
    signature?: FhirSignature;
    total?: number; // unsigned int, type=searchset only
    type!: FhirCode<
        | 'document'
        | 'message'
        | 'transaction'
        | 'transaction-response'
        | 'batch'
        | 'batch-response'
        | 'history'
        | 'searchset'
        | 'collection'
    >;
}

export type FhirCarePlan = any;
export type FhirCondition = any;
export type FhirContactDetail = any;

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
    resourceType: 'Device' = 'Device';
    safety?: FhirCodeableConcept[];
    status?: FhirCode;
    type?: FhirCodeableConcept;
    udi?: {
        carrierAIDC?: FhirBase64Binary;
        carrierHRF?: string;
        deviceIdentifier?: string;
        entryType?: FhirCode;
        issuer?: FhirUri;
        jurisdiction?: FhirUri;
        name?: string;
    };
    url?: FhirUri;
    version?: string;
}

export type FhirDeviceMetric = any;

export class FhirEncounter extends FhirDomainResource {
    resourceType: 'Encounter' = 'Encounter';
    account?: FhirReference<FhirAccount>[];
    appointment?: FhirReference<FhirAppointment>;
    class?: FhirCoding;
    classHistory?: {
        class: FhirCoding;
        period: FhirPeriod;
    }[];
    diagnosis?: {
        condition: FhirReference<any>;
        rank?: number;
        role?: FhirCodeableConcept[];
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
        location: FhirReference<FhirLocation>;
        period?: FhirPeriod;
        status?: FhirCode;
    }[];
    participant?: {
        individual?: FhirReference<any>;
        period?: FhirPeriod;
        type?: FhirCodeableConcept[];
    }[];
    partOf?: FhirReference<FhirEncounter>;
    period?: FhirPeriod;
    priority?: FhirCodeableConcept;
    reason?: FhirCodeableConcept[];
    serviceProvider?: FhirReference<FhirOrganization>;
    status!: FhirCode;
    statusHistory?: {
        status: FhirCode;
        period: FhirPeriod;
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

export class FhirObservationComponent extends FhirBackboneElement implements FhirValue {
    code!: FhirCodeableConcept;
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

// identified by LOINC code with NLM/tinyId code for missing
export class FhirObservation extends FhirObservationComponent implements FhirEffective {
    basedOn?: FhirReference<any>[];
    bodySite?: FhirCodeableConcept;
    category?: FhirCodeableConcept[];
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
    resourceType!: 'Observation';
    specimen?: FhirReference<any>;
    status!: FhirCode<
        'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown'
    >;
    subject?: FhirReference<FhirPatient | FhirGroup | any>;
}

export class FhirOrganization extends FhirDomainResource {
    active?: boolean;
    address?: FhirAddress[];
    alias?: string;
    contact?: {
        address?: FhirAddress;
        name?: FhirHumanName;
        purpose?: FhirCodeableConcept;
        telecom?: FhirContactPoint[];
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

// identified by custom mapping of code to question or static
export class FhirProcedure extends FhirDomainResource implements FhirIdentifiableResource {
    basedOn?: FhirReference<any>[];
    bodySite?: FhirCodeableConcept[];
    category?: FhirCodeableConcept;
    code?: FhirCodeableConcept;
    complication?: FhirCodeableConcept[];
    complicationDetail?: FhirReference<FhirCondition>[];
    context?: FhirReference<FhirEncounter | FhirEpisodeOfCare>;
    definition?: FhirReference<any>[];
    focalDevice?: {
        action?: FhirCodeableConcept;
        manipulated: FhirReference<FhirDevice>;
    }[];
    followUp?: FhirCodeableConcept[];
    identifier?: FhirIdentifier[];
    location?: FhirReference<FhirLocation>;
    note?: FhirAnnotation[];
    notDone?: boolean;
    notDoneReason?: FhirCodeableConcept;
    outcome?: FhirCodeableConcept;
    partOf?: FhirReference<FhirMedicalAdministration | FhirObservation | FhirProcedure>;
    performedDateTime?: FhirDateTime;
    performedPeriod?: FhirPeriod;
    performer?: {
        actor: FhirReference<FhirDevice | FhirOrganization | FhirPatient | FhirPractitioner | FhirRelatedPerson>;
        onBehalfOf?: FhirReference<FhirOrganization>;
        role?: FhirCodeableConcept;
    }[];
    reasonCode?: FhirCodeableConcept[];
    reasonReference?: FhirReference<FhirCondition | FhirObservation>[];
    report?: FhirReference<any>;
    resourceType: 'Procedure' = 'Procedure';
    status!: FhirCode<
        'preparation' | 'in-progress' | 'suspended' | 'aborted' | 'completed' | 'entered-in-error' | 'unknown'
    >;
    subject!: FhirReference<FhirPatient | FhirGroup>;
    usedCode?: FhirCodeableConcept[];
    usedReference?: FhirReference<FhirDevice | FhirMedication | FhirSubstance>[];
}

export type FhirProcedureRequest = any;

// identified by NLM/tinyId-version identifier
export class FhirQuestionnaire extends FhirDomainResource {
    approvalDate?: FhirDate;
    code?: FhirCoding[];
    contact?: FhirContactDetail[];
    copyright?: FhirMarkdown;
    date?: FhirDateTime;
    description?: FhirMarkdown;
    effectivePeriod?: FhirPeriod;
    experimental?: boolean;
    identifier?: FhirIdentifier[];
    item?: FhirQuestionnaireItem[];
    jurisdiction?: FhirCodeableConcept[];
    lastReviewDate?: FhirDate;
    name?: string;
    publisher?: string;
    purpose?: FhirMarkdown;
    resourceType: 'Questionnaire' = 'Questionnaire';
    status!: FhirCode<'draft' | 'active' | 'retired' | 'unknown'>;
    subjectType?: FhirCode[];
    title?: string;
    useContext?: FhirUsageContext[];
    version?: string;
    url?: FhirUri;
}

export class FhirQuestionnaireItem extends FhirBackboneElement {
    [key: string]: any;

    code?: FhirCoding[];
    definition?: FhirUri;
    enableWhen?: FhirQuestionnaireItemEnableWhen[];
    initialAttachment?: FhirAttachment;
    initialBoolean?: boolean;
    initialCoding?: FhirCoding;
    initialDate?: FhirDate;
    initialDateTime?: FhirDateTime;
    initialDecimal?: number;
    initialInteger?: number;
    initialQuantity?: FhirQuantity;
    initialReference?: FhirReference<any>;
    initialString?: string;
    initialTime?: FhirTime;
    initialUri?: FhirUri;
    item?: FhirQuestionnaireItem[];
    linkId!: string;
    maxLength?: number;
    option?: FhirQuestionnaireItemOption[];
    options?: FhirReference<FhirValueSet>;
    prefix?: string;
    readOnly?: boolean;
    required?: boolean;
    repeats?: boolean;
    text?: string;
    type!: FhirCode;
}

export class FhirQuestionnaireItemEnableWhen extends FhirBackboneElement {
    [key: string]: any;

    answerAttachment?: FhirAttachment;
    answerBoolean?: boolean;
    answerCoding?: FhirCoding;
    answerDate?: FhirDate;
    answerDateTime?: FhirDateTime;
    answerDecimal?: number;
    answerInteger?: number;
    answerQuantity?: FhirQuantity;
    answerReference?: FhirReference<any>;
    answerString?: string;
    answerTime?: FhirTime;
    answerUri?: FhirUri;
    hasAnswer?: boolean;
    operator!: 'exists' | '=' | '!=' | '>' | '>=' | '<' | '<=';
    question!: string;
}

export class FhirQuestionnaireItemOption extends FhirBackboneElement {
    valueCoding?: FhirCoding;
    valueDate?: FhirDate;
    valueInteger?: number;
    valueString?: string;
    valueTime?: FhirTime;
}

// identified by questionnaire
export class FhirQuestionnaireResponse extends FhirDomainResource {
    author?: FhirReference<FhirDevice | FhirPatient | FhirPractitioner | FhirRelatedPerson>;
    authored?: FhirDateTime;
    basedOn?: FhirReference<FhirReferralRequest | FhirCarePlan | FhirProcedureRequest>[];
    context?: FhirReference<FhirEncounter | FhirEpisodeOfCare>;
    identifier?: FhirIdentifier;
    item?: FhirQuestionnaireResponseItem[];
    parent?: FhirReference<FhirObservation | FhirProcedure>[];
    questionnaire?: FhirReference<FhirQuestionnaire>;
    resourceType: 'QuestionnaireResponse' = 'QuestionnaireResponse';
    source?: FhirReference<FhirPatient | FhirPractitioner | FhirRelatedPerson>;
    status!: FhirCode<'in-progress' | 'completed' | 'amended' | 'entered-in-error' | 'stopped'>;
    subject?: FhirReference<any>;
}

export class FhirQuestionnaireResponseItem extends FhirBackboneElement {
    answer?: FhirQuestionnaireResponseItemAnswer[];
    definition?: FhirUri;
    item?: FhirQuestionnaireResponseItem[];
    linkId!: string;
    subject?: FhirReference<any>;
    text?: string;
}

export class FhirQuestionnaireResponseItemAnswer extends FhirBackboneElement {
    valueAttachment?: FhirAttachment;
    valueBoolean?: boolean;
    valueCoding?: FhirCoding;
    valueDate?: FhirDate;
    valueDateTime?: FhirDateTime;
    valueDecimal?: number;
    valueInteger?: number;
    valueQuantity?: FhirQuantity;
    valueReference?: FhirReference<any>;
    valueString?: string;
    valueTime?: FhirTime;
    valueUri?: FhirUri;
    item?: FhirQuestionnaireResponseItem[];
}

export type FhirReferralRequest = any;
export type FhirRelatedPerson = any;
export type FhirSignature = any;
export type FhirSubstance = any;
export type FhirUsageContext = any;
export type FhirValueSet = any;

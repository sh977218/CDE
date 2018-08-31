import { FhirOrganization } from 'shared/mapping/fhir/fhirResource.model';

export class FhirElement {
    extension?: FhirExtension[];
    id?: string;
}

export class FhirAddress extends FhirElement {
    city?: string;
    country?: string;
    district?: string;
    line?: string[];
    period?: FhirPeriod;
    postalCode?: string;
    state?: string;
    text?: string;
    type?: FhirCode;
    use?: FhirCode;
}

export class FhirBackboneElement extends FhirElement {
    modifierExtension?: FhirExtension[];
}

export type FhirBase64Binary = string[];
export type FhirCode<T = string> = T;

export class FhirCodeableConcept extends FhirElement {
    coding?: FhirCoding[];
    text?: string;
}

export class FhirCoding extends FhirElement {
    code?: string;
    display?: string;
    system?: FhirUri;
    userSelected?: boolean;
    version?: string;
}

export type FhirContactPoint = any;
export type FhirDate = string; // partial without timezone
export type FhirDateTime = string;
export type FhirDuration = any;

export interface FhirEffective {
    effectiveDateTime?: FhirDateTime;
    effectivePeriod?: FhirPeriod;
}

export class FhirExtension extends FhirElement implements FhirValue {
    url!: FhirUri;
    valueAddress?: FhirAddress;
    valueAttachment?: any;
    valueBase64Binary?: FhirBase64Binary;
    valueBoolean?: boolean;
    valueCode?: FhirCode;
    valueCodeableConcept?: FhirCodeableConcept;
    valueCoding?: FhirCoding;
    valueContactPoint?: FhirContactPoint;
    valueDate?: FhirDate;
    valueDateTime?: FhirDateTime;
    valueDecimal?: number;
    valueHumanName?: FhirHumanName;
    valueIdentifier?: FhirIdentifier;
    valueInstant?: FhirInstant;
    valueInteger?: number;
    valuePeriod?: FhirPeriod;
    valueQuantity?: FhirQuantity;
    valueRange?: FhirRange;
    valueRatio?: FhirRatio;
    valueReference?: FhirReference<any>;
    valueSampledData?: FhirSampledData;
    valueSchedule?: FhirSchedule;
    valueString?: string;
    valueTime?: FhirTime;
    valueUri?: FhirUri;
}

export class FhirHumanName extends FhirElement {
    family?: string;
    given?: string[];
    period?: FhirPeriod;
    prefix?: string[];
    suffix?: string[];
    text?: string;
    use?: FhirCode;
}

export type FhirInstant = any; // datetime specific to atleast seconds with timezone

export class FhirIdentifier extends FhirElement {
    assigner?: FhirReference<FhirOrganization>;
    period?: FhirPeriod;
    type?: FhirCodeableConcept;
    system?: FhirUri;
    use?: FhirCode;
    value?: string;
}

export type FhirMarkdown = string;
export type FhirMeta = any;
export type FhirNarrative = any;

export class FhirPeriod extends FhirElement {
    start?: FhirDateTime;
    end?: FhirDateTime;
}

export class FhirSimpleQuantity extends FhirElement {
    code?: string;
    unit?: string;
    system?: string;
    value?: number;
}
export class FhirQuantity extends FhirSimpleQuantity {
    comparator?: string;
}

export class FhirRange extends FhirElement {
    low?: FhirSimpleQuantity;
    high?: FhirSimpleQuantity;
}

export class FhirRatio extends FhirElement {
    denominator?: FhirQuantity;
    numerator?: FhirQuantity;
}

export class FhirReference<T> {
    display?: string;
    identifier?: FhirIdentifier;
    reference?: string;
}

export class FhirSampledData extends FhirElement {
    data!: string;
    dimensions: number = NaN; // unsigned int >0
    factor?: number;
    lowerLimit?: number;
    origin!: FhirSimpleQuantity;
    period: number = NaN;
    upperLimit?: number;
}

export type FhirSchedule = any;
export type FhirTime = string;
export type FhirUri = string;

export interface FhirValue {
    valueAddress?: FhirAddress;
    valueAttachment?: any;
    valueBase64Binary?: FhirBase64Binary;
    valueBoolean?: boolean;
    valueCode?: FhirCode;
    valueCodeableConcept?: FhirCodeableConcept;
    valueCoding?: FhirCoding;
    valueContactPoint?: FhirContactPoint;
    valueDate?: FhirDate;
    valueDateTime?: FhirDateTime;
    valueDecimal?: number;
    valueHumanName?: FhirHumanName;
    valueIdentifier?: FhirIdentifier;
    valueInstant?: FhirInstant;
    valueInteger?: number;
    valuePeriod?: FhirPeriod;
    valueQuantity?: FhirQuantity;
    valueRange?: FhirRange;
    valueRatio?: FhirRatio;
    valueReference?: FhirReference<any>;
    valueSampledData?: FhirSampledData;
    valueSchedule?: FhirSchedule;
    valueString?: string;
    valueTime?: FhirTime;
    valueUri?: FhirUri;
}

import { ClassificationElement, CurationStatus } from 'shared/models.model';
import { Dictionary } from 'async';

export interface Organization {
    _id?: string;
    cdeStatusValidationRules: StatusValidationRules[];
    classifications: ClassificationElement[];
    count?: number; // calculated, from elastic
    emailAddress?: string;
    extraInfo?: string;
    htmlOverview?: string;
    longName?: string;
    endorsed: boolean;
    mailAddress?: string;
    name: string;
    nameContexts?: any[];
    nameTags?: string[];
    phoneNumber?: string;
    propertyKeys?: any[];
    uri?: string;
    workingGroupOf?: string;
}

export interface StatusValidationRules {
    id: number;
    field: string;
    occurence?: 'exactlyOne' | 'atLeastOne' | 'all';
    rule: {
        customValidations?: 'permissibleValuesUMLS'[],
        regex?: string
    };
    ruleName: string;
    targetStatus: CurationStatus;
}

export type StatusValidationRulesByOrg = Dictionary<StatusValidationRules[]>; // by Organization Name
export type StatusValidationRulesByOrgReg = Dictionary<StatusValidationRulesByOrg>; // by Registration Status

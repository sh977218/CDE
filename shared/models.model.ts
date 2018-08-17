import { CdeFormElastic } from 'shared/form/form.model';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';

export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export type supportedFhirResources = 'Observation'|'Procedure';
export const supportedFhirResourcesArray = ['Observation', 'Procedure'];

export class Attachment {
    comment?: string;
    fileid?: string;
    filename?: string;
    filesize?: number;
    filetype?: string;
    isDefault?: boolean;
    pendingApproval?: boolean;
    scanned?: boolean;
    uploadedBy?: {
        userId?: ObjectId,
        username?: string,
    };
    uploadDate?: Date;

    static isDefault(attachment: Attachment) {
        return attachment.isDefault === true;
    }
}

export type Cb<T = never, U = never, V = never> = (t?: T, u?: U, v?: V) => void;
export type CbErr<T = never, U = never, V = never> = (error?: string, t?: T, u?: U, v?: V) => void;
export type CbRet<R = never, T = never, U = never, V = never> = (t?: T, u?: U, v?: V) => R;

export class CdeId {
    [key: string]: string|undefined;
    _id?: ObjectId;
    id?: string;
    source?: string;
    version?: string;

    constructor(source?: string, id?: string) {
        this.source = source;
        this.id = id;
    }
}

export class Classification {
    elements: ClassficationElements[] = [];
    stewardOrg: {
        name: string
    } = {name};
    workingGroup?: boolean;
}

export class ClassificationClassified {
    classificationArray?: string[];
    selectedOrg?: string;
}

class ClassficationElements {
    elements: any[] = [];
    name?: string;
}

export class ClassificationHistory {
    categories?: string[];
    cdeId?: string;
    eltId?: string;
    orgName?: string;
}

export class CodeAndSystem {
    code?: string;
    system?: string;

    constructor(system: string, code: string) {
        this.system = system;
        this.code = code;
    }

    static compare(l: CodeAndSystem | undefined, r: CodeAndSystem | undefined) {
        return !l && !r || l && r && l.code === r.code && l.system === r.system;
    }

    static copy(u: CodeAndSystem | any) {
        if (u instanceof CodeAndSystem) {
            return u;
        } else {
            return new CodeAndSystem(u.system, u.code);
        }
    }
}

export class Comment {
    _id?: string;
    created?: Date;
    currentComment: boolean = false; // calculated, used by CommentsComponent
    currentlyReplying?: boolean; // calculated, used by CommentsComponent
    element?: {
        eltId?: string,
        eltType?: 'board' | 'cde' | 'form',
    };
    linkedTab?: string;
    pendingApproval?: boolean;
    replies?: CommentReply[];
    status: string = 'active';
    text?: string;
    user?: string;
    username?: string;
}

export class CommentReply {
    created?: Date;
    pendingApproval?: boolean;
    status: string = 'active';
    text?: string;
    user?: string;
    username?: string;
}

export type CurationStatus = 'Incomplete'|'Recorded'|'Candidate'|'Qualified'|'Standard'|'Preferred Standard'|'Retired';

export enum CurationStatusEnum {
    'Preferred Standard', 'Standard', 'Qualified', 'Recorded', 'Candidate', 'Incomplete', 'Retired'
}

export class DataSource {
    copyright?: FormattedValue;
    created?: Date;
    datatype?: string;
    registrationStatus?: string;
    sourceName?: string;
    updated?: Date;
}

export class DiscussionComments {
    currentCommentsPage?: number;
    latestComments?: Comment[];
    totalItems?: number;
}

export interface ElasticQueryParams {
    selectedOrg: string;
    q: string;
    page: number;
    classification: string[];
    classificationAlt: string[];
    regStatuses: CurationStatus[];
}

export interface ElasticQueryResponse {
    _shards?: any;
    aggregations?: any; // Elastic aggregated grouping
    cdes?: DataElementElastic[];
    forms?: CdeFormElastic[];
    hits: {
        max_score: number,
        hits: ElasticQueryResponseHit[],
        total: number
    };
    maxScore: number; // Elastic highest score on query
    took: number; // Elastic time to process query in milliseconds
    timed_out?: boolean;
    totalNumber: number; // Elastic number of results
}

export interface ElasticQueryResponseAggregationBucket {
    key: string;
    doc_count: number;
}

export interface ElasticQueryResponseHit {
    _id: string;
    _index?: string;
    _score?: number;
    _source?: any;
    _type?: string;
}

export abstract class Elt {
    _id!: ObjectId;
    archived: boolean = false;
    attachments: Attachment[] = [];
    changeNote?: string;
    checked?: boolean; // volatile, used by quickboard
    classification: Classification[] = []; // mutable
    comments: Comment[] = []; // mutable
    created?: Date;
    createdBy?: UserReference;
    highlight?: any; // volatile, Elastic
    history: ObjectId[] = [];
    ids: CdeId[] = [];
    imported?: Date;
    isDefault?: boolean; // client only
    isDraft?: boolean; // optional, draft only
    lastMigrationScript?: string;
    designations: Designation[] = [];
    definitions: Definition[] = [];
    origin?: string;
    primaryDefinitionCopy?: string; // volatile, Elastic
    primaryNameCopy?: string; // volatile, Elastic
    primaryNameSuggest?: string; // volatile, Elastic
    properties: Property[] = []; // mutable
    referenceDocuments: ReferenceDocument[] = []; // mutable
    registrationState: RegistrationState = new RegistrationState();
    stewardOrg: {
        name?: string,
    } = {};
    score?: number; // volatile, Elastic _score
    source?: string; // obsolete
    sources: DataSource[] = [];
    tinyId!: string; // server generated
    updated?: Date;
    updatedBy?: UserReference;
    usedBy?: string[]; // volatile, Classification stewardOrg names
    version?: string; // ??? elastic(version) or mongo(__v)

    static isDefault(elt: Elt) {
        return elt.isDefault === true;
    }

    static getEltUrl: (elt: Elt) => string;

    static getLabel(elt: Elt) {
        return elt.primaryNameCopy || elt.designations[0].designation;
    }

    static trackByElt(index: number, elt: Elt): string {
        return elt.tinyId;
    }
}

export class EltRef {
    ids: CdeId[] = [];
    name?: string;
    outdated?: boolean; // calculated, by server for client
    tinyId!: string;
    version?: string;
}

export class FormattedValue {
    value: string;
    valueFormat?: 'html'|undefined;

    constructor(value = '') {
        this.value = value;
    }
}

export type Instruction = FormattedValue;

export class Designation {
    designation: string;
    tags: string[] = [];

    constructor(designation = '') {
        this.designation = designation;
    }
}

export class Definition {
    definition: string;
    definitionFormat?: 'html'|undefined; // TODO: change to use FormattedValue
    tags: string[] = [];

    constructor(definition = '') {
        this.definition = definition;
    }
}

export class DerivationRule {
    formula?: DerivationRuleFormula;
    fullCdes?: DataElement[];
    inputs?: string[];
    name?: string;
    outputs?: string[];
    ruleType?: DerivationRuleType;
}

type DerivationRuleFormula = 'sumAll'|'mean';
type DerivationRuleType = 'score'|'panel';

export class Notification {
    _id?: {
        title?: string,
        url?: string
    };
}

export class Organization {
    cdeStatusValidationRules?: StatusValidationRules[];
    classifications?: ClassficationElements[];
    count?: number; // calculated, from elastic
    emailAddress?: string;
    extraInfo?: string;
    htmlOverview?: string;
    longName?: string;
    mailAddress?: string;
    name!: string;
    nameContexts?: any[];
    nameTags?: any[];
    phoneNumber?: string;
    propertyKeys?: any[];
    uri?: string;
    workingGroupOf?: string;

    static validate(o: Organization) {
        if (!o.cdeStatusValidationRules) o.cdeStatusValidationRules = [];
        if (!o.classifications) o.classifications = [];
        if (!o.nameContexts) o.nameContexts = [];
        if (!o.nameTags) o.nameTags = [];
        if (!o.propertyKeys) o.propertyKeys = [];
    }
}

export type ObjectId = string;

export class PermissibleValue {
    codeSystemName?: string;
    codeSystemVersion?: string;
    permissibleValue!: string;
    valueMeaningCode?: string;
    valueMeaningDefinition?: string;
    valueMeaningName?: string;
}

export class Property {
    _id?: ObjectId;
    key?: string;
    source?: string;
    value?: string;
    valueFormat?: string;
}

export class PublishedForm {
    _id?: ObjectId;
    name?: string;
}

export class ReferenceDocument {
    _id?: ObjectId;
    document?: string;
    docType?: string;
    languageCode?: string;
    providerOrg?: string;
    referenceDocumentId?: string;
    source?: string;
    text?: string;
    title?: string;
    uri?: string;
}

export class RegistrationState {
    administrativeNote?: string;
    administrativeStatus?: string;
    effectiveDate?: Date;
    registrationStatus: CurationStatus = 'Incomplete';
    replacedBy?: {
        tinyId?: string,
    };
    unresolvedIssue?: string;
    untilDate?: Date;
}

export class StatusValidationRules {
    id!: number;
    field?: string;
    occurence?: 'exactlyOne'|'atLeastOne'|'all';
    rule: {
        regex?: string
    } = {};
    ruleName?: string;
    targetStatus?: CurationStatus;
}

export class User {
    _id!: ObjectId;
    accessToken?: string;
    avatarUrl?: string;
    email?: string;
    formViewHistory?: string[];
    hasMail?: boolean;
    lastViewNotification?: Date;
    orgAdmin: string[] = [];
    orgCurator: string[] = [];
    publishedForms?: PublishedForm[];
    quota?: number;
    refreshToken?: string;
    roles?: string[];
    searchSettings?: {
        defaultSearchView?: string,
        lowestRegistrationStatus?: string,
        tableViewFields?: {
            administrativeStatus?: boolean,
            ids?: boolean,
            identifiers?: string[],
            name?: boolean,
            naming?: boolean,
            nbOfPVs?: boolean,
            numQuestions?: boolean,
            permissibleValues?: boolean,
            questionTexts?: boolean,
            registrationStatus?: boolean,
            source?: boolean,
            stewardOrg?: boolean,
            tinyId?: boolean,
            uom?: boolean,
            updated?: boolean,
            usedBy?: boolean,
        },
        version?: number,
    };
    siteAdmin?: boolean;
    tester?: boolean;
    username?: string;
    viewHistory?: string[];
}

export interface UserReference {
    userId: ObjectId;
    username: string;
}

export interface UserReferenceSecondary {
    _id: ObjectId;
    username?: string;
}

export interface UsersOrgQuery {
    name: string;
    users: UserReferenceSecondary[];
}

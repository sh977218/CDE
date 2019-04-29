import { Observable } from 'rxjs';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';

export function assertThrow(): never {
    throw new Error('Please submit a bug report.');
}

export function assertTrue(x: boolean): void {
    if (!PRODUCTION) {
        if (!x) {
            throw new Error('Assertion Failed.');
        }
    }
}

export function assertUnreachable(x: never): never {
    throw new Error('Unreachable');
}

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
export type Cb1<T = never, U = never, V = never> = (t: T, u?: U, v?: V) => void;
export type Cb2<T = never, U = never, V = never> = (t: T, u: U, v?: V) => void;
export type Cb3<T = never, U = never, V = never> = (t: T, u: U, v: V) => void;
export type CbErr<T = never, U = never, V = never> = (error?: string, t?: T, u?: U, v?: V) => void;
export type CbErrObj<E = string, T = never, U = never, V = never> = (error?: E, t?: T, u?: U, v?: V) => void;
export type CbRet<R = never, T = never, U = never, V = never> = (t?: T, u?: U, v?: V) => R;
export type CbRet1<R = never, T = never, U = never, V = never> = (t: T, u?: U, v?: V) => R;
export type CbRet2<R = never, T = never, U = never, V = never> = (t: T, u: U, v?: V) => R;
export type CbRet3<R = never, T = never, U = never, V = never> = (t: T, u: U, v: V) => R;

export class CdeId {
    [key: string]: string | undefined;

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
    elements: ClassficationElement[] = [];
    stewardOrg: {
        name: string
    } = {name};
    workingGroup?: boolean;
}

export class ClassificationClassified {
    classificationArray?: string[];
    selectedOrg?: string;
}

export class ClassficationElement {
    elements: ClassficationElement[] = [];
    name?: string;
}

export class ClassificationHistory {
    categories?: string[];
    cdeId?: string;
    eltId?: string;
    orgName?: string;
}

export class CodeAndSystem {
    code: string;
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

export class CommentReply {
    _id?: ObjectId;
    created?: Date;
    pendingApproval?: boolean;
    status: string = 'active';
    text?: string;
    user!: UserRef;
}

export class Comment extends CommentReply {
    currentComment: boolean = false; // calculated, used by CommentsComponent
    currentlyReplying?: boolean; // calculated, used by CommentsComponent
    element?: {
        eltId?: string,
        eltType?: 'board' | 'cde' | 'form',
    };
    linkedTab?: string;
    replies?: CommentReply[];
}

export type CurationStatus =
    'Incomplete' |
    'Recorded' |
    'Candidate' |
    'Qualified' |
    'Standard' |
    'Preferred Standard' |
    'Retired';

export enum CurationStatusEnum {
    'Preferred Standard', 'Standard', 'Qualified', 'Recorded', 'Candidate', 'Incomplete', 'Retired'
}

export abstract class DataService {
    abstract getDrafts(): Observable<Drafts>;
}

export class DataSource {
    copyright?: FormattedValue;
    created?: Date;
    datatype?: string;
    imported?: Date;
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
    aggregations?: ElasticQueryResponseAggregation & { [key: string]: ElasticQueryResponseAggregation }; // Elastic aggregated grouping
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

export interface ElasticQueryResponseAggregation {
    [key: string]: { // 1 or 2 levels of keys...
        [key: string]: { buckets: ElasticQueryResponseAggregationBucket[] } & ElasticQueryResponseAggregationBucket[],
        buckets: { buckets: ElasticQueryResponseAggregationBucket[] } & ElasticQueryResponseAggregationBucket[]
    };
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
    __v!: number;
    _id!: ObjectId;
    archived: boolean = false;
    attachments: Attachment[] = [];
    changeNote?: string;
    checked?: boolean; // volatile, used by quickboard
    classification: Classification[] = []; // mutable
    comments: Comment[] = []; // mutable
    created?: Date;
    createdBy?: UserRefSecondary;
    definitions: Definition[] = [];
    designations: Designation[] = [];
    history: ObjectId[] = [];
    ids: CdeId[] = [];
    imported?: Date;
    isDefault?: boolean; // client only
    isDraft?: boolean; // optional, draft only
    lastMigrationScript?: string;
    origin?: string;
    properties: Property[] = []; // mutable
    referenceDocuments: ReferenceDocument[] = []; // mutable
    registrationState: RegistrationState = new RegistrationState();
    stewardOrg: {
        name?: string,
    } = {};
    source?: string; // obsolete
    sources: DataSource[] = [];
    tinyId!: string; // server generated
    updated?: Date;
    updatedBy?: UserRefSecondary;
    usedBy?: string[]; // volatile, Classification stewardOrg names
    version?: string; // ??? elastic(version) or mongo(__v)

    static isDefault(elt: Elt) {
        return elt.isDefault === true;
    }

    static getEltUrl: (elt: Elt) => string;

    static getLabel(elt: Elt) {
        return (elt as any).primaryNameCopy || elt.designations[0].designation;
    }

    static trackByElt(index: number, elt: Elt): string {
        return elt.tinyId;
    }

    static validate(elt: Elt) {
        if (!elt.classification) elt.classification = [];
        if (!elt.ids) elt.ids = [];
    }

}

export declare type EltLog = {
    date: Date;
    user: {
        username: string  // not UserRef!?
    };
    adminItem: EltLogEltRef;
    previousItem: EltLogEltRef;
    diff: EltLogDiff[];
};

export declare type EltLogDiff = {
    fieldName?: string; // calculated makeHumanReadable
    item?: {
        kind: 'D' | 'N';
        lhs?: string;
        rhs?: string;
    };
    kind: 'A' | 'D' | 'E' | 'N';
    lhs?: string;
    modificationType?: string; // calculated makeHumanReadable
    newValue?: string; // calculated makeHumanReadable
    path: (string | number)[];
    previousValue?: string; // calculated makeHumanReadable
    rhs?: string;
};

export class EltRef {
    name?: string;
    outdated?: boolean; // calculated, by server for client
    tinyId!: string;
    version?: string;
}

export class EltLogEltRef extends EltRef {
    _id!: ObjectId;
}

export type Embed = {
    _id?: ObjectId,
    cde?: EmbedItem,
    form?: EmbedItem
    height: number,
    name?: string,
    org: string,
    width: number,
};

export type EmbedItem = {
    cdes?: boolean; // form only
    classifications?: {
        label: string,
        startsWith: string,
        exclude: string,
        selectedOnly?: boolean
    }[],
    ids?: {
        idLabel: string,
        source: string,
        version?: boolean,
        versionLabel: string
    }[]
    linkedForms?: { // cde only
        label?: string,
        show?: boolean,
    },
    lowestRegistrationStatus: CurationStatus,
    nameLabel?: string,
    nbOfQuestions?: boolean; // form only
    otherNames?: {
        label: string,
        contextName: string
    }[],
    pageSize: number,
    permissibleValues?: boolean; // cde only
    primaryDefinition?: {
        label?: string,
        show?: boolean,
        style?: string
    },
    properties?: {
        label: string,
        limit: number
        key: string,
    }[],
    registrationStatus?: {
        show?: boolean,
        label?: string
    },
    sdcLink?: boolean; // form only
};

export class FormattedValue {
    value: string;
    valueFormat?: 'html' | undefined;

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
    definitionFormat?: 'html' | undefined; // TODO: change to use FormattedValue
    tags: string[] = [];

    constructor(definition = '') {
        this.definition = definition;
    }
}

export class DerivationRule {
    formula?: DerivationRuleFormula;
    fullCdes?: DataElement[];
    inputs: string[] = [];
    name?: string;
    outputs?: string[];
    ruleType?: DerivationRuleType;
}

type DerivationRuleFormula = 'sumAll' | 'mean' | 'bmi';
type DerivationRuleType = 'score' | 'panel';
export type Drafts = { draftCdes: DataElement[], draftForms: CdeForm[] };
export type Item = DataElement | CdeForm;
export type ItemElastic = DataElementElastic | CdeFormElastic;
export type ListTypes = 'accordion' | 'table' | 'summary';
export type NotificationSettingsMediaType = 'drawer' | 'push';
export type NotificationSettingsMedia = {
    [key in NotificationSettingsMediaType]?: boolean;
};
export type NotificationSettingsType = 'approvalAttachment' | 'approvalComment' | 'comment';
export type NotificationSettings = {
    [key in NotificationSettingsType]?: NotificationSettingsMedia;
};

export class Organization {
    cdeStatusValidationRules?: StatusValidationRules[];
    classifications?: ClassficationElement[];
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
    [key: string]: any;

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

export class Source {
    _id?: string;
    linkTemplateDe: string = '';
    linkTemplateForm: string = '';
    version?: string;

    constructor(id: string) {
        this._id = id;
    }
}

export class StatusValidationRules {
    id!: number;
    field?: string;
    occurence?: 'exactlyOne' | 'atLeastOne' | 'all';
    rule: {
        regex?: string
    } = {};
    ruleName?: string;
    targetStatus?: CurationStatus;
}

export type StatusValidationRulesOrgs = { [org: string]: StatusValidationRules[] };

export type TableViewFields = {
    administrativeStatus?: boolean,
    customFields?: { key: string, label?: string, style?: string }[];
    ids?: boolean,
    identifiers?: string[],
    linkedForms?: boolean, // cde only
    name?: boolean,
    naming?: boolean,
    nbOfPVs?: boolean,
    numQuestions?: boolean,
    permissibleValues?: boolean,
    pvCodeNames?: boolean,
    questionTexts?: boolean,
    registrationStatus?: boolean,
    source?: boolean,
    stewardOrg?: boolean,
    tinyId?: boolean,
    uom?: boolean,
    updated?: boolean,
    usedBy?: boolean,
};

export type Task = {
    date: Date,
    id: string,
    idType: TaskIdType,
    name: string,
    properties: { key: string, value?: string }[],
    source: TaskSource,
    state?: number,
    text?: string,
    type: TaskType,
    url: string,
};

export type TaskIdType =
    'attachment' |
    'cde' |
    'clientError' |
    'comment' |
    'commentReply' |
    'form' |
    'serverError' |
    'versionUpdate';
export type TaskType = 'approve' | 'comment' | 'error' | 'message' | 'vote';
export type TaskSource = 'calculated' | 'user';
export const TaskStateUnread = 1;

export class User {
    _id!: ObjectId;
    accessToken?: string;
    avatarUrl?: string;
    email?: string;
    formViewHistory?: string[];
    hasMail?: boolean;
    lastViewNotification?: Date;
    notificationSettings?: NotificationSettings;
    orgAdmin: string[] = [];
    orgCurator: string[] = [];
    publishedForms?: PublishedForm[];
    quota?: number;
    refreshToken?: string;
    roles?: string[];
    searchSettings?: UserSearchSettings;
    siteAdmin?: boolean;
    tasks?: Task[];
    tester?: boolean;
    username?: string;
    viewHistory?: string[];
}

export interface UserRef {
    _id: ObjectId;
    username?: string;
}

export interface UserRefSecondary {
    userId: ObjectId;
    username: string;
}

export type UserSearchSettings = {
    defaultSearchView: ListTypes,
    includeRetired?: boolean
    lowestRegistrationStatus: CurationStatus,
    tableViewFields: TableViewFields,
    version?: number,
};

export interface UsersOrgQuery {
    name: string;
    users: UserRef[];
}

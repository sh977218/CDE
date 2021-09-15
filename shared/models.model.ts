import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';

export type ObjectId = any; // string(client and transport) mongoose.Types.ObjectId(server) but not at the same time
export type ArrayToType<U extends readonly string[]> = U[number];

export function assertThrow(): void {
    if (notInProduction()) { // TODO: else need to log(NODE) or send client error(BROWSER)
        throw new Error('Please submit a bug report.');
    }
}

export function assertTrue(x: boolean): void {
    if (notInProduction()) {
        if (!x) {
            throw new Error('Assertion Failed.');
        }
    }
}

export function notInProduction(): boolean {
    return typeof PRODUCTION !== 'undefined' && !PRODUCTION
        || typeof process !== 'undefined' && !process.env.PRODUCTION;
}

export function assertUnreachable(x: never): never {
    console.error('Unreachable ' + JSON.stringify(x));
    // handleError(new Error('Unreachable ' + JSON.stringify(x)));
    throw new Error('unreachable');
}

export interface Attachment {
    comment?: string;
    fileid: string;
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
    uploadDate?: number;
}

export function isDefault(attachment: Attachment) {
    return attachment.isDefault === true;
}

export type Cb = () => void;
export type Cb1<T = void> = (t: T) => void;
export type Cb2<T = void, U = void> = (t: T, u: U) => void;
export type Cb3<T = void, U = void, V = void> = (t: T, u: U, v: V) => void;
export type CbErr = (error: string | undefined) => void;
export type CbErr1<T = void> = (error: string | undefined, t: T) => void;
export type CbErr2<T = void, U = void> = (error: string | undefined, t: T, u: U) => void;
export type CbErr3<T = void, U = void, V = void> = (error: string | undefined, t: T, u: U, v: V) => void;
export type CbError = (error: Error | null) => void;
export type CbError1<T = void> = (error: Error | null, t: T) => void;
export type CbError2<T = void, U = void> = (error: Error | null, t: T, u: U) => void;
export type CbError3<T = void, U = void, V = void> = (error: Error | null, t: T, u: U, v: V) => void;
export type CbErrorObj<E = string | undefined> = (error: E) => void;
export type CbErrorObj1<E = string | undefined, T = void> = (error: E, t: T) => void;
export type CbErrorObj2<E = string | undefined, T = void, U = void> = (error: E, t: T, u: U) => void;
export type CbErrorObj3<E = string | undefined, T = void, U = void, V = void> = (error: E, t: T, u: U, v: V) => void;
export type CbNode<T = void> = CbError1<T | null | void>;
export type CbRet<R = void> = () => R;
export type CbRet1<R = void, T = void> = (t: T) => R;
export type CbRet2<R = void, T = void, U = void> = (t: T, u: U) => R;
export type CbRet3<R = void, T = void, U = void, V = void> = (t: T, u: U, v: V) => R;

export class CdeId {
    [key: string]: ObjectId | undefined;

    _id?: ObjectId;
    id?: string;
    source?: string;
    version?: string;

    constructor(source?: string, id?: string) {
        this.source = source;
        this.id = id;
    }
}

export type ModuleAll = 'board' | 'cde' | 'form';
export type ModuleItem = 'cde' | 'form';

export class Classification {
    elements: ClassificationElement[] = [];
    stewardOrg: {
        name: string
    } = {name: ''};
    workingGroup?: boolean;
}

export interface ClassificationClassified {
    classificationArray: string[];
    selectedOrg: string;
}

export interface ClassificationClassifier {
    categories: string[];
    orgName: string;
}

export class ClassificationElement {
    elements: ClassificationElement[] = [];
    name!: string;
}

export interface ClassificationHistory {
    categories: string[];
    cdeId?: string;
    eltId?: string;
    orgName: string;
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

export class CommentSingle {
    _id!: ObjectId;
    created: Date = new Date();
    pendingApproval?: boolean;
    status: string = 'active';
    text?: string;
    user!: {
        _id: ObjectId;
        username: string;
    };
}

export class CommentReply extends CommentSingle {}

export class Comment extends CommentSingle {
    currentComment: boolean = false; // calculated, used by CommentsComponent
    currentlyReplying?: boolean; // calculated, used by CommentsComponent
    element: {
        eltId: ObjectId,
        eltType: ModuleAll,
    } = {eltId: '', eltType: 'cde'};
    linkedTab: string = '';
    replies: CommentReply[] = [];
}

export type CurationStatus =
    'Incomplete' |
    'Recorded' |
    'Candidate' |
    'Qualified' |
    'Standard' |
    'Preferred Standard' |
    'Retired';

export class DataSource {
    copyright?: FormattedValue;
    created?: Date;
    datatype?: string;
    imported?: Date;
    registrationStatus?: string;
    administrativeStatus?: string;
    sourceName?: string;
    updated?: Date;
}

export type DateType = Date | string | number; // number on server, string transport, Date on load from db or on create in client

export interface DiscussionComments {
    currentCommentsPage: number;
    latestComments: Comment[];
    totalItems: number;
}

export interface ElasticQueryParams {
    selectedOrg: string;
    q: string;
    page: number;
    classification: string[];
    classificationAlt: string[];
    regStatuses: CurationStatus[];
}

export type ElasticQueryError = {
    status: 406,
    error: string,
} | {
    status: 400,
    error: {
        type: 'parsing_exception' | 'search_phase_execution_exception', reason: string, line?: number, col?: number,
        root_cause: { type: 'parsing_exception' | 'search_phase_execution_exception', reason: string, line?: number, col?: number }[]
    }
} | {
    status: 500,
    error: { type: 'json_parse_exception', reason: string, root_cause: { type: 'json_parse_exception', reason: string }[] }
};

export interface ElasticQueryResponse<T = void> {
    _shards: {
        failed: number,
        successful: number,
        total: number,
    };
    hits: {
        hits: ElasticQueryResponseHit<T>[],
        max_score: number,
        total: number
    };
    status?: undefined;
    took: number; // Elastic time to process query in milliseconds
    timed_out: boolean;
}

export type ElasticQueryResponseDe = ElasticQueryResponse<DataElementElastic> & {
    cdes: DataElementElastic[];
};
export type ElasticQueryResponseForm = ElasticQueryResponse<CdeFormElastic> & {
    forms: CdeFormElastic[];
};
export type ElasticQueryResponseItem = ElasticQueryResponseDe | ElasticQueryResponseForm;

interface ElasticQueryResponseAggregationsPart {
    aggregations: ElasticQueryResponseAggregation & { [key: string]: ElasticQueryResponseAggregation }; // Elastic aggregated grouping
}

export type ElasticQueryResponseAggregations<T> = ElasticQueryResponse<T> & ElasticQueryResponseAggregationsPart;
export type ElasticQueryResponseAggregationsDe = ElasticQueryResponseDe & ElasticQueryResponseAggregationsPart;
export type ElasticQueryResponseAggregationsForm = ElasticQueryResponseForm & ElasticQueryResponseAggregationsPart;
export type ElasticQueryResponseAggregationsItem =
    ElasticQueryResponseAggregationsDe
    | ElasticQueryResponseAggregationsForm;
export type SearchResponseAggregationDe =
    ElasticQueryResponseAggregationsDe
    & { maxScore: number, took: number, totalNumber: number };
export type SearchResponseAggregationForm =
    ElasticQueryResponseAggregationsForm
    & { maxScore: number, took: number, totalNumber: number };
export type SearchResponseAggregationItem = SearchResponseAggregationDe | SearchResponseAggregationForm;

export interface ElasticQueryResponseAggregation {
    [key: string]: { // 1 or 2 levels of keys...
        [key: string]: { buckets: ElasticQueryResponseAggregationBucket[] } & ElasticQueryResponseAggregationBucket[],
        buckets: { buckets: ElasticQueryResponseAggregationBucket[] } & ElasticQueryResponseAggregationBucket[]
    };
}

export interface ElasticQueryResponseAggregationBucket {
    checked: boolean;
    key: string;
    doc_count: number;
}

export interface ElasticQueryResponseHit<T> {
    _id: string;
    _index?: string;
    _score: number;
    _source: T;
    _type?: string;
    highlight?: any;
}

export abstract class Elt {
    /* tslint:disable */
    __v!: number;
    /* tslint:enable */
    _id!: ObjectId;
    archived: boolean = false;
    NIH_Endorsed: boolean = false;
    attachments: Attachment[] = [];
    changeNote?: string;
    checked?: boolean; // volatile, used by board compare side-by-side
    classification: Classification[] = []; // mutable
    comments: Comment[] = []; // mutable
    created?: DateType = new Date();
    createdBy?: UserRefSecondary;
    definitions: Definition[] = [];
    designations: Designation[] = [];
    history: ObjectId[] = [];
    ids: CdeId[] = [];
    imported?: Date | string | number;
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
    updated?: DateType;
    updatedBy?: UserRefSecondary;
    usedBy?: string[]; // volatile, Classification stewardOrg names
    version?: string; // ??? elastic(version) or mongo(__v)

    static getEltUrl: (elt: Elt) => string;

    static isDefault(elt: Elt) {
        return elt.isDefault === true;
    }

    static getLabel(elt: Elt) {
        return (elt as any).primaryNameCopy || elt.designations[0].designation;
    }

    static trackByElt(index: number, elt: Elt): string {
        return elt.tinyId;
    }

    static validate(elt: Elt) {
        if (!elt.classification) {
            elt.classification = [];
        }
        if (!elt.ids) {
            elt.ids = [];
        }
    }

}

export declare interface EltLog {
    date: Date;
    user: {
        username: string  // not UserRef!?
    };
    adminItem: EltLogEltRef;
    previousItem?: EltLogEltRef;
    diff?: EltLogDiff[];
}

export type EltLogDiff = EltLogDiffAmend | {
    fieldName?: string; // calculated makeHumanReadable
    kind: 'D' | 'E' | 'N';
    lhs?: string;
    modificationType?: string; // calculated makeHumanReadable
    newValue?: string; // calculated makeHumanReadable
    path: (string | number)[];
    previousValue?: string; // calculated makeHumanReadable
    rhs?: string;
};

export interface EltLogDiffAmend {
    fieldName?: string; // calculated makeHumanReadable
    item: {
        kind: 'D' | 'N';
        lhs: string | undefined;
        rhs: string | undefined;
        path: string[];
    };
    kind: 'A';
    lhs: string | undefined;
    modificationType?: string; // calculated makeHumanReadable
    newValue?: string; // calculated makeHumanReadable
    path: (string)[];
    previousValue?: string; // calculated makeHumanReadable
    rhs: string | undefined;
}

export class EltRef {
    name?: string;
    outdated?: boolean; // calculated, by server for client
    tinyId!: string;
    version?: string;
}

export class EltLogEltRef extends EltRef {
    _id!: ObjectId;
}

export interface Embed {
    _id?: ObjectId;
    cde?: EmbedItem; // data element only
    form?: EmbedItem; // form only
    height: number;
    name?: string;
    org: string;
    width: number;
}

export interface EmbedItem {
    cdes?: boolean; // form only
    classifications?: {
        label: string,
        startsWith: string,
        exclude: string,
        selectedOnly?: boolean
    }[];
    ids?: {
        idLabel: string,
        source: string,
        version?: boolean,
        versionLabel: string
    }[];
    linkedForms?: { // cde only
        label?: string,
        show?: boolean,
    };
    lowestRegistrationStatus: CurationStatus;
    nameLabel?: string;
    nbOfQuestions?: boolean; // form only
    otherNames?: {
        label: string,
        tags: string,
        contextName: string
    }[];
    pageSize: number;
    permissibleValues?: boolean; // cde only
    primaryDefinition?: {
        label?: string,
        show?: boolean,
        style?: string
    };
    properties?: {
        label: string,
        limit: number
        key: string,
    }[];
    registrationStatus?: {
        show?: boolean,
        label?: string
    };
    sdcLink?: boolean; // form only
}

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
    tags?: string[];

    constructor(designation = '') {
        this.designation = designation;
        this.tags = [];
    }
}

export class Definition {
    definition: string;
    definitionFormat?: 'html' | undefined; // TODO: change to use FormattedValue
    tags: string[] = [];

    constructor(definition = '') {
        this.definition = definition;
        this.tags = [];
    }
}

export interface DerivationRule {
    formula?: DerivationRuleFormula;
    fullCdes?: DataElement[];
    inputs: string[];
    name: string;
    outputs?: string[];
    ruleType?: DerivationRuleType;
}

type DerivationRuleFormula = 'sumAll' | 'mean' | 'bmi';
type DerivationRuleType = 'score' | 'panel';

export interface Drafts {
    draftCdes: DataElement[];
    draftForms: CdeForm[];
}

interface BoardPart {
    _id: ObjectId;
    createdDate: Date;
    description: string;
    elementType: 'board';
    id: string; // generated by mongoose toObject() ???
    name: string;
    owner: UserRefSecondary;
    pins: BoardPin[];
    shareStatus: 'Private' | 'Public';
    tags: string[];
    type: ModuleItem;
    updatedDate: Date;
    users: BoardUser[];
}

export interface BoardPin {
    pinnedDate: Date;
    tinyId: string;
    type: ModuleItem;
}

export interface BoardUser {
    lastViewed?: Date;
    role?: 'viewer';
    username: string;
}

export type Board = BoardDe | BoardForm;
export type BoardDe = BoardPart & { elts: DataElement[] };
export type BoardForm = BoardPart & { elts: CdeForm[] };

export function isBoard(b: Item | Board): b is Board {
    return !!(b as Board).owner;
}

export interface IdVersion {
    id: string;
    version?: string;
}

export type Item = DataElement | CdeForm;

export interface ItemClassification {
    categories: string[];
    elements?: IdVersion[];
    orgName: string;
    eltId?: string;
    cdeId?: string;
    tinyId?: string;
    version?: string;
}

export interface ItemClassificationNew {
    categories: string[];
    orgName: string;
    newName: string;
}

export type ItemClassificationElt = {
    categories: string[];
    elements?: IdVersion[];
    eltId: string;
    orgName: string;
}

export type ItemElastic = DataElementElastic | CdeFormElastic;
export type ListTypes = 'accordion' | 'table' | 'summary';

export type NotificationSettingsMediaType = 'drawer' | 'push';
export type NotificationSettingsMedia = {
    [key in NotificationSettingsMediaType]: boolean | undefined;
};
export type NotificationSettingsType = 'approvalAttachment' | 'approvalComment' | 'comment';
export type NotificationSettings = {
    [key in NotificationSettingsType]?: NotificationSettingsMedia;
};

export const permissibleValueCodeSystems = ['LOINC', 'NCI Thesaurus', 'SNOMEDCT US', 'UMLS'] as const;
export type PermissibleValueCodeSystem = ArrayToType<typeof permissibleValueCodeSystems>;
export class PermissibleValue {
    [key: string]: any;

    codeSystemName?: PermissibleValueCodeSystem;
    codeSystemVersion?: string;
    permissibleValue!: string;
    valueMeaningCode?: string;
    valueMeaningDefinition?: string;
    valueMeaningName?: string;
}

export class Property {
    _id?: ObjectId;
    key: string = '';
    source?: string;
    value?: string;
    valueFormat?: string;
}

export class PublishedForm {
    _id?: ObjectId;
    id?: string;
    name?: string;
}

export class ReferenceDocument {
    _id?: ObjectId;
    document?: string;
    docType?: string;
    edit?: boolean; // tab GUI
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
    registrationStatusSortOrder?: number; // volatile, used by elastic
    replacedBy?: {
        tinyId?: string,
    };
    unresolvedIssue?: string;
    untilDate?: Date;
}

export class Source {
    _id: string;
    linkTemplateDe: string = '';
    linkTemplateForm: string = '';
    version?: string;

    constructor(_id: string) {
        this._id = _id;
    }
}

export interface TableViewFields {
    administrativeStatus?: boolean;
    customFields?: { key: string, label?: string, style?: string }[];
    ids?: boolean;
    identifiers?: string[];
    linkedForms?: boolean; // cde only
    name?: boolean;
    naming?: boolean;
    nbOfPVs?: boolean;
    numQuestions?: boolean;
    permissibleValues?: boolean;
    pvCodeNames?: boolean;
    questionTexts?: boolean;
    registrationStatus?: boolean;
    source?: boolean;
    stewardOrg?: boolean;
    tinyId?: boolean;
    uom?: boolean;
    updated?: boolean;
    usedBy?: boolean;
}

export interface Task {
    date: Date;
    id: string;
    idType: TaskIdType;
    name: string;
    properties: { key: string, value?: string }[];
    source: TaskSource;
    state?: number;
    text?: string;
    type: TaskType;
    url?: string;
}

export type TaskIdType =
    'attachment' |
    'board' |
    'cde' |
    'clientError' |
    'comment' |
    'commentReply' |
    'form' |
    'serverError' |
    'versionUpdate';
export type TaskType = 'approve' | 'comment' | 'error' | 'message' | 'vote';
export type TaskSource = 'calculated' | 'user';
export const TASK_STATE_UNREAD = 1;

export type UserRoles = ArrayToType<typeof rolesEnum>;
export const rolesEnum = ['AttachmentReviewer', 'BoardPublisher', 'CommentAuthor',
    'CommentReviewer', 'DocumentationEditor', 'GovernanceGroup', 'NlmCurator', 'OrgAuthority'] as const;

export interface User {
    _id: ObjectId;
    accessToken?: string;
    avatarUrl?: string;
    email?: string;
    formViewHistory?: string[];
    notificationSettings?: NotificationSettings;
    orgAdmin: string[];
    orgCurator: string[];
    orgEditor: string[];
    // password should not be here
    publishedForms?: PublishedForm[];
    quota?: number;
    refreshToken?: string;
    roles?: UserRoles[];
    searchSettings?: UserSearchSettings;
    siteAdmin?: boolean;
    tasks?: Task[];
    tester?: boolean;
    username: string;
    viewDrafts?: boolean;
    viewHistory?: string[];
    cdeDefaultBoard?: string;
    formDefaultBoard?: string;
}

export interface UserRef {
    _id: ObjectId;
    username?: string;
}

export interface UserRefSecondary {
    userId: ObjectId;
    username: string;
}

export interface UserSearchSettings {
    defaultSearchView: ListTypes;
    tableViewFields: TableViewFields;
}

export interface UsersOrgQuery {
    name: string;
    users: UserRef[];
}

import { CdeForm } from 'shared/form/form.model';
import { DataElement } from 'shared/de/dataElement.model';

export class Attachment {
    comment: string;
    fileid: string;
    filename: string;
    filesize: number;
    filetype: string;
    isDefault: boolean;
    pendingApproval: boolean;
    scanned: boolean;
    uploadedBy: {
        userId: ObjectId,
        username: string,
    };
    uploadDate: Date;
}

export class CdeId {
    _id?: ObjectId;
    id: string;
    source: string;
    version?: string;

    constructor(source = undefined, id = undefined) {
        this.source = source;
        this.id = id;
    }

    static copy(id: CdeId) {
        return Object.assign(new CdeId(), id);
    }
}

export class Classification {
    elements: ClassficationElements[] = [];
    stewardOrg: {
        name: string
    };
    workingGroup: boolean;

    static copy(c: Classification) {
        return Object.assign(new Classification(), c ? JSON.parse(JSON.stringify(c)) : undefined);
    }
}

class ClassficationElements {
    elements: any[] = [];
    name: string;
}

export class CodeAndSystem {
    code: string;
    system: string;

    constructor(system: string, code: string) {
        this.system = system;
        this.code = code;
    }

    compare(r) {
        return this.code === r.code && this.system === r.system;
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
    created: Date;
    element: {
        eltId: string,
        eltType: string,
    };
    linkedTab: string;
    pendingApproval: boolean;
    replies: CommentReply[];
    status: string = "active";
    text: string;
    user: string;
    username: string;

    static copy(comment: Comment) {
        return Object.assign(new Comment(), comment ? JSON.parse(JSON.stringify(comment)) : undefined);
    }
}

class CommentReply {
    created: Date;
    pendingApproval: boolean;
    status: string = "active";
    text: string;
    user: string;
    username: string;
}

export class DataSource {
    copyright: FormattedValue;
    created: Date;
    datatype: string;
    registrationStatus: string;
    sourceName: string;
    updated: Date;

    static copy(dataSource: DataSource) {
        let newDataSource = Object.assign(new DataSource(), dataSource);
        newDataSource.copyright = Object.assign(new FormattedValue(),
            dataSource.copyright ? JSON.parse(JSON.stringify(dataSource.copyright)) : undefined);
        return newDataSource;
    }
}

export class DiscussionComments {
    currentCommentsPage: number;
    latestComments: Comment[];
    totalItems: number;
}

export interface ElasticQueryResponse {
    _shards: any;
    aggregations: any; // Elastic aggregated grouping
    cdes: DataElement[]; // optional
    forms: CdeForm[]; // optional
    hits: {
        max_score: number,
        hits: {
            _id: string,
            _index: string,
            _score: number,
            _source: any,
            _type: string
        }[],
        total: number
    };
    maxScore: number; // Elastic highest score on query
    took: number; // Elastic time to process query in milliseconds
    timed_out: boolean;
    totalNumber: number; // Elastic number of results
}

export abstract class Elt {
    _id: ObjectId;
    archived: boolean = false;
    attachments: Attachment[];
    changeNote: string;
    classification: Classification[] = []; // mutable
    comments: Comment[] = []; // mutable
    created: Date;
    createdBy: UserReference;
    highlight: any; // volatile, Elastic
    history: ObjectId[];
    ids: CdeId[];
    imported: Date;
    isDraft: boolean; // optional, draft only
    lastMigrationScript: string;
    naming: Naming[] = [];
    designations: Designation[] = [];
    definitions: Definition[] = [];
    origin: string;
    primaryDefinitionCopy: string; // volatile, Elastic
    primaryNameCopy: string; // volatile, Elastic
    primaryNameSuggest: string; // volatile, Elastic
    properties: Property[] = []; // mutable
    referenceDocuments: ReferenceDocument[] = []; // mutable
    registrationState: RegistrationState = new RegistrationState();
    stewardOrg: {
        name: string,
    } = {name: undefined};
    score: number; // volatile, Elastic _score
    source: string; // obsolete
    sources: DataSource[];
    tinyId: string = undefined; // server generated
    updated: Date;
    updatedBy: UserReference;
    usedBy: string[]; // volatile, Classification stewardOrg names
    version: string; // ??? elastic(version) or mongo(__v)

    constructor(elt: Elt = undefined) {
        if (!elt) return;

        // immutable
        this._id = elt._id;
        this.archived = elt.archived;
        this.attachments = elt.attachments.concat();
        this.changeNote = elt.changeNote;
        this.created = elt.created;
        this.createdBy = elt.createdBy;
        this.highlight = elt.highlight;
        this.history = elt.history.concat();
        this.ids = elt.ids.concat();
        this.imported = elt.imported;
        this.isDraft = elt.isDraft;
        this.lastMigrationScript = elt.lastMigrationScript;
        this.origin = elt.origin;
        this.primaryDefinitionCopy = elt.primaryDefinitionCopy;
        this.primaryNameCopy = elt.primaryNameCopy;
        this.primaryNameSuggest = elt.primaryNameSuggest;
        this.registrationState = elt.registrationState;
        this.score = elt.score;
        this.source = elt.source;
        this.sources = elt.sources.concat();
        this.tinyId = elt.tinyId;
        this.updated = elt.updated;
        this.updatedBy = elt.updatedBy;
        this.version = elt.version;

        // mutable
        copyArray(elt.classification, this.classification, Classification);
        copyArray(elt.comments, this.comments, Comment);
        copyArray(elt.naming, this.naming, Naming);
        copyArray(elt.designations, this.designations, Designation);
        copyArray(elt.definitions, this.definitions, Definition);
        copyArray(elt.properties, this.properties, Property);
        copyArray(elt.referenceDocuments, this.referenceDocuments, ReferenceDocument);
        this.stewardOrg = {name: elt.stewardOrg ? elt.stewardOrg.name : ''};
    }

    static isDefault(a) {
        return a.isDefault === true;
    }

    abstract getEltUrl();

    getLabel() {
        if (this.primaryNameCopy) {
            return this.primaryNameCopy;
        } else {
            return this.naming[0].designation;
        }
    }

    static trackByElt(index: number, elt: any): number {
        return elt.tinyId;
    }
}

export class FormattedValue {
    value: string = "";
    valueFormat: string = "";
}

export type Instruction = FormattedValue;

export class Designation {
    designation: string;
    tags: string[];

    constructor(designation = '') {
        this.designation = designation;
    }

    static copy(designation: Designation) {
        let newDesignation = Object.assign(new Designation(), designation);
        newDesignation.tags = newDesignation.tags.concat();
        return newDesignation;
    }
}

export class Definition {
    definition: string;
    definitionFormat: string;
    tags: string[];

    constructor(definition = '') {
        this.definition = definition;
    }

    static copy(definition: Definition) {
        let newDefinition = Object.assign(new Definition(), definition);
        newDefinition.tags = newDefinition.tags.concat();
        return newDefinition;
    }
}

export class Naming {
    context?: {
        acceptability: string,
        contextName: string,
    };
    definition?: string;
    definitionFormat?: string;
    designation: string;
    languageCode?: string;
    source?: string;
    tags: string[] = [];

    constructor(designation = '') {
        this.designation = designation;
    }

    static copy(naming: Naming) {
        let newNaming = Object.assign(new Naming(), naming);
        newNaming.context = naming.context ? JSON.parse(JSON.stringify(naming.context)) : undefined;
        newNaming.tags = naming.tags.concat();
        return newNaming;
    }
}

export class Organization {
    cdeStatusValidationRules: StatusValidationRules[];
    classifications: ClassficationElements[];
    emailAddress: string;
    extraInfo: string;
    htmlOverview: string;
    longName: string;
    mailAddress: string;
    name: string;
    nameContexts: any[];
    nameTags: any[];
    phoneNumber: string;
    propertyKeys: any[];
    uri: string;
    workingGroupOf: string;

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
    codeSystemName: string;
    codeSystemVersion: string;
    permissibleValue: string;
    valueMeaningCode: string;
    valueMeaningDefinition: string;
    valueMeaningName: string;

    static copy(pv: PermissibleValue) {
        return Object.assign(new PermissibleValue(), pv);
    }
}

enum RuleType {
    'score', 'panel'
}

enum Formula {
    'sumAll', 'mean'
}

export class DerivationRule {
    name: string;
    inputs: string[];
    outputs: string[];
    ruleType: string;
    formula: string;

    static copy(rule: DerivationRule) {
        return Object.assign(new DerivationRule(), rule);
    }
}

export class Property {
    _id: ObjectId;
    key: string;
    source: string;
    value: string;
    valueFormat: string;

    static copy(property: Property) {
        return Object.assign(new Property(), property);
    }
}

export class ReferenceDocument {
    _id: ObjectId;
    document: string;
    docType: string;
    languageCode: string;
    providerOrg: string;
    referenceDocumentId: string;
    source: string;
    text: string;
    title: string;
    uri: string;

    static copy(ref: ReferenceDocument) {
        return Object.assign(new ReferenceDocument(), ref);
    }
}

export class RegistrationState {
    administrativeNote: string;
    administrativeStatus: string;
    effectiveDate: Date;
    registrationStatus: string = 'Incomplete';
    replacedBy: {
        tinyId: string,
    } = {tinyId: undefined};
    unresolvedIssue: string;
    untilDate: Date;
}

class StatusValidationRules {
    field: string;
    id: number;
    rule: {
        regex: string
    } = {regex: undefined};
    ruleName: string;
    occurence: string; // enum: ["exactlyOne", "atLeastOne", "all"]
    targetStatus: string; // enum: ["Incomplete", "Recorded", "Candidate", "Qualified", "Standard", "Preferred Standard"]
}

export class User {
    _id: ObjectId;
    accessToken: string;
    avatarUrl: string;
    email: string;
    formViewHistory: string[];
    hasMail: boolean;
    lastLogin: Date;
    lastViewNotification: Date;
    lockCounter: number;
    knownIPs: string[];
    orgAdmin: string[];
    orgCurator: string[];
    password: string;
    publishedForms: {
        id: ObjectId,
        name: string,
    }[];
    quota: number;
    refreshToken: string;
    roles: string[];
    searchSettings: {
        defaultSearchView: string,
        lowestRegistrationStatus: string,
        tableViewFields: {
            administrativeStatus: boolean,
            ids: boolean,
            name: boolean,
            naming: boolean,
            nbOfPVs: boolean,
            numQuestions: boolean,
            permissibleValues: boolean,
            questionTexts: boolean,
            registrationStatus: boolean,
            source: boolean,
            stewardOrg: boolean,
            tinyId: boolean,
            uom: boolean,
            updated: boolean,
            usedBy: boolean,
        },
        version: number,
    };
    siteAdmin: boolean;
    tester: boolean;
    username: string;
    viewHistory: string[];
}

export class UserReference {
    userId: ObjectId;
    username: string;
}

export function copyArray(from: any[], to: any[], classType) {
    if (Array.isArray(from) && Array.isArray(to)) {
        from.forEach(fromElem => {
            let toElem = classType.copy(fromElem);
            if (toElem) {
                to.push(toElem);
            }
        });
    }
}
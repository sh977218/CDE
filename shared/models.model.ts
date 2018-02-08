import { CdeForm, DisplayProfile } from 'shared/form/form.model';
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
    _id: ObjectId;
    id: string;
    source: string;
    version: string;
}

export class Classification {
    elements: {
        elements: any[],
        name: string,
    }[] = [];
    stewardOrg: {
        name: string
    };
    workingGroup: boolean;

    static copy(c: Classification) {
        return Object.assign(new Classification(), c ? JSON.parse(JSON.stringify(c)) : undefined);
    }
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

    static copy(u: CodeAndSystem|any) {
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
    history: ObjectId[];
    ids: CdeId[];
    imported: Date;
    isDraft: boolean; // optional, draft only
    lastMigrationScript: string;
    naming: Naming[] = [];
    origin: string;
    primaryDefinitionCopy: string; // volatile, Elastic
    primaryNameCopy: string; // volatile, Elastic
    primaryNameSuggest: string; // volatile, Elastic
    properties: Property[] = []; // mutable
    referenceDocuments: ReferenceDocument[] = []; // mutable
    registrationState: RegistrationState;
    stewardOrg: {
        name: string,
    } = {name};
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
        this.attachments = elt.attachments.concat();
        this.changeNote = elt.changeNote;
        this.created = elt.created;
        this.createdBy = elt.createdBy;
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

export class Naming {
    context: {
        acceptability: string,
        contextName: string,
    };
    definition: string;
    definitionFormat: string;
    designation: string;
    languageCode: string;
    source: string;
    tags: string[];

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

export type ObjectId = string;

export class PermissibleValue {
    codeSystemName: string;
    codeSystemVersion: string;
    permissibleValue: string;
    valueMeaningCode: string;
    valueMeaningDefinition: string;
    valueMeaningName: string;
}

enum RuleType {
    'score', 'panel'
}

enum Formula {
    'sumAll', 'mean'
}

export class DerivationRule {
    name: String;
    inputs: Array<String>;
    outputs: Array<String>;
    ruleType: String;
    formula: String;
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
    };
    unresolvedIssue: string;
    untilDate: Date;
}

export class User {
    _id: ObjectId;
    accessToken: string;
    avatarUrl: string;
    email: string;
    formViewHistory: string[];
    lastLogin: Date;
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
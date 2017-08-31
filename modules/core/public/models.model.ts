import { CdeForm } from 'form/public/form.model';
import { DataElement } from 'cde/public/dataElement.model';

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
        elements: Array<any>,
        name: string,
    }[];
    stewardOrg: {
        name: string
    };
    workingGroup: boolean;
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
}

export interface ElasticQueryResponse {
    aggregations: any; // Elastic aggregated grouping
    cdes: DataElement[]; // optional
    forms: CdeForm[]; // optional
    maxScore: number; // Elastic highest score on query
    took: number; // Elastic time to process query in milliseconds
    totalNumber: number; // Elastic number of results
}

export abstract class Elt {
    _id: ObjectId;
    stewardOrg: {
        name: string
    };
    unsaved: boolean = false;
    primaryDefinitionCopy: string; // calculated, Elastic
    score: number; // calculated, Elastic _score
    tinyId: string;
    usedBy: string[]; // calculated, Classification stewardOrg names
    naming: Naming[];
    referenceDocuments: ReferenceDocument[];
    attachments: Attachment[];
    properties: Property[];

    abstract getEltUrl();

    abstract getLabel();

    static isDefault(a) {
        return a.isDefault === true;
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
    tags: {
        tag: string,
    };
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
}

export class RegistrationState {
    administrativeNote: string;
    administrativeStatus: string;
    effectiveDate: Date;
    registrationStatus: string;
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

import * as mongoose from 'mongoose';
import { addStringtype } from '../../server/system/mongoose-stringtype';
import { orderedList } from '../../shared/system/regStatusShared';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

let csEltSchema = {
    elements: [],
    name: {type: StringType, index: true}
};

export const classificationSchema = new Schema({
    stewardOrg: {
        name: {type: StringType, index: true}
    },
    workingGroup: Boolean,
    elements: [csEltSchema]
}, {_id: false});

export const codeAndSystemSchema = new Schema({
    code: StringType,
    system: StringType,
}, {_id: false});

export const permissibleValueSchema = new Schema({
    permissibleValue: StringType,
    valueMeaningName: StringType,
    valueMeaningCode: StringType,
    valueMeaningDefinition: StringType,
    codeSystemName: StringType,
    codeSystemVersion: StringType
}, {_id: false});

export const derivationRuleSchema = new Schema({
    name: StringType,
    inputs: {type: [StringType], description: 'Information operated on by rule'},
    outputs: {type: [StringType], description: 'Information produced by rule'},
    ruleType: {type: StringType, enum: ['score', 'panel']},
    formula: {type: StringType, enum: ['sumAll', 'mean', 'bmi']},
}, {_id: false});

export const sourceSchema = new Schema({
    sourceName: StringType,
    imported: {type: Date, description: 'Date imported from source'},
    created: {type: Date, description: 'Date created in source'},
    updated: {type: Date, description: 'Date updated in source'},
    registrationStatus: {
        type: StringType,
        description: 'Relative standing of official record status in steward\'s workflow'
    },
    datatype: {type: StringType, description: 'May contain the source datatype'},
    copyright: {
        value: {type: StringType, description: 'Content of a copyright statement or terms of use'},
        valueFormat: {type: StringType, description: 'If "html", interpret as HTML'},
    }
}, {_id: false});

let commonEmbedSchema = {
    nameLabel: StringType,
    pageSize: Number,
    primaryDefinition: {
        show: {type: Boolean, default: false},
        label: StringType,
        style: StringType
    },
    registrationStatus: {
        show: {type: Boolean, default: false},
        label: StringType
    },
    lowestRegistrationStatus: {type: StringType, enum: orderedList},
    properties: [
        {
            label: StringType,
            key: StringType,
            limit: Number
        }
    ],
    otherNames: [{
        label: StringType,
        contextName: StringType
    }],
    classifications: [{
        label: StringType,
        startsWith: StringType,
        exclude: StringType,
        selectedOnly: Boolean
    }],
    ids: [
        {
            idLabel: StringType,
            source: StringType,
            version: Boolean,
            versionLabel: StringType
        }
    ]
};

let embedJson = {
    org: StringType,
    name: StringType,
    height: Number,
    width: Number,
    cde: {
        ...commonEmbedSchema,
        linkedForms: {
            show: {type: Boolean, default: false},
            label: StringType
        },
        permissibleValues: Boolean,
    },
    form: {
        ...commonEmbedSchema,
        cdes: {type: Boolean, default: false},
        nbOfQuestions: {type: Boolean, default: false},
        sdcLink: {type: Boolean, default: false}
    }
};

export const embedSchema = new Schema(embedJson);

export const fhirAppSchema = new Schema({
    clientId: String,
    dataEndpointUrl: String,
    forms: [
        {tinyId: String}
    ],
    mapping: [{
        cdeSystem: StringType,
        cdeCode: StringType,
        fhirSystem: StringType,
        fhirCode: StringType,
    }],
}, {collection: 'fhirapps'});

export const fhirObservationInformationSchema = new Schema({
    _id: String,
    categories: [{
        type: String,
        enum: ['social-history', 'vital-signs', 'imaging', 'laboratory', 'procedure', 'survey', 'exam', 'therapy']
    }],
}, {collection: 'fhirObservationInfo'});

export const idSourceSchema = new Schema({
    _id: String,
    linkTemplateDe: {type: StringType, default: ''},
    linkTemplateForm: {type: StringType, default: ''},
    version: StringType,
}, {collection: 'idSource'});

export const statusValidationRuleSchema = new Schema({
    field: StringType,
    id: Number,
    targetStatus: {
        type: StringType,
        enum: ['Incomplete', 'Recorded', 'Candidate', 'Qualified', 'Standard', 'Preferred Standard']
    },
    ruleName: StringType,
    rule: {
        regex: StringType
    },
    occurence: {type: StringType, enum: ['exactlyOne', 'atLeastOne', 'all']},
});

export const orgJson = {
    name: StringType,
    longName: StringType,
    mailAddress: StringType,
    emailAddress: StringType,
    phoneNumber: StringType,
    uri: StringType,
    classifications: [csEltSchema],
    workingGroupOf: StringType,
    propertyKeys: {
        type: Array,
        default: []
    },
    nameContexts: {
        type: Array,
        default: []
    },
    nameTags: {
        type: Array,
        default: []
    },
    extraInfo: StringType,
    cdeStatusValidationRules: [statusValidationRuleSchema],
    htmlOverview: StringType
};

export const orgSchema = new Schema(orgJson, {collection: 'orgs', usePushEach: true});

export const pushRegistration = new Schema({
    features: [StringType],
    loggedIn: Boolean,
    subscription: {
        endpoint: StringType,
        expirationTime: StringType,
        keys: {
            auth: StringType,
            p256dh: StringType
        }
    },
    userId: StringType,
    vapidKeys: {
        privateKey: StringType,
        publicKey: StringType
    }
}, {collection: 'pushRegistration'});

export const designationSchema = new Schema({
    designation: StringType,
    tags: [StringType],
    sources: {type: [StringType], default: undefined}
}, {_id: false});

export const definitionSchema = new Schema({
    definition: {type: String, required: true, minlength: 1},
    definitionFormat: StringType,
    tags: [StringType],
    sources: {type: [StringType], default: undefined}
}, {_id: false});

export const attachmentSchema = new Schema({
    fileid: {type: StringType, index: true},
    filename: StringType,
    filetype: StringType,
    uploadDate: Date,
    comment: StringType,
    uploadedBy: {
        userId: Schema.Types.ObjectId, username: {type: StringType, index: true}
    },
    filesize: Number,
    isDefault: Boolean,
    pendingApproval: {type: Boolean, index: true},
    scanned: Boolean
}, {_id: false});

export const registrationStateSchema = new Schema({
    registrationStatus: {type: StringType, enum: orderedList},
    effectiveDate: Date,
    untilDate: Date,
    administrativeNote: StringType,
    unresolvedIssue: StringType,
    administrativeStatus: {
        type: StringType,
        description: 'Relative standing of CDE as it relates to steward\'s administrative workflow'
    },
    replacedBy: {tinyId: {type: StringType, description: 'tinyId of replacement CDE'}},
}, {_id: false});

export const propertySchema = new Schema({
    key: StringType,
    value: StringType,
    source: StringType,
    valueFormat: StringType
}, {_id: false});

export const idSchema = new Schema({
    source: StringType,
    id: StringType,
    version: StringType
}, {_id: false});

let requestSchema = {
    source: {tinyId: StringType, id: StringType},
    destination: {tinyId: StringType},
    mergeFields: {
        ids: Boolean,
        designations: Boolean,
        definitions: Boolean,
        attachments: Boolean,
        properties: Boolean,
        classifications: Boolean
    }
};

export const eltLogSchema = {
    date: {type: Date, default: Date.now, index: true},
    user: {
        username: StringType
    },
    adminItem: {
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType
    },
    previousItem: {
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType
    },
    diff: Object
};

let elementRefSchema = {
    eltId: StringType,
    eltType: {type: StringType, enum: ['board', 'cde', 'form']},
    name: StringType,
};

let commentApprovalSchema = {
    comment: {
        commentId: StringType,
        replyIndex: Number,
        text: StringType
    },
    element: elementRefSchema,
};
let boardApprovalSchema = {
    element: elementRefSchema,
};

export const message = new Schema({
    recipient: {
        name: StringType,
        recipientType: {type: StringType, enum: ['user', 'stewardOrg', 'role']},
    },
    author: {authorType: StringType, name: StringType},
    date: Date,
    type: {type: StringType, enum: ['AttachmentApproval', 'CommentReply', 'BoardApproval']},
    typeRequest: requestSchema,
    typeCommentApproval: commentApprovalSchema,
    typeAttachmentApproval: attachmentSchema,
    typeCommentReply: commentApprovalSchema,
    typeBoardApproval: boardApprovalSchema,
    states: [{
        action: {type: StringType, enum: ['Approved', 'Filed']},
        comment: StringType,
        date: Date,
    }]
}, {collection: 'messages'});

export const jobQueue = new Schema({
    type: StringType,
    status: {type: StringType, enum: ['Running']},
    error: StringType
}, {usePushEach: true});

export const referenceDocumentSchema = new Schema({
    docType: StringType,
    document: StringType,
    referenceDocumentId: StringType,
    text: StringType,
    uri: StringType,
    providerOrg: StringType,
    title: StringType,
    languageCode: StringType,
    source: StringType
}, {_id: false});

export const dataSetSchema = new Schema({
    source: StringType,
    id: StringType,
    studyUri: StringType,
    notes: StringType
}, {_id: false});

export const classificationAudit = new Schema({
    date: {type: Date, default: Date.now, index: true}, user: {
        username: StringType
    },
    elements: [{
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType,
        status: {type: StringType, enum: orderedList},
        eltType: {type: StringType, enum: ['cde', 'form']},
    }],
    newname: StringType,
    action: {type: StringType, enum: ['add', 'delete', 'rename', 'reclassify']},
    path: [StringType]
}, {collection: 'classificationAudit'});

export const trafficFilterSchema = new Schema({
    ipList: [
        {
            ip: String,
            date: {type: Date, default: Date.now()},
            reason: String,
            strikes: {type: Number, default: 1}
        }
    ]
}, {usePushEach: true});
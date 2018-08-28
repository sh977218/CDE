const Schema = require('mongoose').Schema;

const regStatusShared = require('@std/esm')(module)("../../shared/system/regStatusShared");

function deleteEmpty(v) {
    if (v === null || v === '') {
        return;
    }
    return v;
}

const stringType = exports.stringType = {type: String, set: deleteEmpty};
const stringIndexType = exports.stringIndexType = Object.assign({index: true}, stringType);

let csEltSchema = new Schema({
    elements: [],
    name: stringIndexType
}, {_id: false});

exports.classificationSchema = new Schema({
    stewardOrg: {
        name: stringIndexType
    },
    workingGroup: Boolean,
    elements: [csEltSchema]
}, {_id: false});

exports.codeAndSystemSchema = new Schema({
    code: stringType,
    system: stringType,
}, {_id: false});

exports.permissibleValueSchema = new Schema({
    permissibleValue: stringType,
    valueMeaningName: stringType,
    valueMeaningCode: stringType,
    valueMeaningDefinition: stringType,
    codeSystemName: stringType,
    codeSystemVersion: stringType
}, {_id: false});


exports.derivationRuleSchema = new Schema({
    name: stringType,
    inputs: {type: [stringType], index: true}, // Information operated on by rule
    outputs: [stringType], // Information produced by rule
    ruleType: Object.assign({enum: ['score', 'panel']}, stringType),
    formula: Object.assign({enum: ['sumAll', 'mean', 'bmi']}, stringType)
}, {_id: true});


exports.sourceSchema = new Schema({
    sourceName: stringType,
    created: Date, // Date created in source
    updated: Date, // Date updated in source
    registrationStatus: stringType, // Relative standing of official record status in steward's workflow
    datatype: stringType, // May contain the source datatype
    copyright: {
        value: stringType, // Content of a copyright statement or terms of use
        valueFormat: stringType // If 'html', interpret as HTML
    }
}, {_id: false});

let commonEmbedSchema = {
    nameLabel: stringType,
    pageSize: Number,
    primaryDefinition: {
        show: {type: Boolean, default: false},
        label: stringType,
        style: stringType
    },
    registrationStatus: {
        show: {type: Boolean, default: false},
        label: stringType
    },
    lowestRegistrationStatus: Object.assign({enum: regStatusShared.orderedList}, stringType),
    properties: [
        {
            label: stringType,
            key: stringType,
            limit: Number
        }
    ],
    otherNames: [{
        label: stringType,
        contextName: stringType
    }],
    classifications: [{
        label: stringType,
        startsWith: stringType,
        exclude: stringType,
        selectedOnly: Boolean
    }],
    ids: [
        {
            idLabel: stringType,
            source: stringType,
            version: Boolean,
            versionLabel: stringType
        }
    ]
};

let embedJson = {
    org: stringType,
    name: stringType,
    height: Number,
    width: Number,
    cde: commonEmbedSchema,
    form: commonEmbedSchema
};
embedJson.cde.permissibleValues = Boolean;
embedJson.cde.linkedForms = {
    show: {type: Boolean, default: false},
    label: stringType
};
embedJson.form.sdcLink = {type: Boolean, default: false};
embedJson.form.nbOfQuestions = {type: Boolean, default: false};
embedJson.form.cdes = {type: Boolean, default: false};

exports.embedSchema = new Schema(embedJson);

exports.fhirAppSchema = new Schema({
    clientId: String,
    dataEndpointUrl: String,
    forms: [
        {tinyId: String, _id: false}
    ],
    mapping: [{
        type: new Schema({
            cdeSystem: stringType,
            cdeCode: stringType,
            fhirSystem: stringType,
            fhirCode: stringType,
        }, {_id: false}),
        default: []
    }],
}, {collection: 'fhirapps'});

exports.fhirObservationInformationSchema = new Schema({
    _id: String,
    categories: [{
        type: String,
        enum: ['social-history', 'vital-signs', 'imaging', 'laboratory', 'procedure', 'survey', 'exam', 'therapy']
    }],
    timestamp: Date
}, {collection: 'fhirObservationInfo'});

exports.statusValidationRuleSchema = new Schema({
    field: stringType,
    id: Number,
    targetStatus: Object.assign({
        enum: ["Incomplete", "Recorded", "Candidate", "Qualified", "Standard", "Preferred Standard"]
    }, stringType),
    ruleName: stringType,
    rule: {
        regex: stringType
    },
    occurence: Object.assign({enum: ["exactlyOne", "atLeastOne", "all"]}, stringType)
});

let orgJson = {
    name: stringType,
    longName: stringType,
    mailAddress: stringType,
    emailAddress: stringType,
    phoneNumber: stringType,
    uri: stringType,
    classifications: [csEltSchema],
    workingGroupOf: stringType,
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
    extraInfo: stringType,
    cdeStatusValidationRules: [exports.statusValidationRuleSchema],
    htmlOverview: stringType
};
exports.orgJson = orgJson;

exports.orgSchema = new Schema(orgJson, {usePushEach: true});

exports.pushRegistration = new Schema({
    features: [stringType],
    loggedIn: Boolean,
    subscription: {
        endpoint: stringType,
        expirationTime: stringType,
        keys: {
            auth: stringType,
            p256dh: stringType
        }
    },
    userId: stringType,
    vapidKeys: {
        privateKey: stringType,
        publicKey: stringType
    }
}, {collection: 'pushRegistration'});

exports.orgSchema.set('collection', 'orgs');

exports.designationSchema = new Schema({
    designation: stringType,
    tags: [stringType]
}, {_id: false});

exports.definitionSchema = new Schema({
    definition: stringType,
    definitionFormat: stringType,
    tags: [stringType]
}, {_id: false});

let attachmentSchema = {
    fileid: stringIndexType,
    filename: stringType,
    filetype: stringType,
    uploadDate: Date,
    comment: stringType,
    uploadedBy: {
        userId: Schema.Types.ObjectId, username: stringIndexType
    },
    filesize: Number,
    isDefault: Boolean,
    pendingApproval: Boolean,
    scanned: Boolean
};

exports.attachmentSchema = new Schema(attachmentSchema, {_id: false});

exports.registrationStateSchema = {
    registrationStatus: Object.assign({enum: regStatusShared.orderedList}, stringType),
    effectiveDate: Date,
    untilDate: Date,
    administrativeNote: stringType,
    unresolvedIssue: stringType,
    administrativeStatus: stringType, // Relative standing of CDE as it relates to steward's administrative workflow
    replacedBy: {tinyId: stringType} // tinyId of replacement CDE
};

exports.propertySchema = {key: stringType, value: stringType, source: stringType, valueFormat: stringType, _id: false};

exports.idSchema = {source: stringType, id: stringType, version: stringType, _id: false};

exports.helpItemSchema = new Schema({
    permalink: stringType,
    title: stringType,
    tags: [stringType]
});


let requestSchema = {
    source: {tinyId: stringType, id: stringType},
    destination: {tinyId: stringType},
    mergeFields: {
        ids: Boolean,
        designations: Boolean,
        definitions: Boolean,
        attachments: Boolean,
        properties: Boolean,
        classifications: Boolean
    }
};

let commentApprovalSchema = {
    element: {
        eltId: stringType,
        name: stringType,
        eltType: Object.assign({enum: ["cde", "form", "board"]}, stringType)
    },
    comment: {
        commentId: stringType,
        replyIndex: Number,
        text: stringType
    }
};
let boardApprovalSchema = {
    element: {
        eltId: stringType,
        name: stringType,
        eltType: Object.assign({enum: ["cde", "form", "board"]})
    }
};

exports.message = new Schema({
    recipient: {
        name: stringType,
        recipientType: Object.assign({enum: ["user", "stewardOrg", "role"]}, stringType),
    },
    author: {authorType: stringType, name: stringType},
    date: Date,
    type: Object.assign({
        enum: ["CommentApproval", "AttachmentApproval", "CommentReply", "BoardApproval"]
    }, stringType),
    typeRequest: requestSchema,
    typeCommentApproval: commentApprovalSchema,
    typeAttachmentApproval: attachmentSchema,
    typeCommentReply: commentApprovalSchema,
    typeBoardApproval: boardApprovalSchema,
    states: [{
        action: Object.assign({enum: ["Approved", "Filed"]}, stringType),
        date: Date, comment: stringType
    }]
});

exports.message.set('collection', 'messages');

exports.clusterStatus = Schema({
    hostname: stringType,
    port: Number,
    pmPort: Number,
    nodeStatus: Object.assign({enum: ["Running", "Stopped"]}, stringType),
    lastUpdate: Date,
    startupDate: Date,
    elastic: {
        up: Boolean,
        message: stringType,
        indices: [{
            name: stringType,
            up: Boolean,
            message: stringType
        }]
    }
});
exports.jobQueue = Schema({
    type: stringType,
    status: Object.assign({enum: ["Running"]}, stringType),
    error: stringType
}, {usePushEach: true});

exports.fs_files = new Schema({
    _id: Schema.Types.ObjectId,
    filename: stringType,
    contentType: stringType,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    aliases: stringType,
    metadata: {
        status: stringType
    },
    md5: stringType
});
exports.fs_files.set('collection', 'fs.files');

exports.referenceDocumentSchema = {
    docType: stringType,
    document: stringType,
    referenceDocumentId: stringType,
    text: stringType,
    uri: stringType,
    providerOrg: stringType,
    title: stringType,
    languageCode: stringType,
    source: stringType,
    _id: false
};
exports.dataSetSchema = {
    source: stringType,
    id: stringType,
    studyUri: stringType,
    notes: stringType
};
exports.classificationAudit = new Schema({
    date: {type: Date, default: Date.now, index: true}, user: {
        username: stringType
    },
    elements: [{
        tinyId: stringType,
        version: stringType,
        _id: Schema.Types.ObjectId,
        name: stringType,
        status: Object.assign({enum: regStatusShared.orderedList}, stringType),
        eltType: Object.assign({enum: ["cde", "form"]}, stringType)
    }],
    newname: stringType,
    action: Object.assign({enum: ["add", "delete", "rename", "reclassify"]}, stringType),
    path: [stringType]
});
exports.classificationAudit.set('collection', 'classificationAudit');

exports.trafficFilterSchema = new Schema({
    ipList: [{
        ip: String,
        date: {type: Date, default: Date.now()},
        reason: String,
        strikes: {type: Number, default: 1},
        _id: false
    }]
}, {usePushEach: true});

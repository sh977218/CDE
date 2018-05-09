const mongoose = require('mongoose');
const config = require('./parseConfig');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const regStatusShared = require('@std/esm')(module)("../../shared/system/regStatusShared");

let schemas = {};

function deleteEmpty(v) {
    if (v === null || v === '') {
        return;
    }
    return v;
}

const stringType = schemas.stringType = {type: String, set: deleteEmpty};
const stringIndexType = schemas.stringIndexType = Object.assign({index: true}, stringType);

let csEltSchema = new mongoose.Schema({
    elements: [],
    name: stringIndexType
}, {_id: false});

schemas.classificationSchema = new mongoose.Schema({
    stewardOrg: {
        name: stringIndexType
    },
    workingGroup: Boolean,
    elements: [csEltSchema]
}, {_id: false});

schemas.codeAndSystemSchema = new mongoose.Schema({
    code: stringType,
    system: stringType,
}, {_id: false});

schemas.permissibleValueSchema = new mongoose.Schema({
    permissibleValue: stringType,
    valueMeaningName: stringType,
    valueMeaningCode: stringType,
    valueMeaningDefinition: stringType,
    codeSystemName: stringType,
    codeSystemVersion: stringType
}, {_id: false});


schemas.derivationRuleSchema = new mongoose.Schema({
    name: stringType,
    inputs: {type: [stringType], index: true}, // Information operated on by rule
    outputs: [stringType], // Information produced by rule
    ruleType: Object.assign({enum: ['score', 'panel']}, stringType),
    formula: Object.assign({enum: ['sumAll', 'mean']}, stringType)
}, {_id: true});


schemas.sourceSchema = new mongoose.Schema({
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

schemas.embedSchema = new mongoose.Schema(embedJson);

let fhirAppJson = {
    forms: [
        {tinyId: String}
    ],
    clientId: String
};
schemas.fhirAppSchema = new mongoose.Schema(fhirAppJson);

schemas.statusValidationRuleSchema = new mongoose.Schema({
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
    cdeStatusValidationRules: [schemas.statusValidationRuleSchema],
    htmlOverview: stringType
};
schemas.orgJson = orgJson;

schemas.orgSchema = new mongoose.Schema(orgJson, {usePushEach: true});

schemas.pushRegistration = new mongoose.Schema({
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
});
schemas.pushRegistration.set('collection', 'pushRegistration');

schemas.userSchema = new mongoose.Schema({
    username: Object.assign({unique: true}, stringType),
    email: stringType,
    password: stringType,
    lastLogin: Date,
    lockCounter: Number,
    orgAdmin: [stringType],
    orgCurator: [stringType],
    siteAdmin: Boolean,
    tester: Boolean,
    quota: Number,
    viewHistory: [stringType],
    formViewHistory: [stringType],
    knownIPs: [stringType],
    roles: [Object.assign({enum: authorizationShared.rolesEnum}, stringType)],
    searchSettings: {
        version: Number,
        defaultSearchView: Object.assign({enum: ["accordion", "table", "summary"]}, stringType),
        lowestRegistrationStatus: stringType,
        tableViewFields: {
            name: {type: Boolean, default: true},
            naming: Boolean,
            questionTexts: Boolean,
            permissibleValues: Boolean,
            pvCodeNames: Boolean,
            nbOfPVs: Boolean,
            uom: Boolean,
            stewardOrg: Boolean,
            usedBy: Boolean,
            registrationStatus: Boolean,
            administrativeStatus: Boolean,
            ids: Boolean,
            identifiers: [stringType],
            source: Boolean,
            updated: Boolean,
            numQuestions: Boolean,
            tinyId: Boolean,
            linkedForms: Boolean
        }
    },
    accessToken: stringType,
    refreshToken: stringType,
    avatarUrl: stringType,
    publishedForms: [{
        name: stringType,
        id: mongoose.Schema.Types.ObjectId
    }]
}, {usePushEach: true});

schemas.orgSchema.set('collection', 'orgs');
schemas.userSchema.set('collection', 'users');

schemas.namingSchema = new mongoose.Schema({
    designation: stringType,
    definition: stringType,
    definitionFormat: stringType,
    languageCode: stringType,
    tags: [stringType],
    source: stringType
}, {_id: false});

schemas.designationSchema = new mongoose.Schema({
    designation: String,
    tags: [String]
}, {_id: false});

schemas.definitionSchema = new mongoose.Schema({
    definition: String,
    definitionFormat: String,
    tags: [String]
}, {_id: false});

let attachmentSchema = {
    fileid: stringIndexType,
    filename: stringType,
    filetype: stringType,
    uploadDate: Date,
    comment: stringType,
    uploadedBy: {
        userId: mongoose.Schema.Types.ObjectId, username: stringIndexType
    },
    filesize: Number,
    isDefault: Boolean,
    pendingApproval: Boolean,
    scanned: Boolean
};

schemas.attachmentSchema = new mongoose.Schema(attachmentSchema, {_id: false});

schemas.registrationStateSchema = {
    registrationStatus: Object.assign({enum: regStatusShared.orderedList}, stringType),
    effectiveDate: Date,
    untilDate: Date,
    administrativeNote: stringType,
    unresolvedIssue: stringType,
    administrativeStatus: stringType, // Relative standing of CDE as it relates to steward's administrative workflow
    replacedBy: {tinyId: stringType} // tinyId of replacement CDE
};

schemas.propertySchema = {key: stringType, value: stringType, source: stringType, valueFormat: stringType, _id: false};

schemas.idSchema = {source: stringType, id: stringType, version: stringType, _id: false};

schemas.commentSchema = new mongoose.Schema({
    text: stringType,
    user: stringType,
    username: stringType,
    created: Date,
    pendingApproval: Boolean,
    linkedTab: stringType,
    status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType),
    replies: [{
        text: stringType,
        user: stringType,
        username: stringType,
        created: Date,
        pendingApproval: Boolean,
        status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType)
    }],
    element: {
        eltType: Object.assign({enum: ["cde", "form", "board"]}, stringType),
        eltId: stringType
    }
}, {usePushEach: true,});

schemas.helpItemSchema = new mongoose.Schema({
    permalink: stringType,
    title: stringType,
    tags: [stringType]
});


let requestSchema = {
    source: {tinyId: stringType, id: stringType},
    destination: {tinyId: stringType},
    mergeFields: {
        ids: Boolean,
        naming: Boolean,
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

schemas.message = new mongoose.Schema({
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

schemas.message.set('collection', 'messages');

schemas.clusterStatus = mongoose.Schema({
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
schemas.jobQueue = mongoose.Schema({
    type: stringType,
    status: Object.assign({enum: ["Running"]}, stringType),
    error: stringType
}, {usePushEach: true});

schemas.fs_files = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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

schemas.referenceDocumentSchema = {
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
schemas.dataSetSchema = {
    source: stringType,
    id: stringType,
    studyUri: stringType,
    notes: stringType
};
schemas.classificationAudit = new mongoose.Schema({
    date: {type: Date, default: Date.now, index: true}, user: {
        username: stringType
    },
    elements: [{
        tinyId: stringType,
        version: stringType,
        _id: mongoose.Schema.Types.ObjectId,
        name: stringType,
        status: Object.assign({enum: regStatusShared.orderedList}, stringType),
        eltType: Object.assign({enum: ["cde", "form"]}, stringType)
    }],
    newname: stringType,
    action: Object.assign({enum: ["add", "delete", "rename", "reclassify"]}, stringType),
    path: [stringType]
});


schemas.meshClassification = new mongoose.Schema({
    flatClassification: stringType,
    eltId: stringType,
    meshDescriptors: [stringType],
    flatTrees: [stringType]
});

schemas.consoleLogSchema = new mongoose.Schema({ // everything server except express
    date: {type: Date, index: true, default: Date.now()},
    message: stringType,
    level: Object.assign({enum: ['debug', 'info', 'warning', 'error'], default: 'info'}, stringType)
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logSchema = new mongoose.Schema({ // express
    level: stringType,
    remoteAddr: stringIndexType,
    url: stringType,
    method: stringType,
    httpStatus: stringType,
    date: {type: Date, index: true},
    referrer: stringType,
    responseTime: {type: Number, index: true}
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logErrorSchema = new mongoose.Schema({ // everything server and express
    message: stringType,
    date: {type: Date, index: true},
    details: stringType,
    origin: stringType,
    stack: stringType,
    request: {
        url: stringType,
        method: stringType,
        params: stringType,
        body: stringType,
        username: stringType,
        userAgent: stringType,
        ip: stringType
    }
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.clientErrorSchema = new mongoose.Schema({
    message: stringType,
    date: {type: Date, index: true},
    origin: stringType,
    name: stringType,
    stack: stringType,
    userAgent: stringType,
    url: stringType,
    username: stringType,
    ip: stringType
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.storedQuerySchema = new mongoose.Schema({
    searchTerm: Object.assign({lowercase: true, trim: true}, stringType),
    date: {type: Date, default: Date.now},
    searchToken: stringType,
    username: stringType,
    remoteAddr: stringType,
    isSiteAdmin: Boolean,
    regStatuses: [stringType],
    selectedOrg1: stringType,
    selectedOrg2: stringType,
    selectedElements1: [stringType],
    selectedElements2: [stringType]
}, {safe: {w: 0}});

schemas.feedbackIssueSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now, index: true},
    user: {
        username: stringType,
        ip: stringType
    },
    screenshot: {
        id: stringType,
        content: stringType
    },
    rawHtml: stringType,
    userMessage: stringType,
    browser: stringType,
    reportedUrl: stringType
});

schemas.trafficFilterSchema = new mongoose.Schema({
    ipList: [{
        ip: String,
        date: {type: Date, default: Date.now()},
        reason: String,
        strikes: {type: Number, default: 1},
        _id: false
    }]
});

schemas.classificationAudit.set('collection', 'classificationAudit');

schemas.fs_files.set('collection', 'fs.files');

module.exports = schemas;

const mongoose = require('mongoose');
require('./mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const regStatusShared = require('@std/esm')(module)("../../shared/system/regStatusShared");

let csEltSchema = new Schema({
    elements: [],
    name: {type: StringType, index: true}
}, {_id: false});

exports.classificationSchema = new Schema({
    stewardOrg: {
        name: {type: StringType, index: true}
    },
    workingGroup: Boolean,
    elements: [csEltSchema]
}, {_id: false});

exports.codeAndSystemSchema = new Schema({
    code: StringType,
    system: StringType,
}, {_id: false});

exports.permissibleValueSchema = new Schema({
    permissibleValue: StringType,
    valueMeaningName: StringType,
    valueMeaningCode: StringType,
    valueMeaningDefinition: StringType,
    codeSystemName: StringType,
    codeSystemVersion: StringType
}, {_id: false});


exports.derivationRuleSchema = new Schema({
    name: StringType,
    inputs: {type: [StringType], index: true, description: 'Information operated on by rule'},
    outputs: {type: [StringType], description: 'Information produced by rule'},
    ruleType: {type: StringType, enum: ['score', 'panel']},
    formula: {type: StringType, enum: ['sumAll', 'mean', 'bmi']},
}, {_id: true});


exports.sourceSchema = new Schema({
    sourceName: StringType,
    created: {type: Date, description: 'Date created in source'},
    updated: {type: Date, description: 'Date updated in source'},
    registrationStatus: {type: StringType, description: "Relative standing of official record status in steward's workflow"},
    datatype: {type: StringType, description: 'May contain the source datatype'},
    copyright: {
        value: {type: StringType, description: 'Content of a copyright statement or terms of use'},
        valueFormat: {type: StringType, description: "If 'html', interpret as HTML"},
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
    lowestRegistrationStatus: {type: StringType, enum: regStatusShared.orderedList},
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
    cde: commonEmbedSchema,
    form: commonEmbedSchema
};
embedJson.cde.permissibleValues = Boolean;
embedJson.cde.linkedForms = {
    show: {type: Boolean, default: false},
    label: StringType
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
            cdeSystem: StringType,
            cdeCode: StringType,
            fhirSystem: StringType,
            fhirCode: StringType,
        }, {_id: false}),
        default: []
    }],
    timestamp: Date,
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
    field: StringType,
    id: Number,
    targetStatus: {type: StringType, enum: ["Incomplete", "Recorded", "Candidate", "Qualified", "Standard", "Preferred Standard"]},
    ruleName: StringType,
    rule: {
        regex: StringType
    },
    occurence: {type: StringType, enum: ["exactlyOne", "atLeastOne", "all"]},
});

let orgJson = {
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
    cdeStatusValidationRules: [exports.statusValidationRuleSchema],
    htmlOverview: StringType
};
exports.orgJson = orgJson;

exports.orgSchema = new Schema(orgJson, {usePushEach: true});

exports.pushRegistration = new Schema({
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

exports.orgSchema.set('collection', 'orgs');

exports.designationSchema = new Schema({
    designation: StringType,
    tags: [StringType]
}, {_id: false});

exports.definitionSchema = new Schema({
    definition: StringType,
    definitionFormat: StringType,
    tags: [StringType]
}, {_id: false});

let attachmentSchema = {
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
    pendingApproval: Boolean,
    scanned: Boolean
};

exports.attachmentSchema = new Schema(attachmentSchema, {_id: false});

exports.registrationStateSchema = {
    registrationStatus: {type: StringType, enum: regStatusShared.orderedList},
    effectiveDate: Date,
    untilDate: Date,
    administrativeNote: StringType,
    unresolvedIssue: StringType,
    administrativeStatus: {type: StringType, description: 'Relative standing of CDE as it relates to steward\'s administrative workflow'},
    replacedBy: {tinyId: {type: StringType, description: 'tinyId of replacement CDE'}},
};

exports.propertySchema = {key: StringType, value: StringType, source: StringType, valueFormat: StringType, _id: false};

exports.idSchema = {source: StringType, id: StringType, version: StringType, _id: false};

exports.helpItemSchema = new Schema({
    permalink: StringType,
    title: StringType,
    tags: [StringType]
});


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

exports.message = new Schema({
    recipient: {
        name: StringType,
        recipientType: {type: StringType, enum: ["user", "stewardOrg", "role"]},
    },
    author: {authorType: StringType, name: StringType},
    date: Date,
    type: {type: StringType, enum: ["AttachmentApproval", "CommentReply", "BoardApproval"]},
    typeRequest: requestSchema,
    typeCommentApproval: commentApprovalSchema,
    typeAttachmentApproval: attachmentSchema,
    typeCommentReply: commentApprovalSchema,
    typeBoardApproval: boardApprovalSchema,
    states: [{
        action: {type: StringType, enum: ["Approved", "Filed"]},
        comment: StringType,
        date: Date,
    }]
});

exports.message.set('collection', 'messages');

// let taskActor = {
//     org: StringType,
//     type: {type: StringType, enum: ['role']},
//     typeId: StringType
// };
//
// exports.task = new Schema({
//     from: [taskActor],
//     to: taskActor,
//     type: {type: StringType, enum: ['approve']},
//     typeInfo: commentApprovalSchema,
// });

exports.jobQueue = Schema({
    type: StringType,
    status: {type: StringType, enum: ["Running"]},
    error: StringType
}, {usePushEach: true});

exports.fs_files = new Schema({
    _id: Schema.Types.ObjectId,
    filename: StringType,
    contentType: StringType,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    aliases: StringType,
    metadata: {
        status: StringType
    },
    md5: StringType
});
exports.fs_files.set('collection', 'fs.files');

exports.referenceDocumentSchema = {
    docType: StringType,
    document: StringType,
    referenceDocumentId: StringType,
    text: StringType,
    uri: StringType,
    providerOrg: StringType,
    title: StringType,
    languageCode: StringType,
    source: StringType,
    _id: false
};
exports.dataSetSchema = {
    source: StringType,
    id: StringType,
    studyUri: StringType,
    notes: StringType
};
exports.classificationAudit = new Schema({
    date: {type: Date, default: Date.now, index: true}, user: {
        username: StringType
    },
    elements: [{
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType,
        status: {type: StringType, enum: regStatusShared.orderedList},
        eltType: {type: StringType, enum: ["cde", "form"]},
    }],
    newname: StringType,
    action: {type: StringType, enum: ["add", "delete", "rename", "reclassify"]},
    path: [StringType]
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

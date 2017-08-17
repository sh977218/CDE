var mongoose = require('mongoose')
    , config = require('../../system/node-js/parseConfig')
    , authorizationShared = require('../shared/authorizationShared')
    , regStatusShared = require("../shared/regStatusShared") // jshint ignore:line
    ;

var schemas = {};

var csEltSchema = new mongoose.Schema({
    elements: []
    , name: {type: String, index: true}
}, {_id: false});

schemas.classificationSchema = new mongoose.Schema({
    stewardOrg: {
        name: {type: String, index: true}
    }
    , workingGroup: Boolean
    , elements: [csEltSchema]
}, {_id: false});

schemas.permissibleValueSchema = new mongoose.Schema({
    permissibleValue: String
    , valueMeaningName: String
    , valueMeaningCode: String
    , valueMeaningDefinition: String
    , codeSystemName: String
    , codeSystemVersion: String
}, {_id: false});


schemas.derivationRuleSchema = new mongoose.Schema(
    {
        name: String,
        inputs: {type: [String], index: true, description: "Information operated on by rule"},
        outputs: {description: "Information produced by rule", type: [String]},
        ruleType: {type: String, enum: ['score', 'panel']},
        formula: {type: String, enum: ['sumAll', 'mean']}
    }, {_id: true}
);


schemas.sourceSchema = new mongoose.Schema({
    sourceName: String,
    created: {type: Date, description: "Date created in source"},
    updated: {type: Date, description: "Date updated in source"},
    registrationStatus: {type: String, description: "Relative standing of official record status in steward's workflow"},
    datatype: {type: String, description: "May contain the source datatype"},
    copyright: {
        value: {type: String, description: "Content of a copyright statement or terms of use"},
        valueFormat: {type: String, description: "If 'html', interpret as HTML"}
    }
}, {_id: false});

var commonEmbedSchema = {
    nameLabel: String,
    pageSize: Number,
    primaryDefinition: {
        show: Boolean,
        label: String,
        style: String
    },
    registrationStatus: {
        show: Boolean,
        label: String
    },
    lowestRegistrationStatus: {type: String, enum:regStatusShared.orderedList},
    properties: [
        {
            label: String,
            key: String,
            limit: Number
        }
    ],
    otherNames: [{
        label: String,
        contextName: String
    }],
    classifications: [{
        label: String,
        startsWith: String,
        exclude: String,
        selectedOnly: Boolean
    }],
    ids: [
        {
            idLabel: String,
            source: String,
            version: Boolean,
            versionLabel: String
        }
    ]
};

var embedJson = {
    org: String,
    name: String,
    height: Number,
    width: Number,
    cde: commonEmbedSchema,
    form: commonEmbedSchema
};
embedJson.cde.permissibleValues = Boolean;
embedJson.cde.linkedForms = {
    show: Boolean,
    label: String
};
embedJson.form.sdcLink = Boolean;
embedJson.form.nbOfQuestions = Boolean;
embedJson.form.cdes = Boolean;

schemas.embedSchema = new mongoose.Schema(embedJson);

schemas.statusValidationRuleSchema = new mongoose.Schema({
    field: String
    , id: Number
    , targetStatus: {type: String, enum: ["Incomplete", "Recorded", "Candidate", "Qualified", "Standard", "Preferred Standard"]}
    , ruleName: String
    , rule: {
        regex:  String
    }
    , occurence: {type: String, enum: ["exactlyOne", "atLeastOne", "all"]}
});

var orgJson = {
    name: String
    , longName: String
    , mailAddress: String
    , emailAddress: String
    , phoneNumber: String
    , uri: String
    , classifications: [csEltSchema]
    , workingGroupOf: String
    , propertyKeys: {
        type: Array,
        default: []
    }
    , nameContexts: {
        type: Array,
        default: []
    }
    , nameTags: {
        type: Array,
        default: []
    }
    , extraInfo: String
    , cdeStatusValidationRules: [schemas.statusValidationRuleSchema]
    , htmlOverview: String
};
schemas.orgJson = orgJson;

schemas.orgSchema = new mongoose.Schema(orgJson);

schemas.userSchema = new mongoose.Schema({
    username: {type: String, unique: true}
    , email: String
    , password: String
    , lastLogin: Date
    , lockCounter: Number
    , orgAdmin: [String]
    , orgCurator: [String]
    , siteAdmin: Boolean
    , tester: Boolean
    , quota: Number
    , viewHistory: [String]
    , formViewHistory: [String]
    , knownIPs: [String]
    , roles: [{type: String, enum: authorizationShared.rolesEnum}]
    , searchSettings: {
        version: Number
        , defaultSearchView: {type: String, enum: ["accordion", "table", "summary"]}
        , lowestRegistrationStatus: String
        , tableViewFields: {
            name: Boolean
            , naming: Boolean
            , questionTexts: Boolean
            , permissibleValues: Boolean
            , nbOfPVs: Boolean
            , uom: Boolean
            , stewardOrg: Boolean
            , usedBy: Boolean
            , registrationStatus: Boolean
            , administrativeStatus: Boolean
            , ids: Boolean
            , source: Boolean
            , updated: Boolean
            , numQuestions: Boolean
            , tinyId: Boolean
        }
    }
    , accessToken: String
    , refreshToken: String
    , avatarUrl: String
    , publishedForms: [{
        name: String,
        id: mongoose.Schema.Types.ObjectId
    }]
});

schemas.orgSchema.set('collection', 'orgs');
schemas.userSchema.set('collection', 'users');

schemas.namingSchema = new mongoose.Schema({
    designation: {type: String},
    definition: {type: String},
    definitionFormat: String,
    languageCode: String,
    tags: [new mongoose.Schema({
        tag: String
    }, {_id: false})],
    newTags: [String],
    source: {type: String}
}, {_id: false});

var attachmentSchema = {
    fileid: {type: String, index: true}
    , filename: String
    , filetype: String
    , uploadDate: Date
    , comment: String
    , uploadedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: {type: String, index: true}
    }
    , filesize: Number
    , isDefault: Boolean
    , pendingApproval: Boolean
    , scanned: Boolean
};

schemas.attachmentSchema = new mongoose.Schema(attachmentSchema, {_id: false});

schemas.registrationStateSchema = {
    registrationStatus: {type: String, enum: regStatusShared.orderedList}
    , effectiveDate: Date
    , untilDate: Date
    , administrativeNote: String
    , unresolvedIssue: String
    , administrativeStatus: {type: String, description: "Relative standing of CDE as it relates to steward's administrative workflow"}
    , replacedBy: {tinyId: {type: String, description: "tinyId of replacement CDE"}}
};

schemas.instructionSchema = {value: String, valueFormat: String};

schemas.propertySchema = {key: String, value: String, source: String, valueFormat: String, _id: false};

schemas.idSchema = {source: String, id: String, version: String, _id: false};

schemas.commentSchema = new mongoose.Schema({
    text: String
    , user: String
    , username: String
    , created: Date
    , pendingApproval: Boolean
    , linkedTab: String
    , status: {type: String, enum: ["active", "resolved", "deleted"], default: "active"}
    , replies: [
        {
            text: String
            , user: String
            , username: String
            , created: Date
            , pendingApproval: Boolean
            , status: {type: String, enum: ["active", "resolved", "deleted"], default: "active"}
        }
    ],
    element: {
        eltType: {type: String, enum: ["cde", "form", "board"]},
        eltId: String
    }
});

schemas.helpItemSchema = new mongoose.Schema({
    permalink: String
    , title: String
    , tags: [String]
});


var requestSchema = {
    source: {tinyId: String, id: String}
    , destination: {tinyId: String}
    , mergeFields: {
        ids: Boolean
        , naming: Boolean
        , attachments: Boolean
        , properties: Boolean
        , classifications: Boolean
    }
};

var commentApprovalSchema = {
    element: {
        eltId: String
        , name: String
        , eltType: {type: String, enum: ["cde", "form", "board"]}
    }
    , comment: {
        commentId: String,
        replyIndex: Number,
        text: String
    }
};
var boardApprovalSchema = {
    element: {
        eltId: String,
        name: String,
        eltType: {type: String, enum: ["cde", "form", "board"]}
    }
};

schemas.message = new mongoose.Schema({
    recipient: {
        recipientType: {type: String, enum: ["user", "stewardOrg", "role"]}
        , name: String
    }
    , author: {authorType: String, name: String}
    , date: Date,
    type: {
        type: String,
        enum: ["MergeRequest", "CommentApproval", "AttachmentApproval", "CommentReply", "BoardApproval"]
    }
    , typeRequest: requestSchema
    , typeCommentApproval: commentApprovalSchema
    , typeAttachmentApproval: attachmentSchema
    , typeCommentReply: commentApprovalSchema
    , typeBoardApproval: boardApprovalSchema
    , states: [{
        action: {type: String, enum: ["Approved", "Filed"]}
        , date: Date
        , comment: String
    }]
});

schemas.message.set('collection', 'messages');

schemas.clusterStatus = mongoose.Schema({
    hostname: String
    , port: Number
    , pmPort: Number
    , nodeStatus: {type: String, enum: ["Running", "Stopped"]}
    , lastUpdate: Date
    , startupDate: Date
    , elastic: {
        up: Boolean,
        message: String,
        indices: [{
            name: String,
            up: Boolean,
            message: String
        }]
    }
});

schemas.fs_files = new mongoose.Schema({
    "_id": mongoose.Schema.Types.ObjectId
    , "filename": String
    , "contentType": String
    , "length": Number
    , "chunkSize": Number
    , "uploadDate": Date
    , "aliases": String
    , "metadata": {
        "status": String
    }
    , "md5": String
});

schemas.referenceDocumentSchema = {
    docType: String,
    document: String,
    referenceDocumentId: String,
    text: String,
    uri: String,
    providerOrg: String,
    title: String,
    languageCode: String,
    source: String,
    _id: false
};
schemas.dataSetSchema = {
    source: String,
    id: String,
    studyUri: String,
    notes: String
};
schemas.classificationAudit = new mongoose.Schema({
    date: {type: Date, default: Date.now, index: true}
    , user: {
        username: String
    }
    , elements: [{
        tinyId: String
        , version: String
        , _id: mongoose.Schema.Types.ObjectId
        , name: String
        , status: {type: String, enum: regStatusShared.orderedList}
        , eltType: {type: String, enum: ["cde", "form"]}
    }]
    , newname: String
    , action: {type: String, enum: ["add", "delete", "rename", "reclassify"]}
    , path: [String]
});


schemas.meshClassification = new mongoose.Schema({
    flatClassification: String,
    eltId: String,
    meshDescriptors: [String],
    flatTrees: [String]
});

schemas.consoleLogSchema = new mongoose.Schema({
    date: {type: Date, index: true, default: Date.now()},
    message: String,
    level: {type: String, enum: ['debug', 'info', 'warning', 'error'], default: 'info'}
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logSchema = new mongoose.Schema(
    {
        level: String
        , remoteAddr: {type: String, index: true}
        , url: String
        , method: String
        , httpStatus: String
        , date: {type: Date, index: true}
        , referrer: String
        , responseTime: {type: Number, index: true}
    }, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logErrorSchema = new mongoose.Schema(
    {
        message: String
        , date: {type: Date, index: true}
        , origin: String
        , stack: String
        , details: String
        , request: {
        url: String
        , method: String
        , params: String
        , body: String
        , username: String
        , userAgent: String
        , ip: String
    }
    }, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.clientErrorSchema = new mongoose.Schema(
    {
        message: String
        , date: {type: Date, index: true}
        , origin: String
        , name: String
        , stack: String
        , userAgent: String
        , url: String
        , username: String
        , ip: String
    }, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.storedQuerySchema = new mongoose.Schema(
    {
        searchTerm: {type: String, lowercase: true, trim: true}
        , date: {type: Date, default: Date.now}
        , searchToken: String
        , username: String
        , remoteAddr: String
        , isSiteAdmin: Boolean
        , regStatuses: [String]
        , selectedOrg1: String
        , selectedOrg2: String
        , selectedElements1: [String]
        , selectedElements2: [String]
    }, {safe: {w: 0}});

schemas.feedbackIssueSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now, index: true}
    , user: {
        username: String
        , ip: String
    }
    , screenshot: {
        id: String
        , content: String
    }
    , rawHtml: String
    , userMessage: String
    , browser: String
    , reportedUrl: String
});

schemas.classificationAudit.set('collection', 'classificationAudit');

schemas.fs_files.set('collection', 'fs.files');

module.exports = schemas;

var mongoose = require('mongoose')
    , authorizationShared = require('../shared/authorizationShared')
    , regStatusShared = require("../shared/regStatusShared") // jshint ignore:line
    ;

var schemas = {};

var csEltSchema = new mongoose.Schema({
    elements: []
    , name: String
}, {_id: false});

schemas.classificationSchema = new mongoose.Schema({
    stewardOrg: {name: String}
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
    lowestRegistrationStatus: {type: String, enum:regStatusShared.statusList},
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

schemas.orgSchema = new mongoose.Schema({
    name: String
    , longName: String
    , mailAddress: String
    , emailAddress: String
    , phoneNumber: String
    , uri: String
    , classifications: [csEltSchema]
    , workingGroupOf: String
    , propertyKeys: [String]
    , nameContexts: [String]
    , extraInfo: String
    , cdeStatusValidationRules: [schemas.statusValidationRuleSchema]
});


schemas.userSchema = new mongoose.Schema({
    username: String
    , email: String
    , password: String
    , lastLogin: Date
    , lockCounter: Number
    , orgAdmin: [String]
    , orgCurator: [String]
    , siteAdmin: Boolean
    , quota: Number
    , viewHistory: [String]
    , knownIPs: [String]
    , roles: [{type: String, enum: authorizationShared.rolesEnum}]
    , searchSettings: {
        version: Number
        , defaultSearchView: {type: String, enum: ["accordion", "table", "summary"]}
        , lowestRegistrationStatus: String
        , tableViewFields: {
            name: Boolean
            , naming: Boolean
            , permissibleValues: Boolean
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
});

schemas.orgSchema.set('collection', 'orgs');
schemas.userSchema.set('collection', 'users');

schemas.namingSchema = new mongoose.Schema({
    designation: {type: String}
    , definition: {type: String}
    , definitionFormat: String
    , languageCode: String
    , context: {
        contextName: String
        , acceptability: String
    }
}, {_id: false});

var attachmentSchema = {
    fileid: String
    , filename: String
    , filetype: String
    , uploadDate: Date
    , comment: String
    , uploadedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , filesize: Number
    , isDefault: Boolean
    , pendingApproval: Boolean
    , scanned: Boolean
};

schemas.attachmentSchema = new mongoose.Schema(attachmentSchema, {_id: false});

schemas.registrationStateSchema = {
    registrationStatus: {type: String, enum: regStatusShared.statusList}
    , effectiveDate: Date
    , untilDate: Date
    , administrativeNote: String
    , unresolvedIssue: String
    , administrativeStatus: String
    , replacedBy: {tinyId: String}
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
}, {_id: false});

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
        tinyId: String
        , name: String
        , eltType: {type: String, enum: ["cde", "form"]}
    }
    , comment: {index: Number, text: String}
};

schemas.message = new mongoose.Schema({
    recipient: {
        recipientType: {type: String, enum: ["user", "stewardOrg", "role"]}
        , name: String
    }
    , author: {authorType: String, name: String}
    , date: Date
    , type: {type: String, enum: ["MergeRequest", "CommentApproval", "AttachmentApproval"]}
    , typeRequest: requestSchema
    , typeCommentApproval: commentApprovalSchema
    , typeAttachmentApproval: attachmentSchema
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
        , status: {type: String, enum: regStatusShared.statusList}
        , eltType: {type: String, enum: ["cde", "form"]}
    }]
    , newname: String
    , action: {type: String, enum: ["add", "delete", "rename", "reclassify"]}
    , path: [String]
});

schemas.classificationAudit.set('collection', 'classificationAudit');

schemas.fs_files.set('collection', 'fs.files');

module.exports = schemas;

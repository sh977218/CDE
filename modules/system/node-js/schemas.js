var mongoose = require('mongoose')
    , authorizationShared = require('../shared/authorizationShared')
    , config = require("config")
    , regStatusShared = require("../shared/regStatusShared")
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

schemas.orgSchema = new mongoose.Schema ({
    name: String
    , longName: String
    , mailAddress: String
    , emailAddress: String
    , phoneNumber: String
    , uri: String
    , classifications: [csEltSchema]
    , workingGroupOf: String
});

schemas.userSchema = new mongoose.Schema ({
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
    , roles: [{ type: String, enum: authorizationShared.rolesEnum }]
});

schemas.orgSchema.set('collection', 'orgs');
schemas.userSchema.set('collection', 'users');

schemas.namingSchema = new mongoose.Schema({
    designation: String
    , definition: String
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

schemas.message = new mongoose.Schema ({
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
    , elastic: {
        up: Boolean
        , results: Boolean
        , sync: Boolean
        , updating: Boolean
    }
});

schemas.fs_files = new mongoose.Schema({
    "_id" : mongoose.Schema.Types.ObjectId
    , "filename" : String
    , "contentType" : String
    , "length" : Number
    , "chunkSize" : Number
    , "uploadDate" : Date
    , "aliases" : String
    , "metadata" : {
        "status" : String
    }
    , "md5" : String
});



schemas.classificationAudit = new mongoose.Schema({
    date: { type: Date, default: Date.now, index: true }
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
    , action: {type: String, enum: ["add","delete","rename", "reclassify"]}
    , path: [String]
});

schemas.classificationAudit.set('collection', 'classificationAudit');

schemas.fs_files.set('collection', 'fs.files');

module.exports = schemas;
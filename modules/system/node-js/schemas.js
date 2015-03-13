var mongoose = require('mongoose')
    , authorizationShared = require('../shared/authorizationShared');

var schemas = {};

var csEltSchema = mongoose.Schema({
    name: String
    , elements: [csEltSchema]
}, {_id: false});

exports.permissibleValueSchema = mongoose.Schema({
    permissibleValue: String
    , valueMeaningName: String
    , valueMeaningCode: String
    , valueMeaningDefinition: String
    , codeSystemName: String
    , codeSystemVersion: String
}, {_id: false});


exports.classificationSchema = mongoose.Schema({
    stewardOrg: {name: String}
    , workingGroup: Boolean
    , elements: [csEltSchema]
}, {_id: false});

schemas.orgSchema = mongoose.Schema ({
    name: String
    , longName: String
    , mailAddress: String
    , emailAddress: String
    , phoneNumber: String
    , uri: String
    , classifications: [csEltSchema]
    , workingGroupOf: String
});

schemas.userSchema = mongoose.Schema ({
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

schemas.namingSchema = mongoose.Schema({
    designation: String
    , definition: String
    , definitionFormat: String
    , languageCode: String
    , context: {
        contextName: String
        , acceptability: String
    }
}, {_id: false});

schemas.attachmentSchema = mongoose.Schema({
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
}, {_id: false});

schemas.registrationStateSchema = {
    registrationStatus: {type: String}
    , effectiveDate: Date
    , untilDate: Date
    , administrativeNote: String
    , unresolvedIssue: String
    , administrativeStatus: String
    , replacedBy: {tinyId: String} 
};

schemas.commentSchema = mongoose.Schema({
    text: String
    , user: String
    , username: String
    , created: Date
    , pendingApproval: Boolean
}, {_id: false});

schemas.helpItemSchema = mongoose.Schema({
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
var attachmentApprovalSchema = {
    fileid: String
    , filename: String
    , filetype: String
    , uploadDate: Date
    , comment: String 
    , uploadedBy: {
        userId: String
        , username: String
    }
    , filesize: Number
};

schemas.message = mongoose.Schema ({
    recipient: {
        recipientType: {type: String, enum: ["user", "stewardOrg", "role"]}
        , name: String
    }
    , author: {authorType: String, name: String}
    , date: Date
    , type: {type: String, enum: ["MergeRequest", "CommentApproval", "AttachmentApproval"]}
    , typeRequest: requestSchema
    , typeCommentApproval: commentApprovalSchema
    , typeAttachmentApproval: attachmentApprovalSchema
    , states: [{
        action: {type: String, enum: ["Approved", "Filed"]}
        , date: Date
        , comment: String
    }]    
});

schemas.message.set('collection', 'messages');

schemas.fs_files = mongoose.Schema({
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

schemas.fs_files.set('collection', 'fs.files');

module.exports = schemas;
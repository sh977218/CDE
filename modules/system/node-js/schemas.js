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
    , _id: false
};

schemas.commentSchema = {
    text: String
    , user: String
    , username: String
    , created: Date
    , pendingApproval: Boolean
};

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
    element: {tinyId: String}
    , comment: {index: Number}
};

schemas.message = mongoose.Schema ({
    recipient: {
        recipientType: {type: String, enum: ["user", "stewardOrg"]}
        , name: String
    }
    , author: {authorType: String, name: String}
    , date: Date
    , type: {type: String, enum: ["Merge Request", "Comment Approval"]}
    , typeRequest: requestSchema
    , typeCommentApproval: commentApprovalSchema
    , states: [{
        action: {type: String, enum: ["Approved", "Filed"]}
        , date: Date
        , comment: String
    }]    
});

schemas.message.set('collection', 'messages');

module.exports = schemas;
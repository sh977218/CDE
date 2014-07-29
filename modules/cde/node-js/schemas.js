var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;
var schemas = {};

var conceptSchema = mongoose.Schema({
    name: String,
    origin: String,
    originId: String
}, {_id: false});

var permissibleValueSchema = mongoose.Schema({
    permissibleValue: String
    , valueMeaningName: String
    , valueMeaningCode: String
    , codeSystemName: String
    , codeSystemVersion: String
}, {_id: false});

var commentSchema = mongoose.Schema({
    text: String
    , user: String
    , username: String
    , created: Date
});

var namingSchema = mongoose.Schema({
    designation: String
    , definition: String
    , definitionFormat: String
    , languageCode: String
    , context: {
        contextName: String
        , acceptability: String
    }
}, {_id: false});

var csEltSchema = mongoose.Schema({
    name: String
    , elements: [csEltSchema]
}, {_id: false});

var attachmentSchema = mongoose.Schema({
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

var deJsonSchema = {
    naming:[namingSchema]         
    , origin: String
    , originId: String
    , stewardOrg: {
        name: String
    }
    , created: Date
    , updated: Date
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , uuid: String
    , version: String
    , dataElementConcept: {
        concepts: [conceptSchema]
        , conceptualDomain: {
            vsac: {
                id: String
                , name: String
                , version: String
            }
        }
    }
    , objectClass: {concepts: [conceptSchema]}
    , property:{concepts: [conceptSchema]}
    , valueDomain: {
        name: String
        , definition: String
        , uom: String
        , vsacOid: String
        , datatype: String
        , datatypeText: {
            minLength: String
            , maxLength: String
            , regex: String
            , rule: String
        }
        , datatypeInteger: {
            minValue: Number
            , maxValue: Number
        }
        , datatypeFloat: {
            minValue: Number
            , maxValue: Number 
            , precision: Number
        }
        , datatypeDate: {
            format: String
        }
        , datatypeExternallyDefined: {
            link: String
            , description: String
            , descriptionFormat: String
        }
        , datatypeValueList: {
            datatype: String
            , multi: Boolean
            , otherPleaseSpecify: Boolean
            , otherPleaseSpecifyText: String
        }
        , permissibleValues: [permissibleValueSchema]
    }
    , history: [ObjectId]
    , changeNote: String
    , cadsrRegStatus: String
    , registrationState: {
            registrationStatus: String
            , effectiveDate: Date
            , untilDate: Date
            , administrativeNote: String
            , unresolvedIssue: String
            , administrativeStatus: String
            , replacedBy: {uuid: String} 
        }
    , classification:  [
            {
                stewardOrg: {name: String}
                , elements: [csEltSchema]
            }
        ]
    , formUsageCounter: Number
    , properties: [
        {key: String, value: String, valueFormat: String}
    ]
    , ids: [
        {origin: String, id: String, version: String, _id: false}
    ]
    , comments: [commentSchema]
    , archived: Boolean
    , attachments: [attachmentSchema]
    , views: Number
    , usedByOrgs: [String]
};

var pinSchema = mongoose.Schema ({
   name: String
   , pinnedDate: Date
   , deUuid: String
});

schemas.pinningBoardSchema = mongoose.Schema ({
   name: String
   , description: String
   , shareStatus: String
   , createdDate: Date
   , updatedDate: Date
   , owner: {
       userId: mongoose.Schema.Types.ObjectId
        , username: String}
   , pins: [pinSchema]
});

////TODO: MOVE TO SYSTEM
//schemas.userSchema = mongoose.Schema ({
//    username: String
//    , password: String
//    , lastLogin: Date
//    , lockCounter: Number
//    , orgAdmin: [String]
//    , orgCurator: [String]
//    , siteAdmin: Boolean
//    , quota: Number
//    , viewHistory: [mongoose.Schema.Types.ObjectId]
//    , knownIPs: [String]
//});

////TODO: MOVE TO SYSTEM
//schemas.orgSchema = mongoose.Schema ({
//    name: String
//    , longName: String
//    , classifications: [csEltSchema]
//});

schemas.managedContextSchema = mongoose.Schema ({
   name: String 
});

var mergeRequestSchema = {
    source: {uuid: String}
    , destination: {uuid: String}
    , fields: {
        ids: Boolean
        , naming: Boolean
        , attachments: Boolean
        , properties: Boolean
        , classifications: Boolean
    }
    , states: [{
        action: String
        , date: Date
        , comment: String
    }]
};

schemas.message = mongoose.Schema ({
    recipient: {recipientType: String, name: String},
    author: {authorType: String, name: String},
    date: Date,
    type: String,
    typeMergeRequest: mergeRequestSchema
});

schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 

schemas.pinningBoardSchema.pre('save', function(next) {
   this.updatedDate = Date.now(); 
   next();
});

schemas.dataElementSchema.set('collection', 'dataelements');

//TODO: MOVE TO SYSTEM
//schemas.orgSchema.set('collection', 'orgs');
//schemas.userSchema.set('collection', 'users');

schemas.pinningBoardSchema.set('collection', 'pinningBoards');
schemas.message.set('collection', 'messages');

module.exports = schemas;

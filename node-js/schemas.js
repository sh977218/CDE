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
    , languageCode: String
    , context: {
        contextName: String
        , acceptability: String
    }
}, {_id: false});

var classificationSchema = mongoose.Schema({
    conceptSystem: String
    , concept: String
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
        conceptualDomain: {
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
        , permissibleValues: [permissibleValueSchema]
    }
    , history: [ObjectId]
    , changeNote: String
    , cadsrRegStatus: String
    , registrationState: {
            registrationStatus: String
            , registrationStatusSortOrder: Number
            , effectiveDate: Date
            , untilDate: Date
            , administrativeNote: String
            , unresolvedIssue: String
            , administrativeStatus: String
        }
    , classification:  [classificationSchema]
    , formUsageCounter: Number
    , comments: [commentSchema]
    , archived: Boolean
    , attachments: [attachmentSchema]
    , views: Number
};

var questionSchema = mongoose.Schema ({
    value: String
    , instructions: String
    , dataElement: {
        de_id: String
    }
}, {_id: false});

var moduleSchema = mongoose.Schema ({
    name: String
    , instructions: String
    , questions: [questionSchema]
}, {_id: false});

var formSchema = {
    name: String
    , instructions: String
    , registrationStatus: String
    , stewardOrg: {
        name: String
    }
    , updated: Date
    , created: Date
    , questions: [questionSchema]
    , modules: [moduleSchema]
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , registrationState: {
        registrationStatus: String
        , effectiveDate: Date
        , untilDate: Date
        , administrativeNote: String
        , unresolvedIssue: String
        , administrativeStatus: String
    }
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


schemas.userSchema = mongoose.Schema ({
    username: String
    , password: String
    , lastLogin: Date
    , lockCounter: Number
    , orgAdmin: [String]
    , orgCurator: [String]
    , formCart: [String]
    , siteAdmin: Boolean
    , quota: Number
    , viewHistory: [mongoose.Schema.Types.ObjectId]
});

schemas.orgSchema = mongoose.Schema ({
    name: String
});

schemas.managedContextSchema = mongoose.Schema ({
   name: String 
});

var regStatusSortMap = {
    Incomplete: 5
    , Candidate: 4
    , Recorded: 3
    , Qualified: 2
    , Standard: 1
    , "Preferred Standard": 0
};
    


schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 
schemas.dataElementSchema.pre('save', function(next) {
   this.registrationState.registrationStatusSortOrder = regStatusSortMap[this.registrationState.registrationStatus]; 
   
   next();
});

schemas.pinningBoardSchema.pre('save', function(next) {
   this.updatedDate = Date.now(); 
   next();
});

schemas.formSchema = mongoose.Schema(formSchema);

schemas.dataElementSchema.set('collection', 'dataelements');
schemas.formSchema.set('collection', 'forms');
schemas.userSchema.set('collection', 'users');
schemas.orgSchema.set('collection', 'orgs');
schemas.pinningBoardSchema.set('collection', 'pinningBoards');

module.exports = schemas;

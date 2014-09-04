var mongoose = require('mongoose')
    , ObjectId = require('mongodb').ObjectId
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

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

var deJsonSchema = {
    naming: [sharedSchemas.namingSchema]         
    , source: String
    , sourceId: String
    , origin: String
    , stewardOrg: {
        name: String
    }
    , created: Date
    , updated: Date
    , imported: Date
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
    , registrationState: sharedSchemas.registrationStateSchema
    , classification: [sharedSchemas.classificationSchema]
//    , classification:  [
//            {
//                stewardOrg: {name: String}
//                , elements: [csEltSchema]
//            }
//        ]
    , formUsageCounter: Number
    , properties: [
        {key: String, value: String, valueFormat: String}
    ]
    , ids: [
        {source: String, id: String, version: String, _id: false}
    ]
    , comments: [sharedSchemas.commentSchema]
    , archived: Boolean
    , isFork: Boolean
    , attachments: [sharedSchemas.attachmentSchema]
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

schemas.managedContextSchema = mongoose.Schema ({
   name: String 
});

var requestSchema = {
    source: {uuid: String, id: String}
    , destination: {uuid: String}
    , mergeFields: {
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
    typeRequest: requestSchema
});

schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 

schemas.pinningBoardSchema.pre('save', function(next) {
   this.updatedDate = Date.now(); 
   next();
});

schemas.dataElementSchema.set('collection', 'dataelements');

schemas.pinningBoardSchema.set('collection', 'pinningBoards');
schemas.message.set('collection', 'messages');

module.exports = schemas;

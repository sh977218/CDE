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
    , tinyId: {type: String, index: true}
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
        }
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
    }
    , history: [ObjectId]
    , changeNote: String
    , cadsrRegStatus: String
    , registrationState: sharedSchemas.registrationStateSchema
    , classification: [sharedSchemas.classificationSchema]
    , properties: [
        {key: String, value: String, valueFormat: String, _id: false}
    ]
    , ids: [
        {source: String, id: String, version: String, _id: false}
    ]
    , mappingSpecifications: [
        {content: String, spec_type: String, script: String, _id: false}
    ]
    , comments: [sharedSchemas.commentSchema]
    , archived: Boolean
    , isFork: Boolean
    , attachments: [sharedSchemas.attachmentSchema]
    , views: Number
    , referenceDocuments: [
        {docType: String, text: String, uri: String, providerOrg: String, title: String, languageCode: String, _id: false}
    ]
};

var pinSchema = mongoose.Schema ({
   name: String
   , pinnedDate: Date
   , deTinyId: String
}, {_id: false});

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

schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 

schemas.pinningBoardSchema.pre('save', function(next) {
   this.updatedDate = Date.now(); 
   next();
});

schemas.dataElementSchema.set('collection', 'dataelements');
schemas.pinningBoardSchema.set('collection', 'pinningBoards');

schemas.cdeAuditSchema = mongoose.Schema({
    date: Date
    , user: {
        username: String
    }
    , adminItem: {
        tinyId: String
        , version: String
        , _id: mongoose.Schema.Types.ObjectId
        , name: String
    }
    , previousItem: {
        tinyId: String
        , version: String
        , _id: mongoose.Schema.Types.ObjectId
        , name: String
    }
    , diff: Object
}, { strict: false}); 

schemas.cdeAuditSchema.set('collection', 'cdeAudit');

module.exports = schemas;

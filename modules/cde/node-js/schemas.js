var mongoose = require('mongoose')
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

var schemas = {};

var conceptSchema = new mongoose.Schema({
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
    , property: {concepts: [conceptSchema]}
    , valueDomain: {
        name: String
        , definition: String
        , uom: String
        , vsacOid: String
        , datatype: String
        , datatypeText: {
            minLength: Number
            , maxLength: Number
            , regex: String
            , rule: String
        }
        , datatypeNumber: {
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
    , history: [mongoose.Schema.Types.ObjectId]
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
    , forkOf: String
    , attachments: [sharedSchemas.attachmentSchema]
    , views: Number
    , referenceDocuments: [sharedSchemas.referenceDocumentSchema]
};

var pinSchema = new mongoose.Schema({
    name: String
    , pinnedDate: Date
    , deTinyId: String
});

schemas.pinningBoardSchema = new mongoose.Schema({
    name: String
    , description: String
    , shareStatus: String
    , createdDate: Date
    , updatedDate: Date
    , owner: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , pins: [pinSchema]
});

schemas.dataElementSchema = new mongoose.Schema(deJsonSchema);

schemas.pinningBoardSchema.pre('save', function (next) {
    this.updatedDate = Date.now();
    next();
});

schemas.dataElementSchema.set('collection', 'dataelements');
schemas.pinningBoardSchema.set('collection', 'pinningBoards');

schemas.cdeAuditSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now, index: true}
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
}, {strict: false});

schemas.cdeAuditSchema.set('collection', 'cdeAudit');

module.exports = schemas;

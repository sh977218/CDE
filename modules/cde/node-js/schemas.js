var mongoose = require('mongoose')
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

var schemas = {};

var conceptSchema = new mongoose.Schema({
    name: String,
    origin: String,
    originId: String
}, {_id: false});

var derivationRuleSchema = new mongoose.Schema(
    {
        name: String,
        inputs: [String],
        outputs: [String],
        ruleType: {type: String, enum: ['score', 'panel']},
        formula: {type: String, enum: ['sumAll']}
    }, {_id: true}
);

var deJson = {
    naming: [sharedSchemas.namingSchema]
    , source: String
    , sources: [sharedSchemas.sourceSchema]
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
        , identifiers: [sharedSchemas.idSchema]
        , ids: [sharedSchemas.idSchema]
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
        , datatypeTime: {
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
    , lastMigrationScript: String
    , registrationState: sharedSchemas.registrationStateSchema
    , classification: [sharedSchemas.classificationSchema]
    , properties: [sharedSchemas.propertySchema]
    , ids: [sharedSchemas.idSchema]
    , dataSets: [sharedSchemas.dataSetSchema]
    , mappingSpecifications: [
        {content: String, spec_type: String, script: String, _id: false}
    ]
    , comments: [sharedSchemas.commentSchema]
    , archived: Boolean
    , forkOf: String
    , attachments: [sharedSchemas.attachmentSchema]
    , views: Number
    , referenceDocuments: [sharedSchemas.referenceDocumentSchema]
    , derivationRules: [derivationRuleSchema]
};

schemas.deJson = deJson;
schemas.dataElementSchema = new mongoose.Schema(deJson);


schemas.dataElementSchema.set('collection', 'dataelements');

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

var mongoose = require('mongoose')
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

var schemas = {};

var conceptSchema = new mongoose.Schema({
    name: String,
    origin: {type: String, description: "Where the concept may find its source"},
    originId: {type: String, description: "The ID of the concept in its source"}
}, {_id: false});

var derivationRuleSchema = new mongoose.Schema(
    {
        name: String,
        inputs: {type: [String], index: true, description: "List of inputs to the rule"},
        outputs: {type: [String], description: "list of outputs for the rule. "},
        ruleType: {type: String, enum: ['score', 'panel']},
        formula: {type: String, enum: ['sumAll', 'mean']}
    }, {_id: true}
);

var deJson = {
    elementType: {type: String, default: 'cde', description: "This value is always 'cde'"}
    , naming: {type: [sharedSchemas.namingSchema], description: "Anything used to describe this CDE in spoken language goes here"}
    , source: {type: String, description: "This field is replaced with sources"}
    , sources: {type: [sharedSchemas.sourceSchema], decription: "If the CDE was imported from one or more systems, we would call the system a source"}
    , origin: {type: String, description: "The origin, see examples of origin"}
    , stewardOrg: {
        name: {type: String, description: "The steward may be able to modify the CDE"}
    }
    , created: Date
    , updated: {type: Date, index: true}
    , imported: {type: Date, description: "If imported from a source, whether or not updated"}
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , tinyId: {type: String, index: true, description: "This ID is the same for all versions of the CDE."}
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
        , uom: {type: String, description: "Unit of Measure"}
        , vsacOid: String
        , datatype: {type: String, description: "Can be 'Value List' or any other datatype. If Value List, then another datatype is described."}
        , datatypeText: {
            minLength: {type: Number, description: "To indicate limits on length"}
            , maxLength: {type: Number, description: "To indicate limits on length"}
            , regex: {type: String, description: "To indicate a regular expression that someone may want to match on"}
            , rule: {type: String, description: "Any rule may go here"}
        }
        , datatypeNumber: {
            minValue: Number
            , maxValue: Number
            , precision: {type: Number, description: "Any precision for this number. Typically an integer for a float"}
        }
        , datatypeDate: {
            format: {type: String, description: "Any date format that someone may want to enforce"}
        }
        , datatypeTime: {
            format: {type: String, description: "Any format that someone may want to enforce"}
        }
        , datatypeExternallyDefined: {
            link: {type: String, description: "a link to en external source. Typically a URL"}
            , description: String
            , descriptionFormat: {type: String, description: "if 'html', then parse with HTML"}
        }
        , datatypeValueList: {
            datatype: {type: String, description: "Any datatype for a value list, typically string or number"}
        }
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
    }
    , history: [mongoose.Schema.Types.ObjectId]
    , changeNote: {type: String, description: "Used for help with changes"}
    , lastMigrationScript: {type: String, description: "Not typically used, but may be present. Can be ignored"}
    , registrationState: sharedSchemas.registrationStateSchema
    , classification: {type: [sharedSchemas.classificationSchema], description: "How is this element used."}
    , properties: {type: [sharedSchemas.propertySchema], description: "All properties of this element that do not fit anywhere else."}
    , ids: {type: [sharedSchemas.idSchema], description: "All IDs this element is known by"}
    , dataSets: {type: [sharedSchemas.dataSetSchema], description: "A list of datasets that use this CDE"}
    , mappingSpecifications: {type: [{content: String, spec_type: String, script: String, _id: false}], descrition: "Deprecated"}
    , comments: [sharedSchemas.commentSchema]
    , archived: {type: Boolean, default: false, index: true, description: "false for previous versions of CDEs"}
    , forkOf: {type: String, description: "May point to a tinyID if the CDE is a fork"}
    , attachments: [sharedSchemas.attachmentSchema]
    , views: Number
    , referenceDocuments: {type: [sharedSchemas.referenceDocumentSchema], description: "Reference Documents. Typically links to external documents"}
    , derivationRules: [derivationRuleSchema]
};

schemas.deJson = deJson;
schemas.dataElementSchema = new mongoose.Schema(deJson, {
    toJSON: {
        transform: function (doc, ret, options) {
            ret._links = {
                describedBy: {
                    href: '/meta/schemas/example'
                }
            };
        }
    }});


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

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const sharedSchemas = require('../system/schemas.js');

var conceptSchema = new Schema({
    name: sharedSchemas.stringType,
    origin: sharedSchemas.stringType, // Source of concept
    originId: sharedSchemas.stringType // Identifier of concept from source
}, {_id: false});

var deJson = {
    elementType: Object.assign({default: 'cde', enum: ['cde']}, sharedSchemas.stringType),
    designations: [sharedSchemas.designationSchema],
    definitions: [sharedSchemas.definitionSchema],
    source: sharedSchemas.stringType, // This field is replaced with sources
    sources: [sharedSchemas.sourceSchema], // Name of system from which CDE was imported or obtained from
    origin: sharedSchemas.stringType, // Name of system where CDE is derived
    stewardOrg: {
        name: sharedSchemas.stringType, // Name of organization or entity responsible for supervising content and administration of CDE
    },
    created: Date,
    updated: {type: Date, index: true},
    imported: Date, // Date last imported from source
    createdBy: {
        userId: Schema.Types.ObjectId,
        username: sharedSchemas.stringType
    },
    updatedBy: {
        userId: Schema.Types.ObjectId,
        username: sharedSchemas.stringType
    },
    tinyId: sharedSchemas.stringIndexType, // Internal CDE identifier
    version: sharedSchemas.stringType,
    dataElementConcept: {
        concepts: [conceptSchema],
        conceptualDomain: {
            vsac: {
                id: sharedSchemas.stringType,
                name: sharedSchemas.stringType,
                version: sharedSchemas.stringType
            }
        }
    },
    objectClass: {concepts: [conceptSchema]},
    property: {concepts: [conceptSchema]},
    valueDomain: {
        name: sharedSchemas.stringType,
        identifiers: [sharedSchemas.idSchema],
        ids: [sharedSchemas.idSchema],
        definition: sharedSchemas.stringType,
        uom: sharedSchemas.stringType, // Unit of Measure
        vsacOid: sharedSchemas.stringType,
        datatype: sharedSchemas.stringType, // Expected type of data
        datatypeText: {
            minLength: Number, // To indicate limits on length
            maxLength: Number, // To indicate limits on length
            regex: sharedSchemas.stringType, // To indicate a regular expression that someone may want to match on
            rule: sharedSchemas.stringType, // Any rule may go here
            showAsTextArea: {type: Boolean, default: false} // multi-line
        },
        datatypeNumber: {
            minValue: Number,
            maxValue: Number,
            precision: Number, // Any precision for this number. Typically an integer for a float. Limit to 10^precision
        },
        datatypeDate: {},
        datatypeTime: { // time only, periodic?
            format: sharedSchemas.stringType, // Any format that someone may want to enforce
        },
        datatypeExternallyDefined: {
            link: sharedSchemas.stringType, // a link to an external source. Typically a URL
            description: sharedSchemas.stringType,
            descriptionFormat: sharedSchemas.stringType, // if 'html', then parse with HTML
        },
        datatypeValueList: {},
        permissibleValues: [sharedSchemas.permissibleValueSchema]
    },
    history: [Schema.Types.ObjectId],
    changeNote: sharedSchemas.stringType, // Description of last modification
    lastMigrationScript: sharedSchemas.stringType, // Internal use only
    registrationState: sharedSchemas.registrationStateSchema,
    classification: [sharedSchemas.classificationSchema], // Organization or categorization by Steward Organization
    properties: [sharedSchemas.propertySchema], // Attribute not otherwise documented by structured CDE record
    ids: [sharedSchemas.idSchema], // Identifier used to establish or indicate what CDE is within a specific context
    dataSets: [sharedSchemas.dataSetSchema], // A list of datasets that use this CDE
    archived: {type: Boolean, default: false, index: true}, // Indication of historical record. True for previous versions.
    forkOf: sharedSchemas.stringType, // May point to a tinyID if the CDE is a fork
    attachments: [sharedSchemas.attachmentSchema],
    views: {type: Number, default: 0},
    referenceDocuments: [sharedSchemas.referenceDocumentSchema], // Any written, printed or electronic matter used as a source of information. Used to provide information or evidence of authoritative or official record.
    derivationRules: [sharedSchemas.derivationRuleSchema]
};

exports.deJson = deJson;
exports.dataElementSchema = new Schema(deJson, {
    usePushEach: true,
    toJSON: {
        transform: function (doc, ret) {
            ret._links = {
                describedBy: {
                    href: '/meta/schemas/example'
                }
            };
        }
    }
});


exports.dataElementSchema.set('collection', 'dataelements');

exports.cdeAuditSchema = new Schema({
    date: {type: Date, default: Date.now, index: true},
    user: {
        username: sharedSchemas.stringType
    },
    adminItem: {
        tinyId: sharedSchemas.stringType,
        version: sharedSchemas.stringType,
        _id: Schema.Types.ObjectId,
        name: sharedSchemas.stringType
    },
    previousItem: {
        tinyId: sharedSchemas.stringType,
        version: sharedSchemas.stringType,
        _id: Schema.Types.ObjectId,
        name: sharedSchemas.stringType
    },
    diff: Object
}, {strict: false});

exports.cdeAuditSchema.set('collection', 'cdeAudit');
exports.draftSchema = new Schema(deJson, {
    usePushEach: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
exports.draftSchema.virtual('isDraft').get(function () {
    return true;
});
exports.draftSchema.set('collection', 'dataelementdrafts');

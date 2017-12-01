const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const sharedSchemas = require('../../system/node-js/schemas.js');

var conceptSchema = new Schema({
    name: String,
    origin: {type: String, description: "Source of concept"},
    originId: {type: String, description: "Identifier of concept from source"}
}, {_id: false});

var deJson = {
    elementType: {type: String, default: 'cde', enum: ['cde']},
    naming: {
        type: [sharedSchemas.namingSchema],
        description: "Any string used by which CDE is known, addressed or referred to"
    },
    source: {type: String, description: "This field is replaced with sources"},
    sources: {
        type: [sharedSchemas.sourceSchema],
        description: "Name of system from which CDE was imported or obtained from"
    },
    origin: {type: String, description: "Name of system where CDE is derived"},
    stewardOrg: {
        name: {
            type: String,
            description: "Name of organization or entity responsible for supervising content and administration of CDE"
        }
    },
    created: Date,
    updated: {type: Date, index: true},
    imported: {type: Date, description: "Date last imported from source"},
    createdBy: {
        userId: Schema.Types.ObjectId,
        username: String
    },
    updatedBy: {
        userId: Schema.Types.ObjectId,
        username: String
    },
    tinyId: {type: String, index: true, description: "Internal CDE identifier"},
    version: String,
    dataElementConcept: {
        concepts: [conceptSchema],
        conceptualDomain: {
            vsac: {
                id: String,
                name: String,
                version: String
            }
        }
    },
    objectClass: {concepts: [conceptSchema]},
    property: {concepts: [conceptSchema]},
    valueDomain: {
        name: String,
        identifiers: [sharedSchemas.idSchema],
        ids: [sharedSchemas.idSchema],
        definition: String,
        uom: {type: String, description: "Unit of Measure"},
        vsacOid: String,
        datatype: {type: String, description: "Expected type of data"},
        datatypeText: {
            minLength: {type: Number, description: "To indicate limits on length"},
            maxLength: {type: Number, description: "To indicate limits on length"},
            regex: {type: String, description: "To indicate a regular expression that someone may want to match on"},
            rule: {type: String, description: "Any rule may go here"}
        },
        datatypeNumber: {
            minValue: Number,
            maxValue: Number,
            precision: {type: Number, description: "Any precision for this number. Typically an integer for a float"}
        },
        datatypeDate: {
            format: {type: String, description: "Any date format that someone may want to enforce"}
        },
        datatypeTime: {
            format: {type: String, description: "Any format that someone may want to enforce"}
        },
        datatypeExternallyDefined: {
            link: {type: String, description: "a link to an external source. Typically a URL"},
            description: String,
            descriptionFormat: {type: String, description: "if 'html', then parse with HTML"}
        },
        datatypeValueList: {
            datatype: {type: String, description: "Any datatype for a value list, typically string or number"}
        },
        permissibleValues: [sharedSchemas.permissibleValueSchema]
    },
    history: [Schema.Types.ObjectId],
    changeNote: {type: String, description: "Description of last modification"},
    lastMigrationScript: {type: String, description: "Internal use only"},
    registrationState: sharedSchemas.registrationStateSchema,
    classification: {
        type: [sharedSchemas.classificationSchema],
        description: "Organization or categorization by Steward Organization"
    },
    properties: {
        type: [sharedSchemas.propertySchema],
        description: "Attribute not otherwise documented by structured CDE record"
    },
    ids: {
        type: [sharedSchemas.idSchema],
        description: "Identifier used to establish or indicate what CDE is within a specific context"
    },
    dataSets: {type: [sharedSchemas.dataSetSchema], description: "A list of datasets that use this CDE"},
    mappingSpecifications: {
        type: [{content: String, spec_type: String, script: String, _id: false}],
        description: "Deprecated"
    },
    comments: [sharedSchemas.commentSchema],
    archived: {
        type: Boolean,
        default: false,
        index: true,
        description: "Indication of historical record. True for previous versions."
    },
    forkOf: {type: String, description: "May point to a tinyID if the CDE is a fork"},
    attachments: [sharedSchemas.attachmentSchema],
    views: Number,
    referenceDocuments: {
        type: [sharedSchemas.referenceDocumentSchema],
        description: "Any written, printed or electronic matter used as a source of information. Used to provide information or evidence of authoritative or official record."
    },
    derivationRules: [sharedSchemas.derivationRuleSchema]
};

exports.deJson = deJson;
exports.dataElementSchema = new Schema(deJson, {
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
        username: String
    },
    adminItem: {
        tinyId: String,
        version: String,
        _id: Schema.Types.ObjectId,
        name: String
    },
    previousItem: {
        tinyId: String,
        version: String,
        _id: Schema.Types.ObjectId,
        name: String
    },
    diff: Object
}, {strict: false});

exports.cdeAuditSchema.set('collection', 'cdeAudit');
exports.draftSchema = new Schema(deJson, {
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

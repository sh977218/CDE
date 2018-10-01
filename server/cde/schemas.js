const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const sharedSchemas = require('../system/schemas.js');

var conceptSchema = new Schema({
    name: StringType,
    origin: {type: StringType, description: 'Source of concept'},
    originId: {type: StringType, description: 'Identifier of concept from source'},
}, {_id: false});

var deJson = {
    elementType: {type: StringType, default: 'cde', enum: ['cde']},
    designations: {
        type: [sharedSchemas.designationSchema],
        description: 'Any string used by which CDE is known, addressed or referred to',
    },
    definitions: {
        type: [sharedSchemas.definitionSchema],
        description: 'Description of the CDE',
    },
    source: {type: StringType, description: 'This field is replaced with sources'},
    sources: {
        type: [sharedSchemas.sourceSchema],
        description: 'Name of system from which CDE was imported or obtained from',
    },
    origin: {type: StringType, description: 'Name of system where CDE is derived'},
    stewardOrg: {
        name: {type: StringType, description: 'Name of organization or entity responsible for supervising content and administration of CDE'},
    },
    created: Date,
    updated: {type: Date, index: true},
    imported: {type: Date, description: 'Date last imported from source'},
    createdBy: {
        userId: Schema.Types.ObjectId,
        username: StringType
    },
    updatedBy: {
        userId: Schema.Types.ObjectId,
        username: StringType
    },
    tinyId: {type: StringType, index: true, description: 'Internal CDE identifier'},
    version: StringType,
    dataElementConcept: {
        concepts: [conceptSchema],
        conceptualDomain: {
            vsac: {
                id: StringType,
                name: StringType,
                version: StringType
            }
        }
    },
    objectClass: {concepts: [conceptSchema]},
    property: {concepts: [conceptSchema]},
    valueDomain: {
        name: StringType,
        identifiers: [sharedSchemas.idSchema],
        ids: [sharedSchemas.idSchema],
        definition: StringType,
        uom: {type: StringType, description: 'Unit of Measure'},
        vsacOid: StringType,
        datatype: {type: StringType, description: 'Expected type of data'},
        datatypeText: {
            minLength: {type: Number, description: 'To indicate limits on length'},
            maxLength: {type: Number, description: 'To indicate limits on length'},
            regex: {type: StringType, description: 'To indicate a regular expression that someone may want to match on'},
            rule: {type: StringType, description: 'Any rule may go here'},
            showAsTextArea: {type: Boolean, default: false, description: 'multi-line'},
        },
        datatypeNumber: {
            minValue: Number,
            maxValue: Number,
            precision: {type: Number, description: 'Any precision for this number. Typically an integer for a float. Limit to 10^precision'},
        },
        datatypeDate: {},
        datatypeTime: { // time only, periodic?
            format: {type: StringType, description: 'Any format that someone may want to enforce'},
        },
        datatypeExternallyDefined: {
            link: {type: StringType, description: 'a link to an external source. Typically a URL'},
            description: StringType,
            descriptionFormat: {type: StringType, description: "if 'html', then parse with HTML"},
        },
        datatypeValueList: {
            datatype: sharedSchemas.stringType
        },
        permissibleValues: [sharedSchemas.permissibleValueSchema]
    },
    history: [Schema.Types.ObjectId],
    changeNote: {type: StringType, description: 'Description of last modification'},
    lastMigrationScript: {type: StringType, description: 'Internal use only'},
    registrationState: sharedSchemas.registrationStateSchema,
    classification: {
        type: [sharedSchemas.classificationSchema],
        description: 'Organization or categorization by Steward Organization',
    },
    properties: {
        type: [sharedSchemas.propertySchema],
        description: 'Attribute not otherwise documented by structured CDE record',
    },
    ids: {
        type: [sharedSchemas.idSchema],
        description: 'Identifier used to establish or indicate what CDE is within a specific context',
    },
    dataSets: {
        type: [sharedSchemas.dataSetSchema],
        description: 'A list of datasets that use this CDE',
    },
    archived: {
        type: Boolean,
        default: false,
        index: true,
        description: 'Indication of historical record. True for previous versions.',
    },
    forkOf: {type: StringType, description: 'May point to a tinyID if the CDE is a fork'},
    attachments: [sharedSchemas.attachmentSchema],
    views: {type: Number, default: 0},
    referenceDocuments: {
        type: [sharedSchemas.referenceDocumentSchema],
        description: 'Any written, printed or electronic matter used as a source of information. Used to provide information or evidence of authoritative or official record.',
    },
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
        username: StringType
    },
    adminItem: {
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType
    },
    previousItem: {
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType
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

const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const sharedSchemas = require('../system/schemas.js');

let conceptSchema = new Schema({
    name: StringType,
    origin: {type: StringType, description: 'Source of concept'},
    originId: {type: StringType, description: 'Identifier of concept from source'},
}, {_id: false});

let deJson = {
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
        name: {
            type: StringType,
            description: 'Name of organization or entity responsible for supervising content and administration of CDE'
        },
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
            type: { // required to make optional
                minLength: {type: Number, description: 'To indicate limits on length'},
                maxLength: {type: Number, description: 'To indicate limits on length'},
                regex: {
                    type: StringType,
                    description: 'To indicate a regular expression that someone may want to match on'
                },
                rule: {type: StringType, description: 'Any rule may go here'},
                showAsTextArea: {type: Boolean, default: false, description: 'Multi-line'},
            }
        },
        datatypeNumber: {
            type: { // required to make optional
                minValue: Number,
                maxValue: Number,
                precision: {
                    type: Number,
                    description: 'Any precision for this number. Typically an integer for a float. Limit to 10^precision'
                },
            }
        },
        datatypeDate: {
            type: { // required to make optional
                precision: {
                    type: StringType,
                    enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
                    default: 'Day',
                }
            }
        },
        datatypeTime: { // time only, periodic?
            type: { // required to make optional
                format: {type: StringType, description: 'Any format that someone may want to enforce'},
            }
        },
        datatypeExternallyDefined: {
            type: { // required to make optional
                link: {type: StringType, description: 'A link to an external source. Typically a URL'},
                description: StringType,
                descriptionFormat: {type: StringType, description: "if 'html', then parse with HTML"},
            }
        },
        datatypeValueList: {
            type: { // required to make optional
                datatype: {type: StringType, description: "Value list format"}
            }
        },
        datatypeDynamicCodeList: {
            type: { // required to make optional
                system: {type: StringType},
                code: {type: StringType}
            }
        },
        permissibleValues: {
            type: [sharedSchemas.permissibleValueSchema], // required to make optional
            default: undefined,
        }
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
    collection: 'dataelements',
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
exports.dataElementSchema.index({tinyId: 1, archived: 1}, {
    unique: true,
    name: "liveTinyId",
    partialFilterExpression: {archived: false}
});
/*
exports.dataElementSchema.path("valueDomain").validate(v => {
    if (v.datatype === 'Dynamic Code List') return !!v.datatypeDynamicCodeList;
    return true;
}, "Code is required for CodeList Datatype");
*/
exports.dataElementSchema.path("classification").validate(v => {
    let result = true;
    v.forEach(classif => {
        if (!classif.elements || classif.elements.length === 0) result = false;
    });
    return result;
}, "Classification cannot be empty");

exports.dataElementSchema.path("classification").validate(v => {
    return !v.map(value => value.stewardOrg.name)
        .some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
}, "Duplicate Steward Classification");

exports.draftSchema = new Schema(deJson, {
    collection: 'dataelementdrafts',
    usePushEach: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
exports.draftSchema.virtual('isDraft').get(() => true);

exports.dataElementSourceSchema = new Schema(deJson, {
    usePushEach: true,
    collection: 'dataelementsources'
});
exports.dataElementSourceSchema.index({tinyId: 1, source: 1}, {unique: true});

exports.auditSchema = new Schema(sharedSchemas.eltLogSchema, {collection: 'cdeAudit', strict: false});
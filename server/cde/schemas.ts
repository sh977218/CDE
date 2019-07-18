import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import {
    attachmentSchema, classificationSchema, dataSetSchema, definitionSchema, derivationRuleSchema, designationSchema,
    eltLogSchema, idSchema, permissibleValueSchema, propertySchema, referenceDocumentSchema, registrationStateSchema,
    sourceSchema
} from '../system/schemas';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

let conceptSchema = new Schema({
    name: StringType,
    origin: {type: StringType, description: 'Source of concept'},
    originId: {type: StringType, description: 'Identifier of concept from source'},
}, {_id: false});

export const deJson = {
    elementType: {type: StringType, default: 'cde', enum: ['cde']},
    tinyId: {type: StringType, index: true, description: 'Internal CDE identifier'},
    designations: {
        type: [designationSchema],
        description: 'Any string used by which CDE is known, addressed or referred to',
    },
    definitions: {
        type: [definitionSchema],
        description: 'Description of the CDE',
    },
    source: {type: StringType, description: 'This field is replaced with sources'},
    sources: {
        type: [sourceSchema],
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
    version: StringType,
    changeNote: {type: StringType, description: 'Description of last modification'},
    lastMigrationScript: {type: StringType, description: 'Internal use only'},
    registrationState: registrationStateSchema,
    classification: {
        type: [classificationSchema],
        description: 'Organization or categorization by Steward Organization',
    },
    referenceDocuments: {
        type: [referenceDocumentSchema],
        description: 'Any written, printed or electronic matter used as a source of information. Used to provide information or evidence of authoritative or official record.',
    },
    properties: {
        type: [propertySchema],
        description: 'Attribute not otherwise documented by structured CDE record',
    },
    ids: {
        type: [idSchema],
        description: 'Identifier used to establish or indicate what CDE is within a specific context',
    },
    attachments: [attachmentSchema],
    history: [Schema.Types.ObjectId],
    archived: {
        type: Boolean,
        default: false,
        index: true,
        description: 'Indication of historical record. True for previous versions.',
    },

    property: {concepts: [conceptSchema]},
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
    valueDomain: {
        name: StringType,
        identifiers: [idSchema],
        ids: [idSchema],
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
            type: [permissibleValueSchema], // required to make optional
            default: undefined,
        }
    },
    dataSets: {
        type: [dataSetSchema],
        description: 'A list of datasets that use this CDE',
    },
    forkOf: {type: StringType, description: 'May point to a tinyID if the CDE is a fork'},
    views: {type: Number, default: 0},
    derivationRules: [derivationRuleSchema]
};
export const dataElementSchema = new Schema(deJson, {
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
dataElementSchema.index({tinyId: 1, archived: 1}, {
    unique: true,
    name: "liveTinyId",
    partialFilterExpression: {archived: false}
});
/*
dataElementSchema.path("valueDomain").validate(v => {
    if (v.datatype === 'Dynamic Code List') return !!v.datatypeDynamicCodeList;
    return true;
}, "Code is required for CodeList Datatype");
*/
dataElementSchema.path("classification").validate(v => {
    let result = true;
    v.forEach(classif => {
        if (!classif.elements || classif.elements.length === 0) result = false;
    });
    return result;
}, "Classification cannot be empty");
dataElementSchema.path("classification").validate(v => {
    return !v.map(value => value.stewardOrg.name)
        .some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
}, "Duplicate Steward Classification");

export const draftSchema = new Schema(deJson, {
    collection: 'dataelementdrafts',
    usePushEach: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
draftSchema.virtual('isDraft').get(() => true);

export const dataElementSourceSchema = new Schema(deJson, {
    collection: 'dataelementsources',
    usePushEach: true
});
dataElementSourceSchema.index({tinyId: 1, source: 1}, {unique: true});

export const auditSchema = new Schema(eltLogSchema, {
    collection: 'cdeAudit',
    strict: false
});

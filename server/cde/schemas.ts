import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import {
    attachmentSchema, classificationSchema, dataSetSchema, datatypeDateSchema, datatypeExternallyDefinedSchema,
    datatypeNumberSchema, datatypeTextSchema, datatypeTimeSchema, datatypeValueListSchema, definitionSchema,
    derivationRuleSchema, designationSchema, eltLogSchema, idSchema, permissibleValueSchema, propertySchema,
    referenceDocumentSchema, registrationStateSchema, sourceSchema
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
        datatypeText: datatypeTextSchema,
        datatypeNumber: datatypeNumberSchema,
        datatypeDate: datatypeDateSchema,
        datatypeTime: datatypeTimeSchema,
        datatypeValueList: datatypeValueListSchema,
        datatypeDynamicCodeList: datatypeValueListSchema,
        datatypeExternallyDefined: datatypeExternallyDefinedSchema,
        permissibleValues: {
            type: [permissibleValueSchema], // required to make optional
            default: [],
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

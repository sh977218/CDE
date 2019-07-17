import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import {
    attachmentSchema, classificationSchema, dataSetSchema, definitionSchema, derivationRuleSchema, designationSchema,
    eltLogSchema, idSchema, permissibleValueSchema, propertySchema, referenceDocumentSchema, registrationStateSchema,
    sourceSchema
} from '../system/schemas';
import { DataTypeArray } from 'shared/de/dataElement.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

let conceptSchema = new Schema({
    name: StringType,
    origin: {type: StringType, description: 'Source of concept'},
    originId: {type: StringType, description: 'Identifier of concept from source'},
}, {_id: false});

export const datatypeTextSchema = new Schema({
    minLength: {type: Number, description: 'To indicate limits on length'},
    maxLength: {type: Number, description: 'To indicate limits on length'},
    regex: {type: StringType, description: 'To indicate a regular expression that someone may want to match on'},
    rule: {type: StringType, description: 'Any rule may go here'},
    showAsTextArea: {type: Boolean, description: 'Multi-line'},
}, {_id: false});
export const datatypeNumberSchema = new Schema({
    minValue: Number,
    maxValue: Number,
    precision: Number,
}, {_id: false});
export const datatypeDateSchema = new Schema({
    precision: {
        type: StringType,
        enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second']
    }
}, {_id: false});
export const datatypeTimeSchema = new Schema({
    format: StringType,
}, {_id: false});
export const datatypeDynamicCodeListSchema = new Schema({
    system: StringType,
    code: StringType
}, {_id: false});
export const datatypeValueListSchema = new Schema({
    datatype: {type: StringType, description: "Value list format"}
}, {_id: false});
export const datatypeExternallyDefinedSchema = new Schema({
    link: {type: StringType, description: 'A link to an external source. Typically a URL'},
    description: StringType,
    descriptionFormat: {type: StringType, description: "if 'html', then parse with HTML"},
}, {_id: false});

export const deJson = {
    elementType: {type: StringType, default: 'cde'},
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
    created: {type: Date},
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
        identifiers: [idSchema],
        ids: [idSchema],
        definition: StringType,
        uom: {type: StringType, description: 'Unit of Measure'},
        vsacOid: StringType,
        datatype: {
            type: StringType, description: 'Expected type of data', enum: DataTypeArray
        },
        datatypeText: datatypeTextSchema,
        datatypeNumber: datatypeNumberSchema,
        datatypeDate: datatypeDateSchema,
        datatypeTime: datatypeTimeSchema,
        datatypeDynamicCodeList: datatypeDynamicCodeListSchema,
        datatypeValueList: datatypeValueListSchema,
        datatypeExternallyDefined: datatypeExternallyDefinedSchema,
        permissibleValues: [permissibleValueSchema]
    },
    history: [Schema.Types.ObjectId],
    changeNote: {type: StringType, description: 'Description of last modification'},
    lastMigrationScript: {type: StringType, description: 'Internal use only'},
    registrationState: registrationStateSchema,
    classification: {
        type: [classificationSchema],
        description: 'Organization or categorization by Steward Organization',
    },
    properties: {
        type: [propertySchema],
        description: 'Attribute not otherwise documented by structured CDE record',
    },
    ids: {
        type: [idSchema],
        description: 'Identifier used to establish or indicate what CDE is within a specific context',
    },
    dataSets: {
        type: [dataSetSchema],
        description: 'A list of datasets that use this CDE',
    },
    archived: {
        type: Boolean,
        default: false,
        index: true,
        description: 'Indication of historical record. True for previous versions.',
    },
    forkOf: {type: StringType, description: 'May point to a tinyID if the CDE is a fork'},
    attachments: [attachmentSchema],
    views: {type: Number, default: 0},
    referenceDocuments: {
        type: [referenceDocumentSchema],
        description: 'Any written, printed or electronic matter used as a source of information. Used to provide information or evidence of authoritative or official record.',
    },
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

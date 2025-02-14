import * as mongoose from 'mongoose';
import { DataElement, DataElementDraft, DataElementSource } from 'server/mongo/mongoose/dataElement.mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';
import {
    attachmentSchema,
    classificationSchema,
    dataSetSchema,
    datatypeDateSchema,
    datatypeDynamicListSchema,
    datatypeExternallyDefinedSchema,
    datatypeNumberSchema,
    datatypeTextSchema,
    datatypeTimeSchema,
    datatypeValueListSchema,
    definitionSchema,
    derivationRuleSchema,
    designationSchema,
    eltLogSchema,
    idSchema,
    permissibleValueSchema,
    propertySchema,
    referenceDocumentSchema,
    registrationStateSchema,
    sourceSchema,
} from 'server/system/schemas';
import { Classification, EltLog } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conceptSchema = new Schema(
    {
        name: StringType,
        origin: { type: StringType, description: 'Source of concept' },
        originId: { type: StringType, description: 'Identifier of concept from source' },
    },
    { _id: false }
);

export const deJson = {
    elementType: { type: StringType, default: 'cde', enum: ['cde'] },
    partOfBundles: { type: [StringType], default: [], description: 'Form tinyIds this CDE is part of bundle.' },
    nihEndorsed: { type: Boolean, default: false },
    tinyId: { type: StringType, index: true, description: 'Internal CDE identifier' },
    designations: {
        type: [designationSchema],
        description: 'Any string used by which CDE is known, addressed or referred to',
    },
    definitions: {
        type: [definitionSchema],
        description: 'Description of the CDE',
        default: [],
    },
    source: { type: StringType, description: 'This field is replaced with sources' },
    sources: {
        type: [sourceSchema],
        description: 'Name of system from which CDE was imported or obtained from',
    },
    sourcesNew: {
        type: Map,
        of: [sourceSchema],
        description: 'Name of system from which CDE was imported or obtained from',
        default: [],
    },
    origin: { type: StringType, description: 'Name of system where CDE is derived' },
    stewardOrg: {
        name: {
            type: StringType,
            description: 'Name of organization or entity responsible for supervising content and administration of CDE',
        },
    },
    created: Date,
    updated: { type: Date, index: true },
    imported: { type: Date, description: 'Date last imported from source' },
    createdBy: {
        username: { type: StringType, required: true },
    },
    updatedBy: {
        username: StringType,
    },
    version: StringType,
    changeNote: { type: StringType, description: 'Description of last modification' },
    lastMigrationScript: { type: StringType, description: 'Internal use only' },
    registrationState: registrationStateSchema,
    classification: {
        type: [classificationSchema],
        description: 'Organization or categorization by Steward Organization',
    },
    referenceDocuments: {
        type: [referenceDocumentSchema],
        description:
            'Any written, printed or electronic matter used as a source of information. Used to provide information or evidence of authoritative or official record.',
    },
    properties: {
        type: [propertySchema],
        description: 'Attribute not otherwise documented by structured CDE record',
    },
    ids: {
        type: [idSchema],
        description: 'Identifier used to establish or indicate what CDE is within a specific context',
    },
    attachments: {
        type: [attachmentSchema],
        default: [],
    },
    history: [Schema.Types.ObjectId],
    archived: {
        type: Boolean,
        default: false,
        index: true,
        description: 'Indication of historical record. True for previous versions.',
    },

    property: { concepts: [conceptSchema] },
    dataElementConcept: {
        concepts: [conceptSchema],
        conceptualDomain: {
            vsac: {
                id: StringType,
                name: StringType,
                version: StringType,
            },
        },
    },
    objectClass: { concepts: [conceptSchema] },
    valueDomain: {
        name: StringType,
        identifiers: [idSchema],
        ids: [idSchema],
        definition: StringType,
        uom: { type: StringType, description: 'Unit of Measure' },
        vsacOid: StringType,
        datatype: { type: StringType, description: 'Expected type of data' },
        datatypeText: datatypeTextSchema,
        datatypeNumber: datatypeNumberSchema,
        datatypeDate: datatypeDateSchema,
        datatypeTime: datatypeTimeSchema,
        datatypeValueList: datatypeValueListSchema,
        datatypeDynamicCodeList: datatypeDynamicListSchema,
        datatypeExternallyDefined: datatypeExternallyDefinedSchema,
        permissibleValues: {
            type: [permissibleValueSchema], // required to make optional
            default: [],
        },
    },
    dataSets: {
        type: [dataSetSchema],
        description: 'A list of datasets that use this CDE',
    },
    forkOf: { type: StringType, description: 'May point to a tinyID if the CDE is a fork' },
    views: { type: Number, default: 0 },
    derivationRules: [derivationRuleSchema],
};
export const dataElementSchema = new Schema<DataElement>(deJson, {
    collection: 'dataelements',
    toJSON: {
        transform(doc, ret) {
            ret._links = {
                describedBy: {
                    href: '/meta/schemas/example',
                },
            };
        },
    },
});
dataElementSchema.index(
    { tinyId: 1, archived: 1 },
    {
        unique: true,
        name: 'liveTinyId',
        partialFilterExpression: { archived: false },
    }
);
dataElementSchema.path('classification').validate((v: Classification[]) => {
    return !v
        .map(value => value.stewardOrg.name)
        .some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
}, 'Duplicate Steward Classification');

export const draftSchema = new Schema<DataElementDraft>(deJson, {
    collection: 'dataelementdrafts',
    toObject: {
        virtuals: true,
    },
    toJSON: {
        virtuals: true,
    },
});
draftSchema.virtual('isDraft').get(() => true);

export const dataElementSourceSchema = new Schema<DataElementSource>(deJson, {
    collection: 'dataelementsources',
});
dataElementSourceSchema.index({ tinyId: 1, source: 1 }, { unique: true });

export const auditSchema = new Schema<EltLog>(eltLogSchema, {
    collection: 'cdeAudit',
    strict: false,
});

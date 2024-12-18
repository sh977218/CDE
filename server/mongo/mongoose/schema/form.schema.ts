import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { config } from 'server';
import { CdeForm, FormDraft, FormSource } from 'server/mongo/mongoose/form.mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';
import {
    attachmentSchema,
    classificationSchema,
    codeAndSystemSchema,
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
import { FormElement } from 'shared/form/form.model';
import { Classification, EltLog } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const displayProfileSchema = new Schema(
    {
        name: StringType,
        sectionsAsMatrix: { type: Boolean },
        displayCopyright: { type: Boolean },
        displayValues: { type: Boolean },
        displayInstructions: { type: Boolean },
        displayNumbering: { type: Boolean },
        displayType: { type: StringType, enum: ['Dynamic', 'Follow-up'], default: 'Dynamic' },
        metadata: {
            device: Boolean,
        },
        numberOfColumns: { type: Number, min: 1, max: 6 },
        displayInvisible: { type: Boolean },
        repeatFormat: { type: StringType, default: '' },
        answerDropdownLimit: { type: Number, min: 0 },
        unitsOfMeasureAlias: [{ unitOfMeasure: codeAndSystemSchema, alias: StringType }],
    },
    { _id: false }
);

const instructionSchema = new Schema(
    {
        value: StringType,
        valueFormat: StringType,
    },
    { _id: false }
);

const datatypeNumberSchema = new Schema(
    {
        minValue: Number,
        maxValue: Number,
        precision: Number,
    },
    { _id: false }
);

const mapToSchema = new Schema({});

const questionSchema = new Schema(
    {
        cde: {
            tinyId: StringType,
            name: StringType,
            version: StringType,
            permissibleValues: {
                type: [permissibleValueSchema], // required to make optional
                default: [],
            },
            ids: [idSchema],
            derivationRules: [derivationRuleSchema],
            newCde: {
                type: {
                    definitions: [definitionSchema],
                    designations: [designationSchema],
                },
                default: undefined,
            },
        },
        datatype: StringType,
        datatypeNumber: datatypeNumberSchema,
        datatypeText: {
            minLength: Number,
            maxLength: Number,
            regex: StringType,
            rule: StringType,
            showAsTextArea: Boolean,
        },
        datatypeDate: {
            precision: {
                type: StringType,
                enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
            },
        },
        datatypeDynamicCodeList: {
            system: StringType,
            code: StringType,
        },
        displayAs: {
            type: StringType,
            enum: ['radio/checkbox/select', 'likert scale'],
        },
        unitsOfMeasure: [codeAndSystemSchema],
        required: { type: Boolean, default: false },
        invisible: { type: Boolean, default: false },
        editable: { type: Boolean, default: true },
        multiselect: Boolean,
        answers: {
            type: [permissibleValueSchema], // required to make optional
        },
        defaultAnswer: StringType,
    },
    { _id: false }
);

const inFormSchema = new Schema(
    {
        form: {
            tinyId: StringType,
            version: StringType,
            name: StringType,
            ids: [idSchema],
        },
    },
    { _id: false }
);

function getFormElementJson(formElements: FormElement[]) {
    return new Schema(
        {
            elementType: { type: StringType, enum: ['section', 'question', 'form'] },
            formElements,
            instructions: instructionSchema,
            inForm: { type: inFormSchema, default: undefined },
            label: StringType,
            mapTo: { type: mapToSchema, default: undefined },
            question: { type: questionSchema, default: undefined },
            repeat: StringType,
            repeatsFor: StringType,
            section: {},
            showIfExpression: StringType,
            skipLogic: {
                action: { type: StringType, enum: ['show', 'enable'] },
                condition: StringType,
            },
        },
        { _id: false }
    );
}

let innerFormEltSchema: any = getFormElementJson([]);
for (let i = 0; i < config.modules.forms.sectionLevels; i++) {
    innerFormEltSchema = getFormElementJson([innerFormEltSchema]);
}

const copyrightUrlSchema = new Schema({
    url: { type: StringType },
    valid: { type: Boolean, default: false },
});

export const formJson = {
    elementType: { type: StringType, default: 'form', enum: ['form'] },
    nihEndorsed: { type: Boolean, default: false },
    isBundle: { type: Boolean, default: false },
    tinyId: { type: StringType, index: true, description: 'Internal Form identifier' },
    designations: {
        type: [designationSchema],
        description: 'Any string used by which Form is known, addressed or referred to',
    },
    definitions: {
        type: [definitionSchema],
        description: 'Description of the Form',
        default: [],
    },
    source: { type: StringType, description: 'This field is replaced with sources' },
    sources: {
        type: [sourceSchema],
        description: 'Name of system from which Form was imported or obtained from',
    },
    sourcesNew: {
        type: Map,
        of: [sourceSchema],
        description: 'Name of system from which Form was imported or obtained from',
        default: [],
    },
    origin: { type: StringType, description: 'Name of system where Form is derived' },
    stewardOrg: {
        name: {
            type: StringType,
            description:
                'Name of organization or entity responsible for supervising content and administration of Form',
        },
    },
    created: Date,
    updated: { type: Date, index: true },
    imported: { type: Date, description: 'Date last imported from source' },
    createdBy: {
        username: StringType,
    },
    updatedBy: {
        username: StringType,
    },
    version: StringType,
    changeNote: { type: StringType, description: 'Description of last modification' },
    lastMigrationScript: StringType,
    registrationState: registrationStateSchema,
    classification: {
        type: [classificationSchema],
        description: 'Organization or categorization by Steward Organization',
    },
    referenceDocuments: {
        type: [referenceDocumentSchema],
        description:
            'Any written, printed or electronic matter used as a source of information. Used to provide information or evidence' +
            ' of authoritative or official record.',
    },
    properties: {
        type: [propertySchema],
        description: 'Attribute not otherwise documented by structured Form record',
    },
    ids: {
        type: [idSchema],
        description: 'Identifier used to establish or indicate what Form is within a specific context',
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

    mapTo: { type: mapToSchema, default: undefined },
    isCopyrighted: Boolean,
    noRenderAllowed: Boolean,
    copyright: {
        authority: StringType,
        text: { type: StringType, default: '' },
        urls: {
            type: [copyrightUrlSchema],
            default: [],
        },
    },
    formElements: [innerFormEltSchema],
    displayProfiles: [displayProfileSchema],
};
export const formSchema = new Schema<CdeForm>(formJson, {
    collection: 'forms',
});
formSchema.path('classification').validate((v: Classification[]) => {
    return !v
        .map(value => value.stewardOrg.name)
        .some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
}, 'Duplicate Steward Classification');
formSchema.index(
    { tinyId: 1, archived: 1 },
    {
        unique: true,
        name: 'formLiveTinyId',
        partialFilterExpression: { archived: false },
    }
);

export const draftSchema = new Schema<FormDraft>(formJson, {
    collection: 'formdrafts',
    toObject: {
        virtuals: true,
    },
    toJSON: {
        virtuals: true,
    },
});
draftSchema.virtual('isDraft').get(() => true);

export const formSourceSchema = new Schema<FormSource>(formJson, {
    collection: 'formsources',
});
formSourceSchema.index({ tinyId: 1, source: 1 }, { unique: true });

export const auditSchema = new Schema<EltLog>(eltLogSchema, {
    collection: 'formAudit',
    strict: false,
});

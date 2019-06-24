import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const sharedSchemas = require('../system/schemas');
const config = require('config');

const DisplayProfileSchema = new Schema({
    name: StringType,
    sectionsAsMatrix: {type: Boolean},
    displayCopyright: {type: Boolean},
    displayValues: {type: Boolean},
    displayInstructions: {type: Boolean},
    displayNumbering: {type: Boolean},
    displayType: {type: StringType, enum: ['Dynamic', 'Follow-up'], default: 'Dynamic'},
    metadata: {
        device: Boolean,
    },
    numberOfColumns: {type: Number, min: 1, max: 6},
    displayInvisible: {type: Boolean},
    repeatFormat: {type: StringType, default: ''},
    answerDropdownLimit: {type: Number, min: 0},
    unitsOfMeasureAlias: [{unitOfMeasure: sharedSchemas.codeAndSystemSchema, alias: StringType}],
    fhirProcedureMapping: {
        statusQuestionID: String,
        statusStatic: String,
        performedDate: String,
        procedureQuestionID: String,
        procedureCode: String,
        procedureCodeSystem: String,
        bodySiteQuestionID: String,
        bodySiteCode: String,
        bodySiteCodeSystem: String,
        usedReferences: String,
        usedReferencesMaps: [String],
        complications: String,
    }
}, {_id: false});

const instructionSchema = new Schema({
    value: StringType,
    valueFormat: StringType
}, {_id: false});

const datatypeNumberSchema = new Schema({
    minValue: Number,
    maxValue: Number,
    precision: Number
}, {_id: false});

const mapToSchema = {
    fhir: {
        resourceType: StringType,
    },
};

const questionSchema = new Schema({
    cde: {
        tinyId: StringType,
        name: StringType,
        designations: [sharedSchemas.designationSchema],
        definitions: [sharedSchemas.definitionSchema],
        version: StringType,
        permissibleValues: {
            type: [sharedSchemas.permissibleValueSchema], // required to make optional
            default: undefined,
        },
        ids: [sharedSchemas.idSchema],
        derivationRules: [sharedSchemas.derivationRuleSchema]
    },
    datatype: StringType,
    datatypeNumber: datatypeNumberSchema,
    datatypeText: {
        minLength: Number,
        maxLength: Number,
        regex: StringType,
        rule: StringType,
        showAsTextArea: {type: Boolean, default: false}
    },
    datatypeDate: {
        precision: {
            type: StringType,
            enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
            default: 'Day',
        }
    },
    datatypeDynamicCodeList: {
        system: {type: StringType},
        code: {type: StringType}
    },
    unitsOfMeasure: [sharedSchemas.codeAndSystemSchema],
    required: {type: Boolean, default: false},
    invisible: {type: Boolean, default: false},
    editable: {type: Boolean, default: true},
    multiselect: Boolean,
    answers: {
        type: [sharedSchemas.permissibleValueSchema], // required to make optional
        default: undefined,
    },
    defaultAnswer: StringType
}, {_id: false});

let inFormSchema = new Schema({
    form: {
        tinyId: StringType,
        version: StringType,
        name: StringType,
        ids: [sharedSchemas.idSchema]
    }
}, {_id: false});

function getFormElementJson() {
    return {
        elementType: {type: StringType, enum: ['section', 'question', 'form']},
        instructions: instructionSchema,
        inForm: {type: inFormSchema, default: undefined},
        label: StringType,
        mapTo: {type: mapToSchema, default: undefined},
        question: {type: questionSchema, default: undefined},
        repeat: StringType,
        repeatsFor: StringType,
        section: {},
        showIfExpression: StringType,
        skipLogic: {
            action: {type: StringType, enum: ['show', 'enable']},
            condition: StringType,
        },
    };
}

let innerFormEltSchema: any = getFormElementJson();
innerFormEltSchema.formElements = [];
for (let i = 0; i < config.modules.forms.sectionLevels; i++) {
    let innerFormEltJson: any = getFormElementJson();
    innerFormEltJson.formElements = [innerFormEltSchema];
    innerFormEltSchema = innerFormEltJson;
}

export const formJson = {
    elementType: {type: StringType, default: 'form', enum: ['form']},
    tinyId: {type: StringType, index: true},
    designations: [sharedSchemas.designationSchema],
    definitions: [sharedSchemas.definitionSchema],
    mapTo: {type: mapToSchema, default: undefined},
    stewardOrg: {
        name: StringType
    },
    source: StringType,
    sources: [sharedSchemas.sourceSchema],
    version: StringType,
    registrationState: sharedSchemas.registrationStateSchema,
    properties: [sharedSchemas.propertySchema],
    ids: {
        type: [sharedSchemas.idSchema],
        description: 'Identifier used to establish or indicate what CDE is within a specific context',
    },
    isCopyrighted: {type: Boolean},
    noRenderAllowed: {type: Boolean},
    copyright: {
        type: {
            authority: StringType,
            text: StringType
        },
        default: {text: null}
    },
    origin: StringType,
    attachments: [sharedSchemas.attachmentSchema],
    history: [Schema.Types.ObjectId],
    changeNote: StringType,
    lastMigrationScript: StringType,
    created: Date,
    updated: Date,
    imported: Date,
    createdBy: {
        userId: Schema.Types.ObjectId,
        username: StringType
    },
    updatedBy: {
        userId: Schema.Types.ObjectId,
        username: StringType
    },
    formElements: [innerFormEltSchema],
    archived: {type: Boolean, default: false, index: true},
    classification: [sharedSchemas.classificationSchema],
    displayProfiles: [DisplayProfileSchema],
    referenceDocuments: [sharedSchemas.referenceDocumentSchema]
};
export const formSchema = new Schema(formJson, {
    collection: 'forms',
    usePushEach: true
});
formSchema.path("classification").validate(v => {
    return !v.map(value => value.stewardOrg.name)
        .some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
}, "Duplicate Steward Classification");
formSchema.index({tinyId: 1, archived: 1}, {
    unique: true,
    name: 'formLiveTinyId',
    partialFilterExpression: {archived: false}
});

export const draftSchema = new Schema(formJson, {
    collection: 'formdrafts',
    usePushEach: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
draftSchema.virtual('isDraft').get(function () {
    return true;
});

export const formSourceSchema = new Schema(formJson, {
    collection: 'formsources',
    usePushEach: true
});
formSourceSchema.index({tinyId: 1, source: 1}, {unique: true});

export const auditSchema = new Schema(sharedSchemas.eltLogSchema, {
    collection: 'formAudit',
    strict: false
});

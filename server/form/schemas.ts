import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import {
    attachmentSchema, classificationSchema, codeAndSystemSchema, definitionSchema, derivationRuleSchema,
    designationSchema, eltLogSchema, idSchema, permissibleValueSchema, propertySchema, referenceDocumentSchema,
    registrationStateSchema, sourceSchema
} from 'server/system/schemas';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

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
    unitsOfMeasureAlias: [{unitOfMeasure: codeAndSystemSchema, alias: StringType}],
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

const mapToSchema = new Schema({
    fhir: {
        resourceType: StringType,
    },
});

const questionSchema = new Schema({
    cde: {
        tinyId: StringType,
        name: StringType,
        designations: [designationSchema],
        definitions: [definitionSchema],
        version: StringType,
        permissibleValues: {
            type: [permissibleValueSchema] // required to make optional
        },
        ids: [idSchema],
        derivationRules: [derivationRuleSchema]
    },
    datatype: StringType,
    datatypeNumber: datatypeNumberSchema,
    datatypeText: {
        minLength: Number,
        maxLength: Number,
        regex: StringType,
        rule: StringType,
        showAsTextArea: Boolean
    },
    datatypeDate: {
        precision: {
            type: StringType,
            enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second']
        }
    },
    datatypeDynamicCodeList: {
        system: StringType,
        code: StringType
    },
    unitsOfMeasure: [codeAndSystemSchema],
    required: {type: Boolean, default: false},
    invisible: {type: Boolean, default: false},
    editable: {type: Boolean, default: true},
    multiselect: Boolean,
    answers: {
        type: [permissibleValueSchema] // required to make optional
    },
    defaultAnswer: StringType
}, {_id: false});

let inFormSchema = new Schema({
    form: {
        tinyId: StringType,
        version: StringType,
        name: StringType,
        ids: [idSchema]
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
    tinyId: {type: StringType, index: true, description: 'Internal Form identifier'},
    designations: {
        type: [designationSchema],
        description: 'Any string used by which Form is known, addressed or referred to',
    },
    definitions: {
        type: [definitionSchema],
        description: 'Description of the Form',
        default: []
    },
    source: {type: StringType, description: 'This field is replaced with sources'},
    sources: {
        type: [sourceSchema],
        description: 'Name of system from which Form was imported or obtained from',
    },
    origin: {type: StringType, description: 'Name of system where Form is derived'},
    stewardOrg: {
        name: {
            type: StringType,
            description: 'Name of organization or entity responsible for supervising content and administration of Form'
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
    lastMigrationScript: StringType,
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
        description: 'Attribute not otherwise documented by structured Form record',
    },
    ids: {
        type: [idSchema],
        description: 'Identifier used to establish or indicate what Form is within a specific context',
    },
    attachments: [attachmentSchema],
    history: [Schema.Types.ObjectId],
    archived: {
        type: Boolean,
        default: false,
        index: true,
        description: 'Indication of historical record. True for previous versions.',
    },

    mapTo: {type: mapToSchema, default: undefined},
    isCopyrighted: Boolean,
    noRenderAllowed: Boolean,
    copyright: {
        authority: StringType,
        text: {type: StringType, default: ''}
    },
    formElements: [innerFormEltSchema],
    displayProfiles: [DisplayProfileSchema],
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

export const auditSchema = new Schema(eltLogSchema, {
    collection: 'formAudit',
    strict: false
});

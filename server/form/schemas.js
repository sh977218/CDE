const config = require('config');
const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const sharedSchemas = require('../system/schemas.js');

const instructionSchema = new Schema({
    value: StringType,
    valueFormat: StringType
}, {_id: false});

const datatypeNumberSchema = new Schema({
    minValue: Number
    , maxValue: Number
    , precision: Number
}, {_id: false});

const mapToSchema = new Schema({
    fhir: {
        resourceType: StringType,
    },
}, {_id: false});

const questionSchema = new Schema({
    cde: {
        tinyId: StringType
        , name: StringType
        , designations: [sharedSchemas.designationSchema]
        , definitions: [sharedSchemas.definitionSchema]
        , version: StringType
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
        , ids: [sharedSchemas.idSchema]
        , derivationRules: [sharedSchemas.derivationRuleSchema]
    }
    , datatype: StringType
    , datatypeNumber: datatypeNumberSchema
    , datatypeText: {
        minLength: Number
        , maxLength: Number
        , regex: StringType
        , rule: StringType
        , showAsTextArea: {type: Boolean, default: false}
    },
    datatypeDate: {
        precision: {
            type: StringType,
            enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
            default: 'Day',
        }
    }
    , unitsOfMeasure: [sharedSchemas.codeAndSystemSchema]
    , required: {type: Boolean, default: false}
    , invisible: {type: Boolean, default: false}
    , editable: {type: Boolean, default: true}
    , multiselect: Boolean
    , answers: [sharedSchemas.permissibleValueSchema]
    , defaultAnswer: StringType
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
        _id: false,
        elementType: {type: StringType, enum: ['section', 'question', 'form']},
        instructions: instructionSchema,
        inForm: {type: inFormSchema, default: undefined},
        label: StringType,
        mapTo: {type: mapToSchema, default: undefined},
        question: {type: questionSchema, default: undefined},
        repeat: StringType,
        repeatsFor: StringType,
        section: {type: new Schema({}, {_id: false}), default: undefined},
        showIfExpression: StringType,
        skipLogic: {
            action: {type: StringType, enum: ['show', 'enable']},
            condition: StringType,
        },
    };
}

let innerFormEltJson = getFormElementJson();
innerFormEltJson.formElements = [new Schema({}, {strict: false})];
let innerFormEltSchema = new Schema(innerFormEltJson, {_id: false});

for (let i = 0; i < config.modules.forms.sectionLevels; i++) {
    innerFormEltJson = getFormElementJson();
    innerFormEltJson.formElements = [innerFormEltSchema];
    innerFormEltSchema = new Schema(innerFormEltJson, {_id: false});
}

exports.formJson = {
    elementType: {type: StringType, default: 'form', enum: ['form']}
    , tinyId: {type: StringType, index: true}
    , designations: [sharedSchemas.designationSchema]
    , definitions: [sharedSchemas.definitionSchema]
    , mapTo: {type: mapToSchema, default: undefined}
    , stewardOrg: {
        name: StringType
    }
    , source: StringType
    , sources: [sharedSchemas.sourceSchema]
    , version: StringType
    , registrationState: sharedSchemas.registrationStateSchema
    , properties: [sharedSchemas.propertySchema]
    , ids: [
        {source: StringType, id: StringType, version: StringType, _id: false}
    ]
    , isCopyrighted: {type: Boolean}
    , noRenderAllowed: {type: Boolean}
    , copyright: {
        type: {
            authority: StringType
            , text: StringType
        },
        default: {text: null}
    }
    , origin: StringType
    , attachments: [sharedSchemas.attachmentSchema]
    , history: [Schema.Types.ObjectId]
    , changeNote: StringType
    , lastMigrationScript: StringType
    , created: Date
    , updated: Date
    , imported: Date
    , createdBy: {
        userId: Schema.Types.ObjectId
        , username: StringType
    }
    , updatedBy: {
        userId: Schema.Types.ObjectId
        , username: StringType
    }
    , formElements: [innerFormEltSchema]
    , archived: {type: Boolean, default: false, index: true}
    , classification: [sharedSchemas.classificationSchema]
    , displayProfiles: [{
        name: StringType
        , sectionsAsMatrix: {type: Boolean}
        , displayCopyright: {type: Boolean}
        , displayValues: {type: Boolean}
        , displayInstructions: {type: Boolean}
        , displayNumbering: {type: Boolean}
        , displayType: {type: StringType, enum: ['Dynamic', 'Follow-up'], default: 'Dynamic'}
        , metadata: {
            device: Boolean,
        }
        , numberOfColumns: {type: Number, min: 1, max: 6}
        , displayInvisible: {type: Boolean}
        , repeatFormat: {type: StringType, default: ''}
        , answerDropdownLimit: {type: Number, min: 0}
        , unitsOfMeasureAlias: [{unitOfMeasure: sharedSchemas.codeAndSystemSchema, alias: StringType}]
        , fhirProcedureMapping: {
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
        , _id: false
    }]
    , referenceDocuments: [sharedSchemas.referenceDocumentSchema]
};
exports.formSchema = new Schema(exports.formJson, {usePushEach: true});

exports.draftSchema = new Schema(exports.formJson, {
    sePushEach: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

exports.formSchema.path("classification").validate(v => {
    return !v.map(value => value.stewardOrg.name)
        .some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
}, "Duplicate Steward Classification");

exports.draftSchema.virtual('isDraft').get(function () {
    return true;
});
exports.formSchema.set('collection', 'forms');
exports.formSchema.index({tinyId: 1, archived: 1}, {
    unique: true,
    name: 'formLiveTinyId',
    partialFilterExpression: {archived: false}
});

exports.draftSchema.set('collection', 'formdrafts');

exports.formSourceSchema = new Schema(exports.formJson, {usePushEach: true});
exports.formSourceSchema.index({tinyId: 1, source: 1}, {unique: true});
exports.formSourceSchema.set('collection', 'formsources');

exports.auditSchema = new Schema(sharedSchemas.eltLogSchema, {strict: false});
exports.auditSchema.set('collection', 'formAudit');



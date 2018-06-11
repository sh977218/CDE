const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sharedSchemas = require('../system/schemas.js');
const config = require("config");

const instructionSchema = new Schema({
    value: sharedSchemas.stringType,
    valueFormat: sharedSchemas.stringType
}, {_id: false});

const datatypeNumberSchema = new Schema({
    minValue: Number
    , maxValue: Number
    , precision: Number
}, {_id: false});

const tagsSchema = new Schema({
    key: sharedSchemas.stringType,
    value: Schema.Types.Mixed,
}, {_id: false});

const questionSchema = new Schema({
    cde: {
        tinyId: sharedSchemas.stringType
        , name: sharedSchemas.stringType
        , designations: [sharedSchemas.designationSchema]
        , definitions: [sharedSchemas.definitionSchema]
        , version: sharedSchemas.stringType
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
        , ids: [sharedSchemas.idSchema]
        , derivationRules: [sharedSchemas.derivationRuleSchema]
    }
    , datatype: sharedSchemas.stringType
    , datatypeNumber: datatypeNumberSchema
    , datatypeText: {
        minLength: Number
        , maxLength: Number
        , regex: sharedSchemas.stringType
        , rule: sharedSchemas.stringType
        , showAsTextArea: {type: Boolean, default: false}
    }, datatypeDate: {
        precision: Object.assign({
            enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
            default: 'Day'
        }, sharedSchemas.stringType)
    }
    , unitsOfMeasure: [sharedSchemas.codeAndSystemSchema]
    , required: {type: Boolean, default: false}
    , invisible: {type: Boolean, default: false}
    , editable: {type: Boolean, default: true}
    , multiselect: Boolean
    , answers: [sharedSchemas.permissibleValueSchema]
    , defaultAnswer: sharedSchemas.stringType
}, {_id: false});

let inFormSchema = new Schema({
    form: {
        tinyId: sharedSchemas.stringType,
        version: sharedSchemas.stringType,
        name: sharedSchemas.stringType,
        ids: [sharedSchemas.idSchema]
    }
}, {_id: false});

function getFormElementJson() {
    return {
        _id: false,
        elementType: Object.assign({enum: ['section', 'question', 'form']}, sharedSchemas.stringType),
        instructions: instructionSchema,
        inForm: {type: inFormSchema, default: undefined},
        label: sharedSchemas.stringType,
        question: {type: questionSchema, default: undefined},
        repeat: sharedSchemas.stringType,
        repeatsFor: sharedSchemas.stringType,
        section: {type: new Schema({}, {_id: false}), default: undefined},
        showIfExpression: sharedSchemas.stringType,
        skipLogic: {
            action: Object.assign({enum: ['show', 'enable']}, sharedSchemas.stringType),
            condition: sharedSchemas.stringType,
        },
        tags: [{type: tagsSchema}],
    };
}

let innerFormEltJson = getFormElementJson();
innerFormEltJson.formElements = [new mongoose.Schema({}, {strict: false})];
let innerFormEltSchema = new Schema(innerFormEltJson, {_id: false});

for (let i = 0; i < config.modules.forms.sectionLevels; i++) {
    innerFormEltJson = getFormElementJson();
    innerFormEltJson.formElements = [innerFormEltSchema];
    innerFormEltSchema = new Schema(innerFormEltJson, {_id: false});
}

exports.formJson = {
    elementType: Object.assign({default: 'form', enum: ['form']}, sharedSchemas.stringType)
    , tinyId: Object.assign({index: true}, sharedSchemas.stringType)
    , designations: [sharedSchemas.designationSchema]
    , definitions: [sharedSchemas.definitionSchema]
    , stewardOrg: {
        name: sharedSchemas.stringType
    }
    , source: sharedSchemas.stringType
    , sources: [sharedSchemas.sourceSchema]
    , tags: [{type: tagsSchema}]
    , version: sharedSchemas.stringType
    , registrationState: sharedSchemas.registrationStateSchema
    , properties: [sharedSchemas.propertySchema]
    , ids: [
        {source: sharedSchemas.stringType, id: sharedSchemas.stringType, version: sharedSchemas.stringType, _id: false}
    ]
    , isCopyrighted: {type: Boolean}
    , noRenderAllowed: {type: Boolean}
    , copyright: {
        type: {
            authority: sharedSchemas.stringType
            , text: sharedSchemas.stringType
        },
        default: {text: null}
    }
    , origin: sharedSchemas.stringType
    , attachments: [sharedSchemas.attachmentSchema]
    , comments: [sharedSchemas.commentSchema]
    , history: [mongoose.Schema.Types.ObjectId]
    , changeNote: sharedSchemas.stringType
    , lastMigrationScript: sharedSchemas.stringType
    , created: Date
    , updated: Date
    , imported: Date
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: sharedSchemas.stringType
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: sharedSchemas.stringType
    }
    , formElements: [innerFormEltSchema]
    , archived: {type: Boolean, default: false, index: true}
    , classification: [sharedSchemas.classificationSchema]
    , displayProfiles: [{
        name: sharedSchemas.stringType
        , sectionsAsMatrix: {type: Boolean}
        , displayCopyright: {type: Boolean}
        , displayValues: {type: Boolean}
        , displayInstructions: {type: Boolean}
        , displayNumbering: {type: Boolean}
        , displayType: Object.assign({enum: ['Dynamic', 'Follow-up'], default: 'Dynamic'}, sharedSchemas.stringType)
        , metadata: {
            device: Boolean,
        }
        , numberOfColumns: {type: Number, min: 1, max: 6}
        , displayInvisible: {type: Boolean}
        , repeatFormat: Object.assign({default: ''}, sharedSchemas.stringType)
        , answerDropdownLimit: {type: Number, min: 0}
        , unitsOfMeasureAlias: [{unitOfMeasure: sharedSchemas.codeAndSystemSchema, alias: sharedSchemas.stringType}]
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
exports.draftSchema.virtual('isDraft').get(function () {
    return true;
});
exports.formSchema.set('collection', 'forms');
exports.draftSchema.set('collection', 'formdrafts');


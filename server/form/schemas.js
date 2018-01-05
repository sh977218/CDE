const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sharedSchemas = require('../system/schemas.js');
const config = require("config");

const instructionSchema = new Schema({value: String, valueFormat: String}, {_id: false});

const questionSchema = new Schema({
    cde: {
        tinyId: String
        , name: String
        , version: String
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
        , ids: [sharedSchemas.idSchema]
        , derivationRules: [sharedSchemas.derivationRuleSchema]
    }
    , datatype: String
    , datatypeNumber: {
        minValue: Number
        , maxValue: Number
        , precision: Number
    }
    , datatypeText: {
        minLength: Number
        , maxLength: Number
        , regex: String
        , rule: String
        , showAsTextArea: {type: Boolean, default: false}
    }, datatypeDate: {
        format: String
    }
    , uoms: [String]
    , required: {type: Boolean, default: false}
    , invisible: {type: Boolean, default: false}
    , editable: {type: Boolean, default: true}
    , multiselect: Boolean
    , answers: [sharedSchemas.permissibleValueSchema]
    , defaultAnswer: String
}, {_id: false});

let inFormSchema = new Schema({
    form: {
        tinyId: String,
        version: String,
        name: String,
        ids: [sharedSchemas.idSchema]
    }
}, {_id: false});

function getFormElementJson() {
    return {
        _id: false,
        elementType: {type: String, enum: ['section', 'question', 'form']},
        instructions: instructionSchema,
        inForm: {type: inFormSchema, default: undefined},
        label: String,
        question: {type: questionSchema, default: undefined},
        repeat: String,
        repeatsFor: String,
        section: {type: new Schema({}, {_id: false}), default: undefined},
        showIfExpression: String,
        skipLogic: {
            action: {type: String, enum: ['show', 'enable']},
            condition: String,
        }
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
    elementType: {type: String, default: 'form', enum: ['form']}
    , tinyId: {type: String, index: true}
    , naming: [sharedSchemas.namingSchema]
    , stewardOrg: {
        name: String
    }
    , source: String
    , sources: [sharedSchemas.sourceSchema]
    , version: String
    , registrationState: sharedSchemas.registrationStateSchema
    , properties: [sharedSchemas.propertySchema]
    , ids: [
        {source: String, id: String, version: String, _id: false}
    ]
    , isCopyrighted: {type: Boolean}
    , noRenderAllowed: {type: Boolean}
    , copyright: {
        type: {
            authority: String
            , text: String
        },
        default: {text: null}
    }
    , origin: String
    , attachments: [sharedSchemas.attachmentSchema]
    , comments: [sharedSchemas.commentSchema]
    , history: [mongoose.Schema.Types.ObjectId]
    , changeNote: String
    , lastMigrationScript: String
    , created: Date
    , updated: Date
    , imported: Date
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , formElements: [innerFormEltSchema]
    , archived: {type: Boolean, default: false, index: true}
    , classification: [sharedSchemas.classificationSchema]
    , displayProfiles: [{
        name: String
        , sectionsAsMatrix: {type: Boolean}
        , displayCopyright: {type: Boolean}
        , displayValues: {type: Boolean}
        , displayInstructions: {type: Boolean}
        , displayNumbering: {type: Boolean}
        , displayType: {type: String, enum: ['Dynamic', 'Follow-up'], default: 'Dynamic'}
        , numberOfColumns: {type: Number, min: 1, max: 6}
        , displayInvisible: {type: Boolean}
        , repeatFormat: {type: String, default: ''}
        , _id: false
    }]
    , referenceDocuments: [sharedSchemas.referenceDocumentSchema]
};

exports.formSchema = new Schema(exports.formJson);
exports.draftSchema = new Schema(exports.formJson, {
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


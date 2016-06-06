var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    , config = require("config")
    ;

var questionSchema = {
    cde: {
        tinyId: String
        , name: String
        , version: String
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
        , ids: [sharedSchemas.idSchema]
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
    }
    , uoms: [String]
    , required: {type: Boolean, default: false}
    , editable: {type: Boolean, default: true}
    , multiselect: Boolean
    , answers: [sharedSchemas.permissibleValueSchema]
    , defaultAnswer: String
};

var sectionSchema = {};

var formSchema = {};

var cardinalitySchema = {
    min: Number,
    max: Number
};

var formElementTreeRoot = {
    elementType: {type: String, enum: ['section', 'question', 'form']}
    , label: String
    , instructions: sharedSchemas.instructionSchema
    , cardinality: cardinalitySchema
    , repeatsFor: String
    , showIfExpression: String
    , section: sectionSchema
    , question: questionSchema
    , form: formSchema
    , formElements: []
    , skipLogic: {
        action: {type: String, enum: ['show', 'enable']}
        , condition: String
    },
    _id: false
};
var currentLevel = formElementTreeRoot.formElements;
for (var i = 0; i < config.modules.forms.sectionLevels; i++) {
    currentLevel.push({
        elementType: {type: String, enum: ['section', 'question']}
        , label: String
        , hideLabel: {type: Boolean, default: false}
        , instructions: sharedSchemas.instructionSchema
        , cardinality: cardinalitySchema
        , repeatsFor: String
        , showIfExpression: String
        , section: sectionSchema
        , question: questionSchema
        , form: formSchema
        , formElements: []
        , skipLogic: {
            action: {type: String, enum: ['show', 'enable']}
            , condition: String
        },
        _id: false
    });
    currentLevel = currentLevel[0].formElements;
}
currentLevel.push(new mongoose.Schema({}, {strict: false}));

var formElementSchema = new Schema(formElementTreeRoot, {_id: false});

exports.formSchema = new Schema({
    tinyId: String
    , naming: [sharedSchemas.namingSchema]
    , stewardOrg: {
        name: String
    }
    , source: String
    , version: String
    , registrationState: sharedSchemas.registrationStateSchema
    , properties: [sharedSchemas.propertySchema]
    , ids: [
        {source: String, id: String, version: String, _id: false}
    ]
    , isCopyrighted: {type: Boolean}
    , noRenderAllowed: {type: Boolean}
    , copyright: {
        authority: String
        , text: String
    }
    , origin: String
    , attachments: [sharedSchemas.attachmentSchema]
    , comments: [sharedSchemas.commentSchema]
    , history: [mongoose.Schema.Types.ObjectId]
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
    , formElements: [formElementSchema]
    , archived: Boolean
    , classification: [sharedSchemas.classificationSchema]
    , displayProfiles: [{
        name: String
        , sectionsAsMatrix: {type: Boolean}
        , displayValues: {type: Boolean}
        , context: {contextName: String}
        , _id: false
    }]
    , referenceDocuments: [sharedSchemas.referenceDocumentSchema]
});

exports.formSchema.set('collection', 'forms');


var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    , config = require("config")
    ;

var questionSchema = {
    cde: {
        tinyId: String
        , version: String
        , permissibleValues: [sharedSchemas.permissibleValueSchema]
    }
    , cdeName: String
    , datatype: String
    , datatypeNumber: {
        minValue: Number
        , maxValue: Number
        , precision: Number
    }
    , uoms: [String]
    , required: {type: Boolean, default: false}
    , editable: {type: Boolean, default: true}
    , multiselect: Boolean
    , answers: [sharedSchemas.permissibleValueSchema]
};

var sectionSchema = {};

var formElementTreeRoot = {
    elementType: {type: String, enum: ['section', 'question']}
    , label: String
    , instructions: String
    , cardinality: String
    , repeatsFor: String
    , showIfExpression: String
    , section: sectionSchema
    , question: questionSchema
    , formElements: []
    , skipLogic: {
        action: {type: String, enum: ['show', 'enable']}
        , condition: String
    }
};
var currentLevel = formElementTreeRoot.formElements;
for (var i = 0; i < config.modules.forms.sectionLevels; i++) {
    currentLevel.push({
        elementType: {type: String, enum: ['section', 'question']}
        , label: String
        , instructions: String
        , cardinality: {
            min: String,
            max: String
        }
        , repeatsFor: String
        , showIfExpression: String
        , section: sectionSchema
        , question: questionSchema
        , formElements: []
        , skipLogic: {
            action: {type: String, enum: ['show', 'enable']}
            , condition: String
        }
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
    , version: String
    , registrationState: sharedSchemas.registrationStateSchema
    , properties: [
        {key: String, value: String, valueFormat: String, _id: false}
    ]
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
    , formElements: [formElementSchema]
    , archived: Boolean
    , classification: [sharedSchemas.classificationSchema]
    , displayProfiles: [{
        name: String
        , sectionsAsMatrix: {type: Boolean}
        , displayValues: {type: Boolean}
        , context: {contextName: String}
    }]
    , referenceDocuments: [sharedSchemas.referenceDocumentSchema]
});

exports.formSchema.set('collection', 'forms');


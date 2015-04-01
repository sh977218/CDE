var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    , config = require("config")
    ;

var questionSchema =  {
    cde: {tinyId: String, version: String}
    , datatype: String
    , uoms: [String]
    , required: Boolean
    , multiselect: Boolean
    , otherPleaseSpecify: {
        value: {type: Boolean, default: false}
    }
    , answers: [sharedSchemas.permissibleValueSchema]
};

var sectionSchema = {    

};

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
    });
    currentLevel = currentLevel[0].formElements;
}
currentLevel.push(new mongoose.Schema({}, {strict: false}));

var formElementSchema = new Schema(formElementTreeRoot, {_id: false});


//var formElementSchema = new Schema({
//    elementType: {type: String, enum: ['section', 'question']}
//    , label: String
//    , instructions: String
//    , cardinality: String
//    , repeatsFor: String
//    , showIfExpression: String
//    , section: sectionSchema
//    , question: questionSchema
//    , formElements: [formElementSchema]
//    , skipLogic: {
//        action: {type: String, enum: ['show', 'enable']}
//        , condition: String
//    }
//}, {_id: false});


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
    , isCopyrighted: {type: Boolean, default: false}
    , copyright: {
        authority: String
        , text: String
    }
    , origin: String
    , attachments: [sharedSchemas.attachmentSchema]
    , comments: [sharedSchemas.commentSchema]
    , history: [mongoose.Schema.Types.ObjectId]
    , created: Date
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , formElements: [formElementSchema]
    , archived: Boolean
    , classification: [sharedSchemas.classificationSchema]
});

exports.formSchema.set('collection', 'forms');


var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

var questionSchema =  {
    cde: {tinyId: String, version: String}
    , datatype: String
    , uoms: [String]
    , required: Boolean
    , multiselect: Boolean
};

var sectionSchema = {
};

var formElementSchema = new Schema({
    label: String
    , instructions: String
    , cardinality: String
    , repeatsFor: String
    , showIfExpression: String
    , section: sectionSchema
    , question: questionSchema
    , formElements: [formElementSchema]
}, {_id: false});

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
    , copyright: {
        authority: String
        , type: String
        , text: String
    }
    , origin: String
    , attachments: [sharedSchemas.attachmentSchema]
    , comments: [sharedSchemas.commentSchema]
    , history: [mongoose.ObjectId]
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


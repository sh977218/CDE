var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

var sectionSchema = new Schema({
    title: String
    , cardinality: String
}, {_id: false});

exports.formSchema = new Schema({
    uuid: String
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
    , sections: [sectionSchema]
    , archived: Boolean
});

exports.formSchema.set('collection', 'forms');


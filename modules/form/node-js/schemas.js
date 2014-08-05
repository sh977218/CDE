var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

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
});

exports.formSchema.set('collection', 'forms');


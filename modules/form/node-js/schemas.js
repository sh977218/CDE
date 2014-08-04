var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , sharedSchemas = require('../../system/node-js/schemas.js')
    ;

exports.formSchema = new Schema({
    naming: [sharedSchemas.namingSchema]     
    , version: String
    , registrationState: sharedSchemas.registrationStateSchema
    , properties: [
        {key: String, value: String, valueFormat: String, _id: false}
    ]  
    , copyright: {
        authority: String
        , type: String
        , text: String
    }
    , attachments: [sharedSchemas.attachmentSchema]
});

exports.formSchema.set('collection', 'forms');


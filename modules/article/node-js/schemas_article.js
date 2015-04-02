var mongoose = require('mongoose')
    , sharedSchemas = require('../../system/node-js/schemas.js')
;

var schemas = {};

schemas.articleSchema = mongoose.Schema({
    key: {type: String, index: true}
    , title: String
    , body: String
    , created: Date
    , updated: Date
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    } 
    , attachments: [sharedSchemas.attachmentSchema]
    , history: [mongoose.Schema.Types.ObjectId]
    , archived: Boolean
});

schemas.articleSchema.set('collection', 'articles');

module.exports = schemas;


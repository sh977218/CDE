var mongoose = require('mongoose')
    , ObjectId = require('mongodb').ObjectId
    , sharedSchemas = require('../../system/node-js/schemas.js')
;

var schemas = {};

schemas.articleSchema = mongoose.Schema({
    key: String
    , title: String
    , body: String
    , createdBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , updatedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    } 
    , attachments: [sharedSchemas.attachmentSchema]
});

schemas.articleSchema.set('collection', 'articles');

module.exports = schemas;


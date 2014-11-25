var mongoose = require('mongoose')
    , ObjectId = require('mongodb').ObjectId
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
});

schemas.articleSchema.set('collection', 'articles');

module.exports = schemas;


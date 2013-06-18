var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;

var schemas = {};

var conceptSchema = mongoose.Schema({
    name: String,
    origin: String,
    originId: String
}, {_id: false});

var permissibleValueSchema = mongoose.Schema({
    validValue: String
    , valueCode: String
    , codeSystemName: String
}, {_id: false});

var alternateNameSchema = mongoose.Schema({
    value: String
    , type: String
    , language: String
    , owningContext: String
}, {_id: false});

var deJsonSchema = {
    uuid: String
    , preferredName: String
    , name: String
    , definition: String
    , origin: String
    , originId: String
    , owningContext: String
    , created: Date
    , updated: Date
    , version: String
    , objectClass: {concepts: [conceptSchema]}
    , property:{concepts: [conceptSchema]}
    , valueDomain: {
        preferredName: String
        , name: String
        , definition: String
        , vsacOid: String
        , permissibleValues: [permissibleValueSchema]
    }
    , history: [ObjectId]
    , changeNote: String
    , alternateNames: [alternateNameSchema]
    , workflowStatus: String
};

var questionSchema = mongoose.Schema ({
    value: String
    , instructions: String
    , cde_uuid: String
}, {_id: false});

var formSchema = {
    name: String
    , instructions: String
    , status: String
    , owningContext: String
    , updated: Date
    , created: Date
    , questions: [questionSchema]
};

schemas.userSchema = mongoose.Schema ({
    username: String
    , password: String
    , contextAdmin: [String]
    , formCart: [String]
    , nlmAdmin: Boolean
});


schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 
schemas.dataElementSchema.set('collection', 'dataelements');

schemas.dataElementArchiveSchema = mongoose.Schema(deJsonSchema);
schemas.dataElementArchiveSchema.set('collection', 'dataelements_archive');

schemas.formSchema = mongoose.Schema(formSchema);
schemas.formSchema.set('collection', 'forms');

schemas.userSchema.set('collection', 'users');

module.exports = schemas;

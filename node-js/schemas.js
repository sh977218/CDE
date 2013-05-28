var mongoose = require('mongoose');

var ObjectId = require('mongodb').ObjectId;


var permissibleValueSchema = mongoose.Schema({
    validValue: String
    , valueCode: String
    , codeSystemName: String
}, {_id: false});

var deJsonSchema = {
    uuid: String
    , preferredName: String
    , longName: String
    , preferredDefinition: String
    , origin: String
    , originId: String
    , owningContext: String
    , created: Date
    , updated: Date
    , valueDomain: {
        preferredName: String
        , longName: String
        , preferredDefinition: String
        , vsacOid: String
        , permissibleValues: [permissibleValueSchema]
    }
    , history: [ObjectId]
    , changeNote: String
};


var formSchema = {
    name: String
    , instructions: String
    , status: String
    , owningContext: String
    , updated: Date
    , created: Date
};

var schemas = {};

schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 
schemas.dataElementSchema.set('collection', 'dataelements');

schemas.dataElementArchiveSchema = mongoose.Schema(deJsonSchema);
schemas.dataElementArchiveSchema.set('collection', 'dataelements_archive');

schemas.formSchema = mongoose.Schema(formSchema);
schemas.formSchema.set('collection', 'forms');

module.exports = schemas;

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

var commentSchema = mongoose.Schema({
    text: String
    , user: String
    , username: String
    , created: Date
});

var namingSchema = mongoose.Schema({
    designation: String
    , definition: String
}, {_id: false});

var languageSchema = mongoose.Schema({
    languageCode: String
    , preferredNaming: {
        designation: String
        , definition: String
    }
    , otherNaming: [namingSchema] 
}, {_id: false});

var contextSchema = mongoose.Schema({
    contextName: String
    ,languages: [languageSchema]
}, {_id: false}); 

var deJsonSchema = {
    naming:[namingSchema]         
    , name: String
    , definition: String
    , origin: String
    , originId: String
    , registeringAuthority: {
        name: String
    }
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
    , publicID: String
    , version: String
    , objectClass: {concepts: [conceptSchema]}
    , property:{concepts: [conceptSchema]}
    , valueDomain: {
        name: String
        , definition: String
        , vsacOid: String
        , permissibleValues: [permissibleValueSchema]
    }
    , history: [ObjectId]
    , changeNote: String
    , registrationStatus: String
    , formUsageCounter: Number
    , comments: [commentSchema]
    , archived: Boolean
};

var questionSchema = mongoose.Schema ({
    value: String
    , instructions: String
    , dataElement: {
        description: String
        , de_uuid: String
    }
}, {_id: false});

var moduleSchema = mongoose.Schema ({
    name: String
    , questions: [questionSchema]
}, {_id: false});

var formSchema = {
    name: String
    , instructions: String
    , registrationStatus: String
    , registeringAuthority: {
        name: String
    }
    , updated: Date
    , created: Date
    , modules: [moduleSchema]
};

schemas.userSchema = mongoose.Schema ({
    username: String
    , password: String
    , regAuthAdmin: [String]
    , regAuthCurator: [String]
    , formCart: [String]
    , siteAdmin: Boolean
});

schemas.regAuthSchema = mongoose.Schema ({
    name: String
});

schemas.managedContextSchema = mongoose.Schema ({
   name: String 
});

schemas.dataElementSchema = mongoose.Schema(deJsonSchema); 

schemas.formSchema = mongoose.Schema(formSchema);

schemas.dataElementSchema.set('collection', 'dataelements');
schemas.formSchema.set('collection', 'forms');
schemas.userSchema.set('collection', 'users');
schemas.regAuthSchema.set('collection', 'regAuths');

module.exports = schemas;

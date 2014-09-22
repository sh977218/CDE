var mongoose = require('mongoose');

var schemas = {};



var csEltSchema = mongoose.Schema({
    name: String
    , elements: [csEltSchema]
}, {_id: false});

exports.classificationSchema = mongoose.Schema({
    stewardOrg: {name: String}
    , elements: [csEltSchema]
}, {_id: false});

schemas.orgSchema = mongoose.Schema ({
    name: String
    , longName: String
    , mailAddress: String
    , emailAddress: String
    , phoneNumber: String
    , uri: String
    , classifications: [csEltSchema]
});

schemas.userSchema = mongoose.Schema ({
    username: String
    , email: String
    , password: String
    , lastLogin: Date
    , lockCounter: Number
    , orgAdmin: [String]
    , orgCurator: [String]
    , siteAdmin: Boolean
    , quota: Number
    , viewHistory: [String]
    , knownIPs: [String]
});

schemas.orgSchema.set('collection', 'orgs');
schemas.userSchema.set('collection', 'users');

schemas.namingSchema = mongoose.Schema({
    designation: String
    , definition: String
    , definitionFormat: String
    , languageCode: String
    , context: {
        contextName: String
        , acceptability: String
    }
}, {_id: false});

schemas.attachmentSchema = mongoose.Schema({
    fileid: String
    , filename: String
    , filetype: String
    , uploadDate: Date
    , comment: String
    , uploadedBy: {
        userId: mongoose.Schema.Types.ObjectId
        , username: String
    }
    , filesize: Number
    , isDefault: Boolean
}, {_id: false});

schemas.registrationStateSchema = {
    registrationStatus: String
    , effectiveDate: Date
    , untilDate: Date
    , administrativeNote: String
    , unresolvedIssue: String
    , administrativeStatus: String
    , replacedBy: {tinyId: String} 
    , _id: false
};

var commentSchema = mongoose.Schema({
    text: String
    , user: String
    , username: String
    , created: Date
});


module.exports = schemas;
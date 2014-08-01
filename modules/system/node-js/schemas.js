var mongoose = require('mongoose');

var schemas = {};

var csEltSchema = mongoose.Schema({
    name: String
    , elements: [csEltSchema]
}, {_id: false});

schemas.orgSchema = mongoose.Schema ({
    name: String
    , longName: String
    , classifications: [csEltSchema]
});

schemas.userSchema = mongoose.Schema ({
    username: String
    , password: String
    , lastLogin: Date
    , lockCounter: Number
    , orgAdmin: [String]
    , orgCurator: [String]
    , siteAdmin: Boolean
    , quota: Number
    , viewHistory: [mongoose.Schema.Types.ObjectId]
    , knownIPs: [String]
});

schemas.orgSchema.set('collection', 'orgs');
schemas.userSchema.set('collection', 'users');

module.exports = schemas;
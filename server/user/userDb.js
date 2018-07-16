const Schema = require('mongoose').Schema;
const stringType = require('../system/schemas').stringType;
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

exports.userSchema = new Schema({
    username: Object.assign({unique: true}, stringType),
    email: stringType,
    password: stringType,
    lastLogin: Date,
    notificationDate: {
        serverLogDate: Date,
        clientLogDate: Date
    },
    lockCounter: Number,
    orgAdmin: [stringType],
    orgCurator: [stringType],
    siteAdmin: Boolean,
    quota: Number,
    viewHistory: [stringType],
    formViewHistory: [stringType],
    knownIPs: [stringType],
    roles: [Object.assign({enum: authorizationShared.rolesEnum}, stringType)],
    searchSettings: {
        version: Number,
        defaultSearchView: Object.assign({enum: ["accordion", "table", "summary"]}, stringType),
        lowestRegistrationStatus: stringType,
        tableViewFields: {
            name: {type: Boolean, default: true},
            naming: Boolean,
            questionTexts: Boolean,
            permissibleValues: Boolean,
            pvCodeNames: Boolean,
            nbOfPVs: Boolean,
            uom: Boolean,
            stewardOrg: Boolean,
            usedBy: Boolean,
            registrationStatus: Boolean,
            administrativeStatus: Boolean,
            ids: Boolean,
            identifiers: [stringType],
            source: Boolean,
            updated: Boolean,
            numQuestions: Boolean,
            tinyId: Boolean,
            linkedForms: Boolean
        }
    },
    accessToken: stringType,
    refreshToken: stringType,
    avatarUrl: stringType,
    publishedForms: [{
        name: stringType,
        id: Schema.Types.ObjectId
    }]
}, {usePushEach: true});

const User = conn.model('User', exports.userSchema);

exports.User = User;

exports.byId = (id, callback) => {
    User.findById(id, {password: 0}, callback);
};

exports.updateUser = (id, fields, callback) => {
    let update = {};
    if (fields.email) update.email = fields.email;
    if (fields.searchSettings) update.searchSettings = fields.searchSettings;
    if (fields.publishedForms) update.email = fields.publishedForms;
    User.update({_id: id}, {$set: update}, callback);
};
exports.avatarByUsername = (username, callback) => {
    User.findOne({'username': new RegExp('^' + username + '$', "i")}, {avatarUrl: 1}, callback);
};

exports.usersByUsername = (username, callback) => {
    User.find({'username': new RegExp(username, 'i')}, {password: 0}, callback);
};

exports.byUsername = (username, callback) => {
    User.findOne({username: username}, callback);
};

exports.save = (user, callback) => {
    new User(user).save(callback);
};



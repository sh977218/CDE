const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

let notificationTypesSchema = {
    drawer: Boolean,
    push: Boolean,
};

let userSchema = new Schema({
    username: {type: StringType, unique: true},
    commentNotifications: [{
        date: Date,
        eltModule: {type: StringType, enum: ['board', 'cde', 'form']},
        eltTinyId: StringType,
        read: Boolean,
        text: StringType,
        username: StringType,
    }],
    email: StringType,
    password: StringType,
    lastLogin: Date,
    notificationDate: {
        serverLogDate: Date,
        clientLogDate: Date
    },
    lockCounter: Number,
    notificationSettings: {
        approvalAttachment: notificationTypesSchema,
        approvalComment: notificationTypesSchema,
        comment: notificationTypesSchema,
    },
    orgAdmin: [StringType],
    orgCurator: [StringType],
    siteAdmin: Boolean,
    quota: Number,
    viewHistory: [StringType],
    formViewHistory: [StringType],
    knownIPs: [StringType],
    roles: [{type: StringType, enum: authorizationShared.rolesEnum}],
    searchSettings: {
        version: Number,
        defaultSearchView: {type: StringType, enum: ["accordion", "table", "summary"]},
        lowestRegistrationStatus: StringType,
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
            identifiers: [StringType],
            source: Boolean,
            updated: Boolean,
            numQuestions: Boolean,
            tinyId: Boolean,
            linkedForms: Boolean
        }
    },
    accessToken: StringType,
    refreshToken: StringType,
    avatarUrl: StringType,
    publishedForms: [{
        name: StringType,
        id: Schema.Types.ObjectId
    }]
}, {usePushEach: true});

exports.userRefSchema = {
    _id: Schema.Types.ObjectId,
    username: {type: StringType, index: true}
};

// remove this once all formEditor roles have been removed.
userSchema.pre('validate', function (next) {
    let doc = this;
    let formEditorIndex = doc.roles.indexOf("FormEditor");
    if (formEditorIndex > -1) {
        doc.roles.splice(formEditorIndex, 1);
    }
    next();
});

const User = conn.model('User', userSchema);

exports.User = User;

const userProject = {password: 0};

exports.byId = (id, callback) => {
    User.findById(id, userProject, callback);
};

exports.find = (crit, cb) => {
    User.find(crit, cb);
};

// cb(err, {nMatched, nUpserted, nModified})
exports.updateUser = (user, fields, callback) => {
    let update = {};
    if (fields.commentNotifications) update.commentNotifications = fields.commentNotifications;
    if (fields.email) update.email = fields.email;
    if (fields.notificationSettings) {
        if (fields.notificationSettings.approvalAttachment && !authorizationShared.hasRole(user, 'AttachmentReviewer')) {
            delete fields.notificationSettings.approvalAttachment;
        }
        if (fields.notificationSettings.approvalComment && !authorizationShared.hasRole(user, 'CommentReviewer')) {
            delete fields.notificationSettings.approvalComment;
        }
        if (fields.notificationSettings.approvalAttachment
            || fields.notificationSettings.approvalComment
            || fields.notificationSettings.comment) {
            update.notificationSettings = fields.notificationSettings;
        }
    }
    if (fields.searchSettings) update.searchSettings = fields.searchSettings;
    if (fields.publishedForms) update.publishedForms = fields.publishedForms;
    User.updateOne({_id: user._id}, {$set: update}, callback);
};
exports.avatarByUsername = (username, callback) => {
    User.findOne({'username': new RegExp('^' + username + '$', "i")}, {avatarUrl: 1}, callback);
};

exports.usersByUsername = (username, callback) => {
    User.find({'username': new RegExp(username, 'i')}, userProject, callback);
};
exports.userByUsername = (username, callback) => {
    User.findOne({'username': new RegExp(username, 'i')}, userProject, callback);
};

exports.byUsername = (username, callback) => {
    User.findOne({username: username}, userProject, callback);
};

exports.save = (user, callback) => {
    new User(user).save(callback);
};


// Site Admin
exports.usernamesByIp = (ip, callback) => {
    User.find({"knownIPs": {$in: [ip]}}, {username: 1}, callback);
};

exports.siteAdmins = callback => {
    User.find({'siteAdmin': true}, 'username email', callback);
};

exports.orgAuthorities = callback => {
    User.find({'roles': 'OrgAuthority'}, 'username', callback);
};




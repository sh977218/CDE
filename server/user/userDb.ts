import * as mongoose from 'mongoose';
import { config } from '../../server/system/parseConfig';
import { hasRole, rolesEnum } from '../../shared/system/authorizationShared';
import { addStringtype } from '../../server/system/mongoose-stringtype';
import { CbError } from '../../shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

let notificationTypesSchema = new Schema({
    drawer: Boolean,
    push: Boolean,
}, {_id: false});

let CommentNotificationSchema = new Schema({
    date: Date,
    eltModule: {type: StringType, enum: ['board', 'cde', 'form']},
    eltTinyId: StringType,
    read: Boolean,
    text: StringType,
    username: StringType,
}, {_id: false});

let publishedFormSchema = new Schema({
    name: StringType,
    id: Schema.Types.ObjectId
}, {_id: false});

let userSchema = new Schema({
    username: {type: StringType, lowercase: true, trim: true, unique: true},
    commentNotifications: [CommentNotificationSchema],
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
    roles: [{type: StringType, enum: rolesEnum}],
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
    publishedForms: [publishedFormSchema]
}, {usePushEach: true});

export const userRefSchema = {
    _id: Schema.Types.ObjectId,
    username: {type: StringType, index: true}
};

export const User = conn.model('User', userSchema);

const userProject = {password: 0};

export function byId(id, callback) {
    User.findById(id, userProject).exec(callback);
}

export function find(crit, cb) {
    User.find(crit, cb);
}

// cb(err, {nMatched, nUpserted, nModified})
export function updateUser(user, fields, callback: CbError<number, number, number>) {
    let update: any = {};
    if (fields.commentNotifications) update.commentNotifications = fields.commentNotifications;
    if (fields.email) update.email = fields.email;
    if (fields.notificationSettings) {
        if (fields.notificationSettings.approvalAttachment && !hasRole(user, 'AttachmentReviewer')) {
            delete fields.notificationSettings.approvalAttachment;
        }
        if (fields.notificationSettings.approvalComment && !hasRole(user, 'CommentReviewer')) {
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
}

export function usersByUsername(username, callback) {
    User.find({'username': new RegExp(username, 'i')}, userProject, callback);
}

export function userByUsername(username, callback) {
    User.findOne({'username': new RegExp(username, 'i')}, userProject, callback);
}

export function byUsername(username, callback) {
    User.findOne({username: username}, userProject, callback);
}

export function save(user, callback) {
    new User(user).save(callback);
}


// Site Admin
export function usernamesByIp(ip, callback) {
    User.find({"knownIPs": {$in: [ip]}}, {username: 1}, callback);
}

export function siteAdmins(callback) {
    User.find({'siteAdmin': true}, 'username email', callback);
}

export function orgAuthorities(callback) {
    User.find({'roles': 'OrgAuthority'}, 'username', callback);
}
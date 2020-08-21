import * as mongoose from 'mongoose';
import { Document, Model, Query } from 'mongoose';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { config } from 'server/system/parseConfig';
import { hasRole, rolesEnum } from 'shared/system/authorizationShared';
import { CbError, CbError1, ModuleAll, User } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);

export interface CommentNotification {
    date: Date;
    eltModule: ModuleAll;
    eltTinyId: string;
    read: boolean;
    text?: string;
    username: string;
}

export interface UserFull extends User {
    commentNotifications: CommentNotification[];
    lastLogin: Date | number;
    lockCounter: number;
    knownIPs: string[];
    notificationDate: {
        serverLogDate: Date | number,
        clientLogDate: Date | number
    };
    password: string;
}

const notificationTypesSchema = new Schema({
    drawer: Boolean,
    push: Boolean,
}, {_id: false});

const commentNotificationSchema = new Schema({
    date: Date,
    eltModule: {type: StringType, enum: ['board', 'cde', 'form']},
    eltTinyId: StringType,
    read: Boolean,
    text: StringType,
    username: StringType,
}, {_id: false});

const publishedFormSchema = new Schema({
    name: StringType,
    id: Schema.Types.ObjectId
}, {_id: false});

const userSchema = new Schema({
    username: {type: StringType, lowercase: true, trim: true, unique: true},
    commentNotifications: [commentNotificationSchema],
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
        defaultSearchView: {type: StringType, enum: ['accordion', 'table', 'summary']},
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
export type UserDocument = Document & UserFull;
export const userModel: Model<UserDocument> = conn.model('User', userSchema);

const userProject = {password: 0};

export function addUser(user: Omit<User, '_id'>, callback: CbError1<UserDocument>) {
    user.username = user.username.toLowerCase();
    new userModel(user).save(callback);
}

export function updateUserIps(userId: string, ips: string[], callback: CbError1<UserDocument | null>) {
    userModel.findByIdAndUpdate(userId, {
        lockCounter: 0,
        lastLogin: Date.now(),
        knownIPs: ips
    }, {new: true}, callback);
}

export function userByName(name: string, callback?: CbError1<UserDocument>): Query<UserDocument | null> {
    return userModel.findOne({username: new RegExp('^' + name + '$', 'i')}, callback);
}

export function userById(id: string, callback: CbError1<UserDocument>) {
    userModel.findById(id, userProject, callback);
}

export function byId(id: string, callback?: CbError1<UserDocument | null>) {
    return userModel.findById(id, userProject, callback);
}

export function find(crit: any, cb: CbError1<UserDocument[]>) {
    userModel.find(crit, cb);
}

// cb(err, {nMatched, nUpserted, nModified})
export async function updateUser(user: User, fields: any, callback?: CbError) {
    const update: any = {};
    if (fields.commentNotifications) {
        update.commentNotifications = fields.commentNotifications;
    }
    if (fields.email) {
        update.email = fields.email;
    }
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
    if (fields.searchSettings) {
        update.searchSettings = fields.searchSettings;
    }
    if (fields.publishedForms) {
        update.publishedForms = fields.publishedForms;
    }
    return userModel.updateOne({_id: user._id}, {$set: update}).exec(callback);
}

export function usersByName(name: string, callback: CbError1<UserDocument[]>) {
    userModel.find({username: new RegExp('^' + name + '$', 'i')}, userProject, callback);
}

export function usersByUsername(username: string) {
    return userModel.find({username: new RegExp(username, 'i')}, userProject);
}

export function userByUsername(username: string, callback: CbError1<UserDocument>) {
    userModel.findOne({username: new RegExp(username, 'i')}, userProject, callback);
}

export function byUsername(username: string, callback?: CbError1<UserDocument>) {
    return userModel.findOne({username}, userProject).exec(callback as any);
}

export function save(user: Partial<UserFull>, callback?: CbError1<UserDocument>) {
    return new userModel(user).save(callback);
}

// Site Admin
export function usernamesByIp(ip: string, callback: CbError1<UserDocument[]>) {
    userModel.find({knownIPs: {$in: [ip]}}, {username: 1}, callback);
}

export function siteAdmins(callback: CbError1<UserDocument[]>) {
    userModel.find({siteAdmin: true}, 'username email', callback);
}

export function orgAuthorities(callback: CbError1<UserDocument[]>) {
    userModel.find({roles: 'OrgAuthority'}, 'username', callback);
}

// Org
export function orgAdmins() {
    return userModel.find({orgAdmin: {$not: {$size: 0}}}).sort({username: 1});
}

export function orgCurators(orgs: string[], callback: CbError1<UserDocument[]>) {
    userModel.find().where('orgCurator').in(orgs).exec(callback);
}

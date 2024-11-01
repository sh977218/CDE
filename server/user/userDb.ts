import * as mongoose from 'mongoose';
import { Document, Model, Query } from 'mongoose';
import { config, ObjectId } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { ModuleAll, rolesEnum, User } from 'shared/models.model';

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
    _id: ObjectId;
    commentNotifications: CommentNotification[];
    createdDate: Date;
    lastLogin: Date | number;
    lockCounter: number;
    knownIPs: string[];
    notificationDate?: {
        serverLogDate: Date | number;
        clientLogDate: Date | number;
    };
    password: string;
}

export type UserDocument = Document<ObjectId, {}, UserFull> & UserFull;

const notificationTypesSchema = new Schema(
    {
        drawer: Boolean,
        push: Boolean,
    },
    { _id: false }
);

const commentNotificationSchema = new Schema(
    {
        date: Date,
        eltModule: { type: StringType, enum: ['board', 'cde', 'form'] },
        eltTinyId: StringType,
        read: Boolean,
        text: StringType,
        username: StringType,
    },
    { _id: false }
);

const publishedFormSchema = new Schema(
    {
        name: StringType,
        id: Schema.Types.ObjectId,
    },
    { _id: false }
);

const userSchema = new Schema<UserDocument>(
    {
        username: { type: StringType, lowercase: true, trim: true, unique: true },
        commentNotifications: [commentNotificationSchema],
        email: StringType,
        password: StringType,
        createdDate: {
            type: Date,
            default: new Date(),
        },
        lastLogin: Date,
        lastLoginInformation: {
            email: StringType,
            firstName: StringType,
            lastName: StringType,
        },
        notificationDate: {
            serverLogDate: Date,
            clientLogDate: Date,
        },
        lockCounter: Number,
        notificationSettings: {
            approvalAttachment: notificationTypesSchema,
            approvalComment: notificationTypesSchema,
            comment: notificationTypesSchema,
        },
        orgAdmin: [StringType],
        orgCurator: [StringType],
        orgEditor: [StringType],
        siteAdmin: Boolean,
        quota: Number,
        viewHistory: [StringType],
        formViewHistory: [StringType],
        knownIPs: [StringType],
        roles: [{ type: StringType, enum: rolesEnum }],
        searchSettings: {
            defaultSearchView: { type: StringType, enum: ['accordion', 'table', 'summary'] },
            tableViewFields: {
                name: { type: Boolean, default: true },
                naming: Boolean,
                questionTexts: Boolean,
                permissibleValues: Boolean,
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
                linkedForms: Boolean,
            },
        },
        viewDrafts: Boolean,
        accessToken: StringType,
        refreshToken: StringType,
        avatarUrl: StringType,
        publishedForms: [publishedFormSchema],
        cdeDefaultBoard: StringType,
        formDefaultBoard: StringType,
    },
    {}
);

export const userRefSchema = {
    _id: Schema.Types.ObjectId,
    username: { type: StringType, index: true },
};
export const userModel: Model<UserDocument> = conn.model('User', userSchema);

const userProject = { password: 0 };

export function addUser(user: Omit<UserFull, '_id'>): Promise<UserDocument | null> {
    user.username = user.username.toLowerCase();
    return new userModel(user).save();
}

export function updateUserIps(
    userId: ObjectId,
    ips: string[],
    lastLoginInformation: UserFull['lastLoginInformation']
): Promise<UserDocument | null> {
    return userModel.findByIdAndUpdate(
        userId,
        {
            lockCounter: 0,
            lastLogin: Date.now(),
            knownIPs: ips,
            lastLoginInformation,
        },
        { new: true }
    );
}

export function userByName(name: string): Query<UserDocument | null, UserDocument> {
    return userModel.findOne({ username: new RegExp('^' + name + '$', 'i') });
}

export function byId(id: string): Promise<UserDocument | null> {
    return userModel.findById(id, userProject);
}

export function findUserByUsername(username: string): Promise<UserDocument | null> {
    return userModel.findOne({ username: new RegExp('^' + username + '$', 'i') }, userProject);
}

export function updateUser(user: User, fields: Partial<UserFull>): Promise<UserFull> {
    const update: Partial<UserFull> = {};
    if (fields.commentNotifications) {
        update.commentNotifications = fields.commentNotifications;
    }
    if (fields.email) {
        update.email = fields.email;
    }
    if (fields.notificationSettings) {
        if (fields.notificationSettings.approvalAttachment) {
            update.notificationSettings = fields.notificationSettings;
        }
    }
    if (fields.searchSettings) {
        update.searchSettings = fields.searchSettings;
    }
    if (fields.publishedForms) {
        update.publishedForms = fields.publishedForms;
    }
    if (typeof fields.viewDrafts !== 'undefined') {
        update.viewDrafts = fields.viewDrafts;
    }
    if (fields.cdeDefaultBoard) {
        update.cdeDefaultBoard = fields.cdeDefaultBoard;
    }
    if (fields.formDefaultBoard) {
        update.formDefaultBoard = fields.formDefaultBoard;
    }
    return userModel
        .findOneAndUpdate({ _id: user._id }, { $set: update }, { projection: userProject, new: true })
        .then(user => {
            if (!user) {
                return Promise.reject('User not found');
            }
            return user.toObject();
        });
}

export function usersByName(name: string): Promise<UserDocument[]> {
    return userModel.find({ username: new RegExp('^' + name + '$', 'i') }, userProject);
}

export function usersByUsername(username: string): Promise<UserDocument[]> {
    return userModel.find({ username: new RegExp(username, 'i') }, userProject);
}

export function userByUsername(username: string): Promise<UserDocument | null> {
    return userModel.findOne({ username: new RegExp(username, 'i') }, userProject);
}

export function byUsername(username: string): Promise<UserDocument | null> {
    return userModel.findOne({ username }, userProject).then();
}

export function addNewUser(user: Partial<UserFull>) {
    user.password = 'umls';
    return new userModel(user).save();
}

// Site Admin
export function usernamesByIp(ip: string): Promise<UserDocument[]> {
    return userModel.find({ knownIPs: { $in: [ip] } }, { username: 1 });
}

export function siteAdmins(): Promise<UserDocument[]> {
    return userModel.find({ siteAdmin: true }, 'username email').then();
}

export function orgAuthorities(): Promise<UserDocument[]> {
    return userModel.find({ roles: 'OrgAuthority' }, 'username').then();
}

export function governanceReviewers(): Promise<UserDocument[]> {
    return userModel.find({ roles: 'GovernanceGroup' }, 'username').then();
}

export function nlmCurators(): Promise<UserDocument[]> {
    return userModel.find({ roles: 'NlmCurator' }, 'username').then();
}

// Org
export function orgAdmins() {
    return userModel.find({ orgAdmin: { $not: { $size: 0 } } }).sort({ username: 1 });
}

export function orgCurators(orgs: string[]): Promise<UserDocument[]> {
    return userModel.find().where('orgCurator').in(orgs).exec();
}

export function orgEditors(orgs: string[]): Promise<UserDocument[]> {
    return userModel.find().where('orgEditor').in(orgs).exec();
}

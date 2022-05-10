import { Document, Model, Types } from 'mongoose';
import { config, dbPlugins, ObjectId } from 'server';
import { diff } from 'server/cde/cdediff';
import { DataElementDocument } from 'server/cde/mongo-cde';
import { moduleToDbName } from 'server/dbPlugins';
import { handleError } from 'server/errorHandler';
import { CdeFormDocument } from 'server/form/mongo-form';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { jobQueue, message } from 'server/system/schemas';
import { userModel } from 'server/user/userDb';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import {
    Board,
    CbError,
    CbError1,
    EltLog,
    Item,
    ModuleAll,
    User
} from 'shared/models.model';
import { generate as shortIdGenerate } from 'shortid';
import { Readable } from 'stream';

interface JobStatus {
    _id: ObjectId;
}

export type ItemDocument = DataElementDocument | CdeFormDocument;

export interface Message {
    _id: ObjectId;
    author: {
        authorType: 'user';
        name: string;
    }
    date: Date;
    recipient: {
        recipientType: 'role' | 'user';
        name: string;
    }
    states: {
        _id?: ObjectId;
        action: 'Filed';
        comment: string;
        date: Date;
    }[]
    type: 'CommentApproval' | 'CommentReply';
    typeBoardApproval?: {
        element: {
            elementType: any;
        }
    }
    typeCommentApproval?: {
        comment: {
            commentId: ObjectId;
            text: string;
        }
        element: {
            eltId: ObjectId;
            eltType: ModuleAll;
            name: string;
        }
    }
    typeCommentReply?: {
        comment: {
            commentId: ObjectId;
            text: string;
        }
        element: {
            eltId: ObjectId;
            eltType: ModuleAll;
            name: string;
        }
    }
}

export type MessageDocument = Document & Message;
export const objectId = Types.ObjectId;

export interface PushRegistration {
    _id: ObjectId;
    features: string[];
    loggedIn?: boolean;
    subscription?: {
        endpoint: string,
        expirationTime: string | null,
        keys: {
            auth: string,
            p256dh: string
        }
    };
    userId: ObjectId;
    vapidKeys: {
        privateKey: string,
        publicKey: string
    };
}

export type PushRegistrationDocument = Document & PushRegistration;

const conn = establishConnection(config.database.appData);
export const jobQueueModel: Model<Document & JobStatus> = conn.model('JobQueue', jobQueue);
export const messageModel: Model<MessageDocument> = conn.model('Message', message);

export function jobStatus(type: string, callback: CbError1<Document & JobStatus>) {
    jobQueueModel.findOne({type}, callback);
}

export function updateJobStatus(type: string, status: string, callback?: CbError): Promise<void> {
    return jobQueueModel.updateOne({type}, {status}, {upsert: true}).exec(callback) as any;
}

export function removeJobStatus(type: string, callback: CbError) {
    jobQueueModel.deleteMany({type}, callback);
}

export function addCdeToViewHistory(elt: Item, user: User) {
    if (!elt || !user) {
        return;
    }
    const updStmt = {
        viewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000
        }
    };
    userModel.updateOne({_id: user._id}, {$push: updStmt}, null, err => {
        if (err) {
            errorLogger.error('Error: Cannot update viewing history', {
                origin: 'cde.mongo-cde.addCdeToViewHistory',
                stack: new Error().stack,
                details: {cde: elt, user}
            });
        }
    });
}

export function addFormToViewHistory(elt: Item, user: User) {
    if (!elt || !user) {
        return;
    }
    const updStmt = {
        formViewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000
        }
    };
    userModel.updateOne({_id: user._id}, {$push: updStmt}, null, err => {
        if (err) {
            errorLogger.error('Error: Cannot update viewing history', {
                origin: 'cde.mongo-cde.addFormToViewHistory',
                stack: new Error().stack,
                details: {cde: elt, user}
            });
        }
    });
}

// WARNING: destroys oldItem and newItem by calling cdediff
export function auditModifications<T extends Document>(auditDb: Model<T>) {
    return (user: User, oldItem: ItemDocument | null, newItem: ItemDocument) => {
        const message: EltLog = {
            adminItem: {
                _id: newItem._id,
                name: newItem.designations[0].designation,
                tinyId: newItem.tinyId,
                version: newItem.version,
            },
            date: new Date(),
            user: {
                username: user.username,
            },
        };

        if (oldItem) {
            message.previousItem = {
                _id: oldItem._id,
                name: oldItem.designations[0].designation,
                tinyId: oldItem.tinyId,
                version: oldItem.version,
            };
            message.diff = diff(newItem, oldItem) as any;
        }

        new auditDb(message).save(handleError());
    };
}

export interface SearchParams {
    includeBatch: boolean;
    limit: number;
    skip: number;
}

export const auditGetLog = (auditDb: Model<any>) => (params: SearchParams, cb: CbError1<EltLog[]>) => {
    auditDb.find(params.includeBatch ? {} : {'user.username': {$ne: 'NIH CDE Repository Team'}})
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(cb);
};

function isDocument<T>(data: T | T & Document): data is T & Document {
    return !!(data as T & Document).toObject;
}

export interface FileCreateInfo {
    stream: Readable;
    filename?: string;
    md5?: string;
    type?: string;
}

// export function getAllUsernames(cb: CbError<{username: string}[]>) {
//     userModel.find({}, {username: true, _id: false}, cb);
// }

export function generateTinyId() {
    return shortIdGenerate().replace(/-/g, '_');
}

export function createMessage(msg: Omit<Message, '_id'>, cb: CbError1<MessageDocument> = () => {}) {
    msg.states = [{
        action: 'Filed',
        date: new Date(),
        comment: 'cmnt'
    }];
    new messageModel(msg).save(cb);
}

export function fetchItem(module: 'board', tinyId: string): Promise<Board | null>;
export function fetchItem(module: 'cde', tinyId: string): Promise<DataElement | null>;
export function fetchItem(module: 'form', tinyId: string): Promise<CdeForm | null>;
export function fetchItem(module: ModuleAll, tinyId: string): Promise<Board | Item | null>;
export function fetchItem(module: ModuleAll, tinyId: string): Promise<Board | Item | null> {
    const db = dbPlugins[moduleToDbName(module)];
    if (!db) {
        return Promise.reject(new Error('Module has no database.'));
    }
    return db.byKey(tinyId);
}

export function sortArrayByArray(unSortArray: Item[], targetArray: ObjectId[]) {
    const stringArray = targetArray.map(t => t.toString());
    unSortArray.sort((a, b) => stringArray.indexOf(a._id.toString()) - stringArray.indexOf(b._id.toString()));
}

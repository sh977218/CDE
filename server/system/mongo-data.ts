import { Document, Model } from 'mongoose';
import { config, dbPlugins, ObjectId } from 'server';
import { diff } from 'server/cde/cdediff';
import { DataElementDocument } from 'server/cde/mongo-cde';
import { moduleToDbName } from 'server/dbPlugins';
import { respondError } from 'server/errorHandler';
import { CdeFormDocument } from 'server/form/mongo-form';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { jobQueue, message } from 'server/system/schemas';
import { userModel } from 'server/user/userDb';
import { Board } from 'shared/board.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { Item } from 'shared/item';
import { Elt, EltLog, ModuleAll, User } from 'shared/models.model';
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
    };
    date: Date;
    recipient: {
        recipientType: 'role' | 'user';
        name: string;
    };
    states: {
        _id?: ObjectId;
        action: 'Filed';
        comment: string;
        date: Date;
    }[];
    type: 'CommentApproval' | 'CommentReply';
    typeBoardApproval?: {
        element: {
            elementType: any;
        };
    };
    typeCommentApproval?: {
        comment: {
            commentId: ObjectId;
            text: string;
        };
        element: {
            eltId: ObjectId;
            eltType: ModuleAll;
            name: string;
        };
    };
    typeCommentReply?: {
        comment: {
            commentId: ObjectId;
            text: string;
        };
        element: {
            eltId: ObjectId;
            eltType: ModuleAll;
            name: string;
        };
    };
}

export type MessageDocument = Document & Message;

const conn = establishConnection(config.database.appData);
export const jobQueueModel: Model<Document & JobStatus> = conn.model('JobQueue', jobQueue) as any;
export const messageModel: Model<MessageDocument> = conn.model('Message', message) as any;

export function jobStatus(type: string): Promise<(Document & JobStatus) | null> {
    return jobQueueModel.findOne({ type });
}

export function updateJobStatus(type: string, status: string): Promise<void> {
    return jobQueueModel.updateOne({ type }, { status }, { upsert: true }).then();
}

export function removeJobStatus(type: string) {
    return jobQueueModel.deleteMany({ type });
}

export function addCdeToViewHistory(elt: Item, user: User) {
    if (!elt || !user) {
        return;
    }
    const updStmt = {
        viewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000,
        },
    };
    userModel.updateOne({ _id: user._id }, { $push: updStmt }, null).catch(err => {
        if (err) {
            errorLogger.error('Error: Cannot update viewing history', {
                origin: 'cde.mongo-cde.addCdeToViewHistory',
                stack: new Error().stack,
                details: { cde: elt, user },
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
            $slice: 1000,
        },
    };
    userModel.updateOne({ _id: user._id }, { $push: updStmt }, null).catch(err => {
        if (err) {
            errorLogger.error('Error: Cannot update viewing history', {
                origin: 'cde.mongo-cde.addFormToViewHistory',
                stack: new Error().stack,
                details: { cde: elt, user },
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

        new auditDb(message).save().catch(respondError());
    };
}

export interface FileCreateInfo {
    stream: Readable;
    filename?: string;
    md5?: string;
    type?: string;
}

export function generateTinyId() {
    return shortIdGenerate().replace(/-/g, '_');
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

export function updateElt(elt: Elt, dbElt: Elt, user: User): void {
    delete elt._id;
    /* mongoose appears to drop classifications with _id, the whole subtree */
    elt.classification.forEach(c => {
        if (typeof (c as any)._id !== 'undefined') {
            delete (c as any)._id;
        }
        c.elements.forEach(e => {
            if (typeof (c as any)._id !== 'undefined') {
                delete (c as any)._id;
            }
        });
    });
    /* istanbul ignore if */
    if (!elt.history) {
        elt.history = [];
    }
    elt.history.push(dbElt._id);
    updateMetadata(elt, user);
}

export function updateMetadata(elt: Elt, user: User) {
    elt.updated = new Date();
    elt.updatedBy = {
        username: user.username,
    };
}

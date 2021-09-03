import { forEach } from 'async';
import * as connectMongo from 'connect-mongo';
import { Response } from 'express';
import * as session from 'express-session';
import * as Grid from 'gridfs-stream';
import { escape, findIndex } from 'lodash';
import * as mongo from 'mongodb2'; // Mongo 2 used by gridfs
import { connect, MongoClientOptions } from 'mongodb2';
import { Document, Model, Types } from 'mongoose';
import { ObjectId } from 'server';
import { BoardDocument } from 'server/board/boardDb';
import { diff } from 'server/cde/cdediff';
import { DataElementDocument } from 'server/cde/mongo-cde';
import { handleError } from 'server/errorHandler/errorHandler';
import { CdeFormDocument } from 'server/form/mongo-form';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { getDao } from 'server/system/moduleDaoManager';
import { noDbLogger } from 'server/system/noDbLogger';
import { config } from 'server/system/parseConfig';
import { jobQueue, message } from 'server/system/schemas';
import { userModel } from 'server/user/userDb';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { Cb1, CbError, CbError1, CbError2, EltLog, Item, ItemElastic, ModuleAll, User } from 'shared/models.model';
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
    features?: string[];
    loggedIn?: boolean;
    subscription?: {
        endpoint: string,
        expirationTime: string,
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
const mongoStore = connectMongo(session);

const conn = establishConnection(config.database.appData);

export const jobQueueModel: Model<Document & JobStatus> = conn.model('JobQueue', jobQueue);
export const messageModel: Model<MessageDocument> = conn.model('Message', message);

export let gfs: Grid.Grid;
connect(config.database.appData.uri, (err?: Error, client?: MongoClientOptions) => {
    if (err) {
        noDbLogger.info('Error connection open to legacy mongodb: ' + err);
    } else {
        gfs = Grid(client, mongo);
    }
});
export const sessionStore = new mongoStore({
    mongooseConnection: conn,
    touchAfter: 60
});

export function jobStatus(type: string, callback: CbError1<Document & JobStatus>) {
    jobQueueModel.findOne({type}, callback);
}

export function updateJobStatus(type: string, status: string, callback?: CbError): Promise<void> {
    return jobQueueModel.updateOne({type}, {status}, {upsert: true}).exec(callback);
}

export function removeJobStatus(type: string, callback: CbError) {
    jobQueueModel.remove({type}, callback);
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
    userModel.updateOne({_id: user._id}, {$push: updStmt}, err => {
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
    userModel.updateOne({_id: user._id}, {$push: updStmt}, err => {
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

export function eltAsElastic(doc: DataElement | DataElementDocument): DataElementElastic;
export function eltAsElastic(doc: CdeForm | CdeFormDocument): CdeFormElastic;
export function eltAsElastic(doc: Item | ItemDocument): ItemElastic {
    const elt: ItemElastic = isDocument(doc) ? (doc as ItemDocument).toObject() : doc;
    elt.stewardOrgCopy = elt.stewardOrg;
    elt.primaryNameCopy = escape(elt.designations[0].designation);
    elt.primaryDefinitionCopy = '';
    if (elt.definitions[0] && elt.definitions[0].definition) {
        elt.primaryDefinitionCopy = escape(elt.definitions[0].definition);
    }
    return elt;
}

export const attachables: Model<Document>[] = [];

export interface FileCreateInfo {
    stream: Readable;
    filename?: string;
    md5?: string;
    type?: string;
}

export function addFile(file: FileCreateInfo, streamDescription: any = null, cb: CbError2<File & Document, boolean>) {
    gfs.findOne({md5: file.md5} as any, (err, f) => {
        if (f) {
            return cb(err, f, false);
        }
        if (!streamDescription) {
            streamDescription = {
                filename: file.filename,
                mode: 'w',
                content_type: file.type
            };
        }

        file.stream.pipe(gfs.createWriteStream(streamDescription)
            .on('close', newFile => cb(null, newFile, true))
            .on('error', cb));
    });
}

export function deleteFileById(id: string, callback: CbError) {
    gfs.remove({_id: id}, callback);
}

export function getFile(user: User, id: string, res: Response) {
    gfs.exist({_id: id}, (err, found) => {
        if (err || !found) {
            res.status(404).send('File not found.');
        } else {
            gfs.findOne({_id: id}, (err, file) => {
                if (file.contentType.indexOf('csv') !== -1) {
                    res.setHeader('Content-disposition', 'attachment; filename=' + file.filename);
                }
                res.contentType(file.contentType);
                res.header('Accept-Ranges', 'bytes');
                res.header('Content-Length', file.length);
                gfs.createReadStream({_id: id}).pipe(res);
            });
        }
    });
}

// export function getAllUsernames(cb: CbError<{username: string}[]>) {
//     userModel.find({}, {username: true, _id: false}, cb);
// }

export function generateTinyId() {
    return shortIdGenerate().replace(/-/g, '_');
}

export function createMessage(msg: Omit<Message, '_id'>, cb?: CbError1<MessageDocument>) {
    msg.states = [{
        action: 'Filed',
        date: new Date(),
        comment: 'cmnt'
    }];
    new messageModel(msg).save(cb);
}

export function fetchItem(module: 'board', tinyId: string, cb: CbError1<BoardDocument | null | void>): void;
export function fetchItem(module: 'cde' | 'form', tinyId: string, cb: CbError1<ItemDocument | null | void>): void;
export function fetchItem(module: ModuleAll, tinyId: string, cb: CbError1<BoardDocument | ItemDocument | null | void>): void;
export function fetchItem(module: ModuleAll, tinyId: string, cb: CbError1<BoardDocument | ItemDocument | null | void> | CbError1<BoardDocument | null | void> | CbError1<ItemDocument | null | void>): void {
    const db = getDao(module);
    if (!db) {
        cb(new Error('Module has no database.'));
        return;
    }
    db.byKey(tinyId, cb as any);
}

export function sortArrayByArray(unSortArray: Item[], targetArray: ObjectId[]) {
    unSortArray.sort((a, b) => findIndex(targetArray, a._id) - findIndex(targetArray, b._id));
}

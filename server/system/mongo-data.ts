import { forEach } from 'async';
import { escape, findIndex } from 'lodash';
import * as mongo from 'mongodb';
import { Document, Model, Types } from 'mongoose';
import { diff } from 'server/cde/cdediff';
import { DataElementDocument } from 'server/cde/mongo-cde';
import { handleError } from 'server/errorHandler/errorHandler';
import { CdeFormDocument } from 'server/form/mongo-form';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { getDao, getDaoList } from 'server/system/moduleDaoManager';
import { noDbLogger } from 'server/system/noDbLogger';
import { config } from 'server/system/parseConfig';
import { classificationAudit, jobQueue, message, statusValidationRuleSchema } from 'server/system/schemas';
import { userByName, UserFull, userModel } from 'server/user/userDb';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import * as eltShared from 'shared/elt';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { Cb1, CbError, Item, ItemElastic, ModuleAll, Organization, StatusValidationRules } from 'shared/models.model';
import { hasRole } from 'shared/system/authorizationShared';
import { generate as shortIdGenerate } from 'shortid';
import { orgByName } from 'server/orgManagement/orgDb';

type AuditLog = any;

export type ItemDocument = DataElementDocument | CdeFormDocument;
export type Message = any;
export type MessageDocument = Document & Message;
export type ObjectId = Types.ObjectId;
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
    userId: string;
    vapidKeys?: {
        privateKey: string,
        publicKey: string
    };
}

export type PushRegistrationDocument = Document & PushRegistration;

const session = require('express-session');
const Grid = require('gridfs-stream');
const MongoStore = require('connect-mongo')(session); // TODO: update to new version when available for mongodb 3 used by mongoose

const conn = establishConnection(config.database.appData);

export const JobQueue = conn.model('JobQueue', jobQueue);
export const messageModel: Model<MessageDocument> = conn.model('Message', message);
const validationRuleModel = conn.model('ValidationRule', statusValidationRuleSchema);

export let gfs;
mongo.connect(config.database.appData.uri, (err, client) => {
    if (err) {
        noDbLogger.info('Error connection open to legacy mongodb: ' + err);
    } else {
        gfs = Grid(client, mongo);
    }
});
export const sessionStore = new MongoStore({
    mongooseConnection: conn,
    touchAfter: 60
});

export function jobStatus(type, callback) {
    JobQueue.findOne({type}, callback);
}

export function updateJobStatus(type, status, callback) {
    JobQueue.updateOne({type}, {status}, {upsert: true}, callback);
}

export function removeJobStatus(type, callback) {
    JobQueue.remove({type}, callback);
}

export function addCdeToViewHistory(elt, user) {
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

export function addFormToViewHistory(elt, user) {
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
export const auditModifications = auditDb => (user, oldItem, newItem) => {
    const message: any = {
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
        message.diff = diff(newItem, oldItem);
    }

    auditDb(message).save(handleError());
};

// cb(err, logs)
export const auditGetLog = auditDb => (params, callback) => {
    auditDb.find(params.includeBatch ? undefined : {'user.username': {$ne: 'batchloader'}})
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
};

export function formatElt(doc: DataElement | DataElementDocument): DataElementElastic;
export function formatElt(doc: CdeForm | CdeFormDocument): CdeFormElastic;
export function formatElt(doc: Item | ItemDocument): ItemElastic {
    const elt: ItemElastic = (doc as ItemDocument).toObject ? (doc as ItemDocument).toObject() : doc;
    elt.stewardOrgCopy = elt.stewardOrg;
    elt.primaryNameCopy = escape(elt.designations[0].designation);
    elt.primaryDefinitionCopy = '';
    if (elt.definitions[0] && elt.definitions[0].definition) {
        elt.primaryDefinitionCopy = escape(elt.definitions[0].definition);
    }
    return elt;
}

export const attachables: Model<Document>[] = [];

export function userTotalSpace(name: string, callback: Cb1<number>) {
    let totalSpace = 0;
    forEach(attachables, (attachable, doneOne) => {
        attachable.aggregate(
            [
                {$match: {'attachments.uploadedBy.username': name}},
                {$unwind: '$attachments'},
                {
                    $group: {
                        _id: {uname: '$attachments.uploadedBy.username'},
                        totalSize: {$sum: '$attachments.filesize'}
                    }
                },
                {$sort: {totalSize: -1}}
            ],
            (err, res) => {
                if (res.length > 0) {
                    totalSpace += res[0].totalSize;
                }
                doneOne();
            });
    }, () => callback(totalSpace));
}

export function addFile(file, cb, streamDescription: any = null) {
    gfs.findOne({md5: file.md5}, (err, f) => {
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

export function getFile(user, id, res) {
    gfs.exist({_id: id}, (err, found) => {
        if (err || !found) {
            res.status(404).send('File not found.');
        } else {
            gfs.findOne({_id: id}, (err, file) => {
                if (!file.metadata
                    || !file.metadata.status
                    || file.metadata.status === 'approved'
                    || hasRole(user, 'AttachmentReviewer')) {
                    if (file.contentType.indexOf('csv') !== -1) {
                        res.setHeader('Content-disposition', 'attachment; filename=' + file.filename);
                    }
                    res.contentType(file.contentType);
                    res.header('Accept-Ranges', 'bytes');
                    res.header('Content-Length', file.length);
                    gfs.createReadStream({_id: id}).pipe(res);
                } else {
                    res.status(403).send('This file has not been approved yet.');
                }
            });
        }
    });
}

export function getAllUsernames(callback) {
    userModel.find({}, {username: true, _id: false}, callback);
}

export function generateTinyId() {
    return shortIdGenerate().replace(/-/g, '_');
}

export function createMessage(msg: Message, cb?: CbError<MessageDocument>) {
    msg.states = [{
        action: 'Filed',
        date: new Date(),
        comment: 'cmnt'
    }];
    new messageModel(msg).save(cb);
}

export function fetchItem(module: ModuleAll, tinyId: string, cb: CbError<ItemDocument>) {
    const db = getDao(module);
    if (!db) {
        cb(new Error('Module has no database.'));
        return;
    }
    (db.byTinyId || db.byId)(tinyId, cb);
}

export function getAllRules(cb: CbError<StatusValidationRules>) {
    validationRuleModel.find().exec(cb);
}

export function disableRule(params, cb) {
    orgByName(params.orgName, (err, org) => {
        org.cdeStatusValidationRules.forEach((rule, i) => {
            if (rule.id === params.rule.id) {
                org.cdeStatusValidationRules.splice(i, 1);
            }
        });
        org.save(cb);
    });
}

export function enableRule(params, cb) {
    orgByName(params.orgName, (err, org) => {
        delete params.rule._id;
        org.cdeStatusValidationRules.push(params.rule);
        org.save(cb);
    });
}

export function sortArrayByArray(unSortArray, targetArray) {
    unSortArray.sort((a, b) => findIndex(targetArray, a._id) - findIndex(targetArray, b._id));
}

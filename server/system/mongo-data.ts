import { handleError } from '../errorHandler/errorHandler';
import { consoleLog } from '../log/dbLogger';
import { hasRole } from 'shared/system/authorizationShared';
import { config } from '../system/parseConfig';
import * as eltShared from 'shared/elt';

const _ = require('lodash');
const async = require('async');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const session = require('express-session');
const shortId = require('shortid');
const Grid = require('gridfs-stream');
const MongoStore = require('connect-mongo')(session); // TODO: update to new version when available for mongodb 3 used by mongoose
const connHelper = require('./connections');
const logger = require('./noDbLogger');
const cdediff = require('../cde/cdediff');
const notificationSvc = require('../notification/notificationSvc');
const logging = require('./logging');
const daoManager = require('./moduleDaoManager');
const schemas = require('./schemas');
const writableCollection = require('./writableCollection').writableCollection;

const conn = connHelper.establishConnection(config.database.appData);
export const IdSource = conn.model('IdSource', schemas.idSourceSchema);
export const JobQueue = conn.model('JobQueue', schemas.jobQueue);
export const Message = conn.model('Message', schemas.message);
export const Org = conn.model('Org', schemas.orgSchema);
const userDb = require('../user/userDb');
export const User = require('../user/userDb').User;
const ValidationRule = conn.model('ValidationRule', schemas.statusValidationRuleSchema);

export let gfs;
mongo.connect(config.database.appData.uri, (err, client) => {
    if (err) {
        logger.noDbLogger.info('Error connection open to legacy mongodb: ' + err);
    } else {
        gfs = Grid(client, mongo);
    }
});
export const sessionStore = new MongoStore({
    mongooseConnection: conn,
    touchAfter: 60
});


const userProject = {password: 0};
const orgDetailProject = {
    _id: 0,
    name: 1,
    longName: 1,
    mailAddress: 1,
    emailAddress: 1,
    embeds: 1,
    phoneNumber: 1,
    uri: 1,
    workingGroupOf: 1,
    extraInfo: 1,
    cdeStatusValidationRules: 1,
    propertyKeys: 1,
    nameTags: 1,
    htmlOverview: 1
};

export const ObjectId = mongoose.Types.ObjectId;
export const mongoose_connection = conn;

const classificationAudit = conn.model('classificationAudit', schemas.classificationAudit);

export function jobStatus(type, callback) {
    JobQueue.findOne({type}, callback);
}

export function updateJobStatus(type, status, callback) {
    JobQueue.updateOne({type}, {status}, {upsert: true}, callback);
}

export function removeJobStatus(type, callback) {
    JobQueue.remove({type}, callback);
}

// _id is own string
export const idSource = writableCollection(IdSource, undefined);

export function addCdeToViewHistory(elt, user) {
    if (!elt || !user) { return; }
    const updStmt = {
        viewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000
        }
    };
    User.updateOne({_id: user._id}, {$push: updStmt}, err => {
        if (err) {
            logging.errorLogger.error('Error: Cannot update viewing history', {
                origin: 'cde.mongo-cde.addCdeToViewHistory',
                stack: new Error().stack,
                details: {cde: elt, user}
            });
        }
    });
}

export function addFormToViewHistory(elt, user) {
    if (!elt || !user) { return; }
    const updStmt = {
        formViewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000
        }
    };
    User.updateOne({_id: user._id}, {$push: updStmt}, err => {
        if (err) {
            logging.errorLogger.error('Error: Cannot update viewing history', {
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
        message.diff = cdediff.diff(newItem, oldItem);
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

export function orgNames(callback) {
    Org.find({}, {name: true, _id: false}, callback);
}

export function userByName(name, callback) {
    User.findOne({username: new RegExp('^' + name + '$', 'i')}, callback);
}

export function usersByName(name, callback) {
    User.find({username: new RegExp('^' + name + '$', 'i')}, userProject, callback);
}

export function userById(id, callback) {
    User.findOne({_id: id}, userProject, callback);
}

export function addUser(user, callback) {
    user.username = user.username.toLowerCase();
    new User(user).save(callback);
}

export function orgAdmins(callback) {
    User.find({orgAdmin: {$not: {$size: 0}}}).sort({username: 1}).exec(callback);
}

export function orgCurators(orgs, callback) {
    User.find().where('orgCurator').in(orgs).exec(callback);
}

export function orgByName(orgName, callback?) {
    return Org.findOne({name: orgName}).exec(callback);
}

export function listOrgs(callback) {
    Org.distinct('name', callback);
}

export function listOrgsLongName(callback) {
    Org.find({}, {_id: 0, name: 1, longName: 1}, callback);
}

export function listOrgsDetailedInfo(callback) {
    Org.find({}, orgDetailProject, callback);
}

export function managedOrgs(callback) {
    Org.find({}).sort({name: 1}).exec(callback);
}

export function findOrCreateOrg(newOrg, cb) {
    Org.findOne({name: newOrg.name}).exec(function(err, found) {
        if (err) {
            cb(err);
            logging.errorLogger.error('Cannot add org.',
                {
                    origin: 'system.mongo.addOrg',
                    stack: new Error().stack,
                    details: 'orgName: ' + newOrg.name + 'Error: ' + err
                });
        } else if (found) {
            cb(null, found);
        } else {
            newOrg = new Org(newOrg);
            newOrg.save(cb);
        }
    });
}

export function addOrg(newOrgArg, res) {
    Org.findOne({name: newOrgArg.name}, (err, found) => {
        if (err) {
            res.send(500);
            logging.errorLogger.error('Cannot add org.',
                {
                    origin: 'system.mongo.addOrg',
                    stack: new Error().stack,
                    details: 'orgName: ' + newOrgArg + 'Error: ' + err
                });
        } else if (found) {
            res.send('Org Already Exists');
        } else {
            new Org(newOrgArg).save(function() {
                res.send('Org Added');
            });
        }
    });
}

export function removeOrgById(id, callback) {
    Org.remove({_id: id}, callback);
}

export function formatElt(elt) {
    if (elt.toObject) { elt = elt.toObject(); }
    elt.stewardOrgCopy = elt.stewardOrg;
    elt.primaryNameCopy = _.escape(elt.designations[0].designation);
    elt.primaryDefinitionCopy = '';
    if (elt.definitions[0] && elt.definitions[0].definition) {
        elt.primaryDefinitionCopy = _.escape(elt.definitions[0].definition);
    }
    return elt;
}

export const attachables = [];

export function userTotalSpace(name, callback) {
    let totalSpace = 0;
    async.forEach(attachables, (attachable, doneOne) => {
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

export function deleteFileById(id, callback) {
    gfs.remove({_id: id}, callback);
}

export function getFile(user, id, res) {
    gfs.exist({_id: id}, function(err, found) {
        if (err || !found) {
            res.status(404).send('File not found.');
        } else {
            gfs.findOne({_id: id}, function(err, file) {
                if (!file.metadata
                    || !file.metadata.status
                    || file.metadata.status === 'approved'
                    || hasRole(user, 'AttachmentReviewer')) {
                    res.contentType(file.contentType);
                    res.header('Accept-Ranges', 'bytes');
                    res.header('Content-Length', file.length);
                    gfs.createReadStream({_id: id}).pipe(res);
                } else { res.status(403).send('This file has not been approved yet.'); }
            });
        }
    });
}

export function updateOrg(org, res) {
    const id = org._id;
    delete org._id;
    Org.findOneAndUpdate({_id: id}, org, {new: true}, (err, found) => {
        if (err || !found) { res.status(500).send('Could not update'); }
        else { res.send(); }
    });
}

export function getAllUsernames(callback) {
    User.find({}, {username: true, _id: false}, callback);
}

export function generateTinyId() {
    return shortId.generate().replace(/-/g, '_');
}

export function createMessage(msg, cb) {
    msg.states = [{
        action: 'Filed',
        date: new Date(),
        comment: 'cmnt'
    }];
    new Message(msg).save(cb);
}

export function updateMessage(msg, callback) {
    const id = msg._id;
    delete msg._id;
    Message.updateOne({_id: id}, msg, callback);
}

// TODO this function name is not good
export function getMessages(req, callback) {
    let authorRecipient: any = {
        $and: [
            {
                $or: [
                    {
                        'recipient.recipientType': 'stewardOrg',
                        'recipient.name': {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    },
                    {
                        'recipient.recipientType': 'user',
                        'recipient.name': req.user.username
                    }
                ]
            },
            {
                'states.0.action': null
            }
        ]
    };

    if (req.user.roles === null || req.user.roles === undefined) {
        consoleLog('user: ' + req.user.username + ' has null roles.');
        req.user.roles = [];
    }
    req.user.roles.forEach(function(r) {
        const roleFilter = {
            'recipient.recipientType': 'role'
            , 'recipient.name': r
        };
        authorRecipient.$and[0].$or.push(roleFilter);
    });

    switch (req.params.type) {
        case 'received':
            authorRecipient.$and[1]['states.0.action'] = 'Filed';
            break;
        case 'sent':
            authorRecipient = {
                $or: [
                    {
                        'author.authorType': 'stewardOrg',
                        'author.name': {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    },
                    {
                        'author.authorType': 'user',
                        'author.name': req.user.username
                    }
                ]
            };
            break;
        case 'archived':
            authorRecipient.$and[1]['states.0.action'] = 'Approved';
            break;
    }
    if (!authorRecipient) {
        callback('Type not specified!');
        return;
    }

    Message.find(authorRecipient, callback);
}

// cb(err)
export function addUserRole(username, role, cb) {
    userByName(username, (err, u) => {
        if (!!err || !u) {
            cb(err || 'user not found');
            return;
        }
        if (u.roles.indexOf(role) === -1) {
            u.roles.push(role);
            u.save(cb);
        } else {
            cb();
        }
    });
}

export function mailStatus(user, callback) {
    getMessages({user, params: {type: 'received'}}, callback);
}

// cb(err, item)
export function fetchItem(module, tinyId, cb) {
    const db = daoManager.getDao(module);
    if (!db) {
        cb('Module has no database.');
        return;
    }
    (db.byTinyId || db.byId)(tinyId, cb);
}

export function addToClassifAudit(msg) {
    const persistClassifRecord = function(err, elt) {
        if (!elt) { return; }
        msg.elements[0].eltType = eltShared.getModule(elt);
        msg.elements[0].name = eltShared.getName(elt);
        msg.elements[0].status = elt.registrationState.registrationStatus;
        new classificationAudit(msg).save();
    };
    daoManager.getDaoList().forEach(function(dao) {
        if (msg.elements[0]) {
            if (msg.elements[0]._id && dao.byId) {
                dao.byId(msg.elements[0]._id, persistClassifRecord);
            }
            if (msg.elements[0].tinyId && dao.eltByTinyId) {
                dao.eltByTinyId(msg.elements[0].tinyId, persistClassifRecord);
            }
        }
    });
}

export function getClassificationAuditLog(params, callback) {
    classificationAudit.find({}, {elements: {$slice: 10}})
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(function(err, logs) {
            callback(err, logs);
        });
}

export function getAllRules(cb) {
    ValidationRule.find().exec(function(err, rules) {
        cb(err, rules);
    });
}

export function disableRule(params, cb) {
    orgByName(params.orgName, function(err, org) {
        org.cdeStatusValidationRules.forEach(function(rule, i) {
            if (rule.id === params.rule.id) {
                org.cdeStatusValidationRules.splice(i, 1);
            }
        });
        org.save(cb);
    });
}

export function enableRule(params, cb) {
    orgByName(params.orgName, function(err, org) {
        delete params.rule._id;
        org.cdeStatusValidationRules.push(params.rule);
        org.save(cb);
    });
}

export function sortArrayByArray(unSortArray, targetArray) {
    unSortArray.sort((a, b) => {
        const aId = a._id;
        const bId = b._id;
        const aIndex = _.findIndex(targetArray, aId);
        const bIndex = _.findIndex(targetArray, bId);
        return aIndex - bIndex;
    });
}

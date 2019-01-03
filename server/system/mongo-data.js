const _ = require('lodash');
const async = require('async');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const session = require('express-session');
const shortId = require('shortid');
const Grid = require('gridfs-stream');
const MongoStore = require('connect-mongo')(session); // TODO: update to new version when available for mongodb 3 used by mongoose

const eltShared = require('esm')(module)('../../shared/elt');
const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const connHelper = require('./connections');
const dbLogger = require('../log/dbLogger');
const consoleLog = dbLogger.consoleLog;
const handleError = dbLogger.handleError;
const logger = require('./noDbLogger');
const notificationSvc = require('../notification/notificationSvc');
const logging = require('./logging.js');
const daoManager = require('./moduleDaoManager');
const config = require('./parseConfig');
const schemas = require('./schemas');

const conn = connHelper.establishConnection(config.database.appData);
const Embeds = conn.model('Embed', schemas.embedSchema);
const FhirApps = conn.model('FhirApp', schemas.fhirAppSchema);
const FhirObservationInfo = conn.model('FhirObservationInfo', schemas.fhirObservationInformationSchema);
const JobQueue = conn.model('JobQueue', schemas.jobQueue);
const Message = conn.model('Message', schemas.message);
const Org = conn.model('Org', schemas.orgSchema);
const PushRegistration = conn.model('PushRegistration', schemas.pushRegistration);
const userDb = require('../user/userDb');
const User = require('../user/userDb').User;
const ValidationRule = conn.model('ValidationRule', schemas.statusValidationRuleSchema);

let gfs;
mongo.connect(config.database.appData.uri, (err, client) => {
    if (err) {
        logger.noDbLogger.info("Error connection open to legacy mongodb: " + err);
    } else {
        gfs = Grid(client, mongo);
    }
});
const sessionStore = new MongoStore({
    mongooseConnection: conn,
    touchAfter: 60
});

exports.gfs = gfs;

const userProject = {password: 0};
const orgDetailProject = {
    '_id': 0,
    'name': 1,
    'longName': 1,
    'mailAddress': 1,
    "emailAddress": 1,
    "embeds": 1,
    "phoneNumber": 1,
    "uri": 1,
    "workingGroupOf": 1,
    "extraInfo": 1,
    "cdeStatusValidationRules": 1,
    "propertyKeys": 1,
    "nameTags": 1,
    "htmlOverview": 1
};

exports.ObjectId = mongoose.Types.ObjectId;
exports.sessionStore = sessionStore;
exports.Message = Message;
exports.mongoose_connection = conn;
exports.sessionStore = sessionStore;
exports.FhirApps = FhirApps;
exports.FhirObservationInfo = FhirObservationInfo;
exports.Org = Org;
exports.User = User;
exports.JobQueue = JobQueue;

var classificationAudit = conn.model('classificationAudit', schemas.classificationAudit);

exports.jobStatus = (type, callback) => {
    JobQueue.findOne({type: type}, callback);
};
exports.updateJobStatus = (type, status, callback) => {
    JobQueue.updateOne({type: type}, {status: status}, {upsert: true}, callback);
};
exports.removeJobStatus = (type, callback) => {
    JobQueue.remove({type: type}, callback);
};


exports.addCdeToViewHistory = (elt, user) => {
    if (!elt || !user) return;
    let updStmt = {
        viewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000
        }
    };
    User.updateOne({'_id': user._id}, {$push: updStmt}, err => {
        if (err) logging.errorLogger.error("Error: Cannot update viewing history", {
            origin: "cde.mongo-cde.addCdeToViewHistory",
            stack: new Error().stack,
            details: {"cde": elt, user: user}
        });
    });
};

exports.addFormToViewHistory = (elt, user) => {
    if (!elt || !user) return;
    let updStmt = {
        formViewHistory: {
            $each: [elt.tinyId],
            $position: 0,
            $slice: 1000
        }
    };
    User.updateOne({'_id': user._id}, {$push: updStmt}, err => {
        if (err) logging.errorLogger.error("Error: Cannot update viewing history", {
            origin: "cde.mongo-cde.addFormToViewHistory",
            stack: new Error().stack,
            details: {"cde": elt, user: user}
        });
    });
};

exports.embeds = {
    save: function (embed, cb) {
        if (embed._id) {
            let _id = embed._id;
            delete embed._id;
            Embeds.updateOne({_id: _id}, embed, cb);
        } else {
            new Embeds(embed).save(cb);
        }
    },
    find: function (crit, cb) {
        Embeds.find(crit, cb);
    },
    delete: function (id, cb) {
        Embeds.remove({_id: id}, cb);
    }
};

exports.orgNames = callback => {
    Org.find({}, {name: true, _id: false}, callback);
};

exports.pushesByEndpoint = (endpoint, callback) => {
    PushRegistration.find({'subscription.endpoint': endpoint}, callback);
};

exports.pushById = (id, callback) => {
    PushRegistration.findOne({_id: id}, callback);
};

exports.pushByIds = (endpoint, userId, callback) => {
    PushRegistration.findOne({'subscription.endpoint': endpoint, userId: userId}, callback);
};

exports.pushByIdsCount = (endpoint, userId, callback) => {
    PushRegistration.countDocuments({'subscription.endpoint': endpoint, userId: userId}, callback);
};

exports.pushByPublicKey = (publicKey, callback) => {
    PushRegistration.findOne({'vapidKeys.publicKey': publicKey}, callback);
};

exports.pushClearDb = callback => {
    PushRegistration.remove({}, callback);
};

exports.pushCreate = (push, callback) => {
    new PushRegistration(push).save(callback);
};

exports.pushDelete = (endpoint, userId, callback) => {
    this.pushByIds(endpoint, userId, (err, registration) => {
        if (err) return callback(err);
        PushRegistration.remove({_id: registration._id}, callback);
    });
};

exports.pushEndpointUpdate = (endpoint, commandObj, callback) => {
    PushRegistration.updateMany({'subscription.endpoint': endpoint}, commandObj, callback);
};

exports.pushGetAdministratorRegistrations = callback => {
    userDb.siteAdmins(handleError({}, users => {
        let userIds = users.map(u => u._id.toString());
        PushRegistration.find({}).exec(handleError({}, registrations => {
            callback(registrations.filter(reg => reg.loggedIn === true && userIds.indexOf(reg.userId) > -1));
        }));
    }));
};

// cb(err, registrations)
exports.pushRegistrationFindActive = (criteria, cb) => {
    criteria.loggedIn = true;
    PushRegistration.find(criteria, cb);
};

// cb(err, registrations)
exports.pushRegistrationSubscribersByType = (type, cb, data = undefined) => {
    userDb.find(
        notificationSvc.criteriaSet(
            notificationSvc.typeToCriteria(type, data),
            'notificationSettings.' + notificationSvc.typeToNotificationSetting(type) + '.push'
        ),
        (err, users) => {
            if (err) return cb(err);
            exports.pushRegistrationSubscribersByUsers(users, cb);
        }
    );
};

// cb(err, registrations)
exports.pushRegistrationSubscribersByUsers = (users, cb) => {
    let userIds = users.map(u => u._id.toString());
    exports.pushRegistrationFindActive({userId: {$in: userIds}}, cb);
};

exports.userByName = (name, callback) => {
    User.findOne({'username': new RegExp('^' + name + '$', "i")}, callback);
};
exports.usersByName = (name, callback) => {
    User.find({'username': new RegExp('^' + name + '$', "i")}, userProject, callback);
};

exports.userById = (id, callback) => {
    User.findOne({'_id': id}, userProject, callback);
};

exports.addUser = (user, callback) => {
    user.username = user.username.toLowerCase();
    new User(user).save(callback);
};

exports.orgAdmins = callback => {
    User.find({orgAdmin: {$not: {$size: 0}}}).sort({username: 1}).exec(callback);
};

exports.orgCurators = (orgs, callback) => {
    User.find().where("orgCurator").in(orgs).exec(callback);
};


exports.orgByName = (orgName, callback) => {
    Org.findOne({"name": orgName}, callback);
};


exports.listOrgs = callback => {
    Org.distinct('name', callback);
};

exports.listOrgsLongName = callback => {
    Org.find({}, {'_id': 0, 'name': 1, 'longName': 1}, callback);
};

exports.listOrgsDetailedInfo = callback => {
    Org.find({}, orgDetailProject, callback);
};

exports.managedOrgs = function (callback) {
    Org.find({}, callback);
};

exports.findOrCreateOrg = function (newOrg, cb) {
    Org.findOne({"name": newOrg.name}).exec(function (err, found) {
        if (err) {
            cb(err);
            logging.errorLogger.error("Cannot add org.",
                {
                    origin: "system.mongo.addOrg",
                    stack: new Error().stack,
                    details: "orgName: " + newOrg.name + "Error: " + err
                });
        } else if (found) {
            cb(null, found);
        } else {
            newOrg = new Org(newOrg);
            newOrg.save(cb);
        }
    });
};

exports.addOrg = function (newOrgArg, res) {
    Org.findOne({"name": newOrgArg.name}, (err, found) => {
        if (err) {
            res.send(500);
            logging.errorLogger.error("Cannot add org.",
                {
                    origin: "system.mongo.addOrg",
                    stack: new Error().stack,
                    details: "orgName: " + newOrgArg + "Error: " + err
                });
        } else if (found) {
            res.send("Org Already Exists");
        } else {
            new Org(newOrgArg).save(function () {
                res.send("Org Added");
            });
        }
    });
};

exports.removeOrgById = (id, callback) => {
    Org.remove({"_id": id}, callback);
};

exports.formatElt = elt => {
    if (elt.toObject) elt = elt.toObject();
    elt.stewardOrgCopy = elt.stewardOrg;
    elt.primaryNameCopy = _.escape(elt.designations[0].designation);
    elt.primaryDefinitionCopy = '';
    if (elt.definitions[0] && elt.definitions[0].definition)
        elt.primaryDefinitionCopy = _.escape(elt.definitions[0].definition);
    return elt;
};

exports.attachables = [];

exports.userTotalSpace = (name, callback) => {
    let totalSpace = 0;
    async.forEach(exports.attachable, (attachable, doneOne) => {
        attachable.aggregate(
            {$match: {"attachments.uploadedBy.username": name}},
            {$unwind: "$attachments"},
            {
                $group: {
                    _id: {uname: "$attachments.uploadedBy.username"},
                    totalSize: {$sum: "$attachments.filesize"}
                }
            },
            {$sort: {totalSize: -1}},
            (err, res) => {
                if (res.length > 0) {
                    totalSpace += res[0].totalSize;
                }
                doneOne();
            });
    }, () => callback(totalSpace));
};

exports.addFile = function (file, cb, streamDescription = null) {
    gfs.findOne({md5: file.md5}, (err, f) => {
        if (f) return cb(err, f, false);
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
};

exports.deleteFileById = (id, callback) => {
    gfs.remove({_id: id}, callback);
};

exports.getFile = function (user, id, res) {
    gfs.exist({_id: id}, function (err, found) {
        if (err || !found) {
            return res.status(404).send("File not found.");
        }
        gfs.findOne({_id: id}, function (err, file) {
            res.contentType(file.contentType);
            if (!file.metadata || !file.metadata.status || file.metadata.status === "approved" || authorizationShared.hasRole(user, "AttachmentReviewer"))
                gfs.createReadStream({_id: id}).pipe(res);
            else res.status(403).send("This file has not been approved yet.");
        });

    });
};

exports.updateOrg = function (org, res) {
    let id = org._id;
    delete org._id;
    Org.findOneAndUpdate({_id: id}, org, {new: true}, (err, found) => {
        if (err || !found) res.status(500).send('Could not update');
        else res.send();
    });
};

exports.getAllUsernames = callback => {
    User.find({}, {username: true, _id: false}, callback);
};

exports.generateTinyId = () => {
    return shortId.generate().replace(/-/g, "_");
};

exports.createMessage = (msg, cb) => {
    msg.states = [{
        action: "Filed",
        date: new Date(),
        comment: "cmnt"
    }];
    new Message(msg).save(cb);
};

exports.updateMessage = function (msg, callback) {
    let id = msg._id;
    delete msg._id;
    Message.updateOne({_id: id}, msg, callback);
};

// TODO this function name is not good
exports.getMessages = function (req, callback) {
    let authorRecipient = {
        "$and": [
            {
                "$or": [
                    {
                        "recipient.recipientType": "stewardOrg",
                        "recipient.name": {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    },
                    {
                        "recipient.recipientType": "user",
                        "recipient.name": req.user.username
                    }
                ]
            },
            {
                "states.0.action": null
            }
        ]
    };

    if (req.user.roles === null || req.user.roles === undefined) {
        consoleLog("user: " + req.user.username + " has null roles.");
        req.user.roles = [];
    }
    req.user.roles.forEach(function (r) {
        let roleFilter = {
            "recipient.recipientType": "role"
            , "recipient.name": r
        };
        authorRecipient["$and"][0]["$or"].push(roleFilter);
    });

    switch (req.params.type) {
        case "received":
            authorRecipient["$and"][1]["states.0.action"] = "Filed";
            break;
        case "sent":
            authorRecipient = {
                $or: [
                    {
                        "author.authorType": "stewardOrg",
                        "author.name": {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    },
                    {
                        "author.authorType": "user",
                        "author.name": req.user.username
                    }
                ]
            };
            break;
        case "archived":
            authorRecipient["$and"][1]["states.0.action"] = "Approved";
            break;
    }
    if (!authorRecipient) {
        callback("Type not specified!");
        return;
    }

    Message.find(authorRecipient, callback);
};

// cb(err)
exports.addUserRole = (username, role, cb) => {
    exports.userByName(username, (err, u) => {
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
};

// exports.usersByRole = function (role, callback) {
//     User.find({roles: role}, callback);
// };

exports.mailStatus = function (user, callback) {
    exports.getMessages({user: user, params: {type: "received"}}, callback);
};

// cb(err, item)
exports.fetchItem = function (module, tinyId, cb) {
    let db = daoManager.getDao(module);
    if (!db) {
        cb('Module has no database.');
        return;
    }
    (db.byTinyId || db.byId)(tinyId, cb);
};

exports.addToClassifAudit = function (msg) {
    let persistClassifRecord = function (err, elt) {
        if (!elt) return;
        msg.elements[0].eltType = eltShared.getModule(elt);
        msg.elements[0].name = eltShared.getName(elt);
        msg.elements[0].status = elt.registrationState.registrationStatus;
        new classificationAudit(msg).save();
    };
    daoManager.getDaoList().forEach(function (dao) {
        if (msg.elements[0]) {
            if (msg.elements[0]._id && dao.byId)
                dao.byId(msg.elements[0]._id, persistClassifRecord);
            if (msg.elements[0].tinyId && dao.eltByTinyId)
                dao.eltByTinyId(msg.elements[0].tinyId, persistClassifRecord);
        }
    });
};

exports.getClassificationAuditLog = function (params, callback) {
    classificationAudit.find({}, {elements: {$slice: 10}})
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(function (err, logs) {
            callback(err, logs);
        });
};

exports.getAllRules = function (cb) {
    ValidationRule.find().exec(function (err, rules) {
        cb(err, rules);
    });
};

exports.disableRule = function (params, cb) {
    exports.orgByName(params.orgName, function (err, org) {
        org.cdeStatusValidationRules.forEach(function (rule, i) {
            if (rule.id === params.rule.id) {
                org.cdeStatusValidationRules.splice(i, 1);
            }
        });
        org.save(cb);
    });
};

exports.enableRule = function (params, cb) {
    exports.orgByName(params.orgName, function (err, org) {
        delete params.rule._id;
        org.cdeStatusValidationRules.push(params.rule);
        org.save(cb);
    });
};

exports.sortArrayByArray = function (unSortArray, targetArray) {
    unSortArray.sort((a, b) => {
        let aId = a._id;
        let bId = b._id;
        let aIndex = _.findIndex(targetArray, aId);
        let bIndex = _.findIndex(targetArray, bId);
        return aIndex - bIndex;
    });
};
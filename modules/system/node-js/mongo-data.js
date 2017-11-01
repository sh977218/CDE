var schemas = require('./schemas')
    , mongoose = require('mongoose')
    , config = require('./parseConfig')
    , Grid = require('gridfs-stream')
    , connHelper = require('./connections')
    , session = require('express-session')
    , MongoStore = require('connect-mongo')(session)
    , shortid = require("shortid")
    , logging = require('../../system/node-js/logging.js')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , daoManager = require('./moduleDaoManager')
    , async = require('async')
    , _ = require('lodash')
;

var conn = connHelper.establishConnection(config.database.appData),
    Org = conn.model('Org', schemas.orgSchema),
    User = conn.model('User', schemas.userSchema),
    Message = conn.model('Message', schemas.message),
    MeshClassification = conn.model('meshClassification', schemas.meshClassification),
    ValidationRule = conn.model('ValidationRule', schemas.statusValidationRuleSchema),
    ClusterStatus = conn.model('ClusterStatus', schemas.clusterStatus),
    JobQueue = conn.model('JobQueue', schemas.jobQueue),
    Embeds = conn.model('Embed', schemas.embedSchema),
    Comment = conn.model('Comment', schemas.commentSchema),
    gfs = Grid(conn.db, mongoose.mongo),
    sessionStore = new MongoStore({
        mongooseConnection: conn,
        touchAfter: 3600
    });

exports.sessionStore = sessionStore;
exports.Message = Message;
exports.mongoose_connection = conn;
exports.sessionStore = sessionStore;
exports.Org = Org;
exports.User = User;
exports.MeshClassification = MeshClassification;
exports.Comment = Comment;
exports.JobQueue = JobQueue;

var fs_files = conn.model('fs_files', schemas.fs_files);
var classificationAudit = conn.model('classificationAudit', schemas.classificationAudit);

exports.jobStatus = function (type, cb) {
    JobQueue.findOne({type: type}, cb);
};
exports.updateJobStatus = function (type, status, cb) {
    JobQueue.update({type: type}, {status: status}, {upsert: true}, cb);
};
exports.removeJobStatus = function (type, cb) {
    JobQueue.remove({type: type}, cb);
};

exports.getClusterHostStatus = function (server, callback) {
    ClusterStatus.findOne({hostname: server.hostname, port: server.port}).exec(function (err, result) {
        callback(err, result);
    });
};

exports.getClusterHostStatuses = function (callback) {
    ClusterStatus.find({}, callback);
};

exports.updateClusterHostStatus = function (status, callback) {
    status.lastUpdate = new Date();
    ClusterStatus.update({port: status.port, hostname: status.hostname}, status, {upsert: true}, function (err) {
        if (err) {
            logging.errorLogger.error("Unable to retrieve state of host in cluster config.", err);
        }
        if (callback) callback(err);
    });
};

exports.findMeshClassification = function (query, cb) {
    MeshClassification.find(query, cb);
};

exports.addToViewHistory = function (elt, user) {
    if (!elt || !user) return;
    var updStmt = {
        viewHistory: {
            $each: [elt.tinyId]
            , $position: 0
            , $slice: 1000
        }
    };
    if (elt.formElements) {
        updStmt = {
            formViewHistory: {
                $each: [elt.tinyId]
                , $position: 0
                , $slice: 1000
            }
        };
    }
    User.update({'_id': user._id}, {$push: updStmt}).exec(function (err) {
        if (err) logging.errorLogger.error("Error: Cannot update viewing history", {
            origin: "cde.mongo-cde.addToViewHistory",
            stack: new Error().stack,
            details: {"cde": elt, user: user}
        });
    });
};

exports.embeds = {
    save: function (embed, cb) {
        if (embed._id) {
            var _id = embed._id;
            delete embed._id;
            Embeds.update({_id: _id}, embed, cb);
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

exports.org_autocomplete = function (name, callback) {
    Org.find({"name": new RegExp(name, 'i')}, function (err, orgs) {
        callback(orgs);
    });
};

exports.orgNames = function (callback) {
    Org.find({}, {name: true, _id: false}).exec(callback);
};

exports.userByName = function (name, callback) {
    User.findOne({'username': new RegExp('^' + name + '$', "i")}).exec(callback);
};
exports.usersByName = function (name, callback) {
    User.find({'username': new RegExp('^' + name + '$', "i")}, userProject).exec(callback);
};

exports.usersByPartialName = function (name, callback) {
    User.find({'username': new RegExp(name, 'i')}).exec(function (err, users) {
        for (var i = 0; i < users.length; i++) {
            delete users[i].password;
        }
        callback(err, users);
    });
};

exports.usernamesByIp = function (ip, callback) {
    User.find({"knownIPs": {$in: [ip]}}, {username: 1}).exec(function (err, usernames) {
        callback(usernames);
    });
};

let userProject = {password: 0};

exports.userById = function (id, callback) {
    User.findOne({'_id': id}, userProject).exec(callback);
};

exports.addUser = function (user, callback) {
    user.username = user.username.toLowerCase();
    new User(user).save(callback);
};

exports.siteadmins = function (callback) {
    User.find({'siteAdmin': true}).select('username email').exec(callback);
};

exports.orgAdmins = function (callback) {
    User.find({orgAdmin: {$not: {$size: 0}}}, callback);
};

exports.orgCurators = function (orgs, callback) {
    User.find().where("orgCurator").in(orgs).exec(callback);
};


exports.orgByName = function (orgName, callback) {
    Org.findOne({"name": orgName}, callback);
};


exports.listOrgs = function (callback) {
    Org.distinct('name', callback);
};

exports.listOrgsLongName = function (callback) {
    Org.find({}, {'_id': 0, 'name': 1, 'longName': 1}).exec(callback);
};

exports.listOrgsDetailedInfo = function (callback) {
    Org.find({}, {
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
    }).exec(callback);
};

exports.managedOrgs = function (callback) {
    Org.find().exec(function (err, orgs) {
        callback(orgs);
    });
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
    Org.findOne({"name": newOrgArg.name}).exec(function (err, found) {
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
            var newOrg = new Org(newOrgArg);
            newOrg.save(function () {
                res.send("Org Added");
            });
        }
    });
};

exports.removeOrg = function (id, callback) {
    Org.findOne({"_id": id}).remove().exec(callback);
};

exports.formatElt = function (elt) {
    if (elt) {
        if (elt.toObject) elt = elt.toObject();
        elt.stewardOrgCopy = elt.stewardOrg;
        elt.primaryNameCopy = _.escape(elt.naming[0].designation);
        elt.primaryDefinitionCopy = _.escape(elt.naming[0].definition);
    }
    return elt;
};

exports.userTotalSpace = function (Model, name, callback) {
    Model.aggregate(
        {$match: {"attachments.uploadedBy.username": name}},
        {$unwind: "$attachments"},
        {$group: {_id: {uname: "$attachments.uploadedBy.username"}, totalSize: {$sum: "$attachments.filesize"}}},
        {$sort: {totalSize: -1}}
        , function (err, res) {
            var result = 0;
            if (res.length > 0) {
                result = res[0].totalSize;
            }
            callback(result);
        });
};

exports.addFile = function (file, cb) {
    gfs.findOne({md5: file.md5}, function (err, f) {
        if (!f) {
            var streamDescription = {
                filename: file.filename
                , mode: 'w'
                , content_type: file.type
            };

            var writestream = gfs.createWriteStream(streamDescription);

            writestream.on('close', function (newFile) {
                cb(null, newFile);
            });
            writestream.on('error', cb);

            file.stream.pipe(writestream);
        } else {
            cb(err, f);
        }
    });
};

exports.addAttachment = function (file, user, comment, elt, cb) {

    var linkAttachmentToAdminItem = function (attachment, elt, newFileCreated, cb) {
        elt.attachments.push(attachment);
        elt.save(function (err) {
            if (cb) cb(attachment, newFileCreated, err);
        });
    };

    var attachment = {
        fileid: null
        , filename: file.originalname
        , filetype: file.mimetype
        , uploadDate: Date.now()
        , comment: comment
        , filesize: file.size
        , uploadedBy: {
            userId: user._id
            , username: user.username
        }
    };

    gfs.findOne({md5: file.md5}, function (err, f) {
        if (!f) {
            var streamDescription = {
                filename: attachment.filename
                , mode: 'w'
                , content_type: attachment.filetype
                , metadata: {
                    status: null
                }
            };


            if (file.scanned) streamDescription.metadata.status = "scanned";
            else if (user.roles && user.roles.filter((r) => {
                    return r === "AttachmentReviewer";
                }).length > 0) {
                streamDescription.metadata.status = 'approved';
            } else streamDescription.metadata.status = "uploaded";

            var writestream = gfs.createWriteStream(streamDescription);

            writestream.on('close', function (newfile) {
                attachment.fileid = newfile._id;
                if (!authorizationShared.hasRole(user, "AttachmentReviewer")) {
                    attachment.pendingApproval = true;
                }
                attachment.scanned = file.scanned;
                linkAttachmentToAdminItem(attachment, elt, true, cb);
            });

            file.stream.pipe(writestream);
        } else {
            attachment.fileid = f._id;
            linkAttachmentToAdminItem(attachment, elt, false, cb);
        }
    });

};

exports.deleteFileById = function (id, cb) {
    gfs.remove({_id: id}, function (err) {
        if (cb) cb(err);
    });
};

exports.alterAttachmentStatus = function (id, status, cb) {
    fs_files.update({_id: id}, {$set: {"metadata.status": status}}).exec(function (err) {
        if (cb) cb(err);
    });
    if (status === "approved") {
        daoManager.getDaoList().forEach(function (dao) {
            if (dao.setAttachmentApproved)
                dao.setAttachmentApproved(id);
        });
    }
};

exports.removeAttachmentIfNotUsed = function (id, callback) {
    async.map(daoManager.getDaoList(), function (dao, cb) {
        if (dao.fileUsed) dao.fileUsed(id, cb);
    }, function (err, results) {
        if (results.indexOf(true) === -1)
            exports.deleteFileById(id, callback);
    });
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
    var id = org._id;
    delete org._id;
    Org.findOneAndUpdate({_id: id}, org, {new: true}, function (err, found) {
        if (found) {
            res.send('Org has been updated.');
        } else {
            res.send('Org does not exist.');
        }
    });
};

exports.getAllUsernames = function (callback) {
    User.find({}, {username: true, _id: false}).exec(callback);
};

exports.generateTinyId = function () {
    return shortid.generate().replace(/-/g, "_");
};

exports.createMessage = function (msg, cb) {
    msg.states = [{
        action: "Filed"
        , date: new Date()
        , comment: "cmnt"
    }];
    var message = new Message(msg);
    message.save(cb);
};

exports.updateMessage = function (msg, cb) {
    var id = msg._id;
    delete msg._id;
    Message.update({_id: id}, msg).exec(cb);
};

// TODO this function name is not good
exports.getMessages = function (req, callback) {
    var authorRecipient = {
        "$and": [
            {
                "$or": [
                    {
                        "recipient.recipientType": "stewardOrg"
                        , "recipient.name": {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    }
                    , {
                        "recipient.recipientType": "user"
                        , "recipient.name": req.user.username
                    }
                ]
            },
            {
                "states.0.action": null
            }
        ]
    };

    req.user.roles.forEach(function (r) {
        var roleFilter = {
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
                        "author.authorType": "stewardOrg"
                        , "author.name": {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    }
                    , {
                        "author.authorType": "user"
                        , "author.name": req.user.username
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

    Message.find(authorRecipient).where().exec(callback);
};

exports.addUserRole = function (request, cb) {
    exports.userByName(request.username, function (err, u) {
        u.roles.push(request.role);
        u.save(cb);
    });
};

exports.usersByRole = function (role, cb) {
    User.find({roles: role}).exec(function (err, users) {
        cb(err, users);
    });
};

exports.mailStatus = function (user, cb) {
    exports.getMessages({user: user, params: {type: "received"}}, function (err, mail) {
        cb(err, mail.length);
    });
};

exports.addToClassifAudit = function (msg) {
    var persistClassifRecord = function (err, elt) {
        if (!elt) return;
        msg.elements[0].eltType = elt.formElements ? 'form' : 'cde';
        msg.elements[0].name = elt.naming[0].designation;
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
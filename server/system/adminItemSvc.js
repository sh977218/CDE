const mongo_data_system = require('./mongo-data');
const async = require('async');
const auth = require('./authorization');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const fs = require('fs');
const md5 = require("md5-file");
const clamav = require('clamav.js');
const config = require('./parseConfig');
const logging = require('./logging');
const streamifier = require('streamifier');
const ioServer = require("./ioServer");
const usersrvc = require('./usersrvc');
const dbLogger = require('../log/dbLogger');
const classificationNode = require('./classificationNode');
const classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared.js');
const mongo_cde = require('../cde/mongo-cde');
const deValidator = require('@std/esm')(module)('../../shared/de/deValidator');

exports.save = function (req, res, dao, cb) {
    var elt = req.body;
    deValidator.wipeDatatype(elt);
    if (req.isAuthenticated()) {
        if (!elt._id) {
            if (!elt.stewardOrg.name) {
                res.send("Missing Steward");
            } else {
                if (req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0 &&
                    req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 && !req.user.siteAdmin) {
                    res.status(403).send("not authorized");
                } else if (elt.registrationState && elt.registrationState.registrationStatus) {
                    if ((elt.registrationState.registrationStatus === "Standard" ||
                        elt.registrationState.registrationStatus === " Preferred Standard") && !req.user.siteAdmin) {
                        return res.status(403).send("Not authorized");
                    }
                    return dao.create(elt, req.user, function (err, savedItem) {
                        res.send(savedItem);
                    });
                } else {
                    return dao.create(elt, req.user, function (err, savedItem) {
                        res.send(savedItem);
                    });
                }
            }
        } else {
            return dao.byId(elt._id, function (err, item) {
                if (item.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.indexOf(item.stewardOrg.name) < 0 &&
                    req.user.orgAdmin.indexOf(item.stewardOrg.name) < 0 && !req.user.siteAdmin) {
                    res.status(403).send("Not authorized");
                } else {
                    if ((item.registrationState.registrationStatus === "Standard" ||
                        item.registrationState.registrationStatus === "Preferred Standard") && !req.user.siteAdmin) {
                        res.status(403).send("This record is already standard.");
                    } else {
                        if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") &&
                            (item.registrationState.registrationStatus === "Standard" ||
                                item.registrationState.registrationStatus === "Preferred Standard") && !req.user.siteAdmin
                        ) {
                            res.status(403).send("Not authorized");
                        } else {
                            mongo_data_system.orgByName(item.stewardOrg.name, function (err, org) {
                                var allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
                                if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1) {
                                    res.status(403).send("Not authorized");
                                } else {
                                    return dao.update(elt, req.user, function (err, response) {
                                        if (err) res.status(400).send();
                                        res.send(response);
                                        if (cb) cb();
                                    });
                                }
                            });
                        }
                    }
                }
            });
        }
    } else {
        res.status(403).send("You are not authorized to do this.");
    }
};

exports.setAttachmentDefault = function (req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function (err, elt) {
        if (err) {
            logging.expressLogger.info(err);
            return res.status(500).send("ERROR - attachment as default - cannot check ownership");
        }
        var state = req.body.state;
        for (var i = 0; i < elt.attachments.length; i++) {
            elt.attachments[i].isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        elt.save(function (err) {
            if (err) {
                res.send("error: " + err);
            } else {
                res.send(elt);
            }
        });
    });
};

exports.scanFile = function (stream, res, cb) {
    clamav.createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, function (err, object, malicious) {
        if (err) return cb(false);
        if (malicious) return res.status(431).send("The file probably contains a virus.");
        cb(true);
    });
};

exports.addAttachment = function (req, res, dao) {
    if (!req.files.uploadedFiles) {
        res.status(400).send('No files to attach.');
        return;
    }

    var fileBuffer = req.files.uploadedFiles.buffer;
    var stream = streamifier.createReadStream(fileBuffer);
    var streamFS = streamifier.createReadStream(fileBuffer);
    var streamFS1 = streamifier.createReadStream(fileBuffer);
    exports.scanFile(stream, res, function (scanned) {
        req.files.uploadedFiles.scanned = scanned;
        auth.checkOwnership(dao, req.body.id, req, function (err, elt) {
            if (err) return res.status(500).send("ERROR - add attachment ownership");
            dao.userTotalSpace(req.user.username, function (totalSpace) {
                if (totalSpace > req.user.quota) {
                    res.send({message: "You have exceeded your quota"});
                } else {
                    var file = req.files.uploadedFiles;
                    file.stream = streamFS1;

                    //store it to FS here
                    var writeStream = fs.createWriteStream(file.path);
                    streamFS.pipe(writeStream);
                    writeStream.on('finish', function () {
                        md5(file.path, function (err, hash) {
                            file.md5 = hash;
                            mongo_data_system.addAttachment(file, req.user, "some comment", elt, function (attachment, requiresApproval) {
                                if (requiresApproval) exports.createApprovalMessage(
                                    req.user, "AttachmentReviewer", "AttachmentApproval", attachment);
                                res.send(elt);
                            });
                        });
                    });
                }
            });
        });
    });
};

exports.removeAttachment = function (req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function (err, elt) {
        if (err) return res.status(500).send("ERROR - remove attachment ownership");
        let fileid = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);

        elt.save(function (err) {
            if (err) return res.status(500).send("ERROR - cannot save attachment");
            res.send(elt);
            mongo_data_system.removeAttachmentIfNotUsed(fileid);
        });
    });
};

exports.removeAttachmentLinks = function (id, collection) {
    collection.update({"attachments.fileid": id}, {$pull: {"attachments": {"fileid": id}}});
};

exports.createApprovalMessage = function (user, role, type, details) {
    let message = {
        recipient: {recipientType: "role", name: role},
        author: {authorType: "user", name: user.username},
        date: new Date(),
        type: type,
        states: [{
            action: String,
            date: new Date(),
            comment: String
        }]
    };

    if (type === "CommentApproval") message.typeCommentApproval = details;
    if (type === "AttachmentApproval") message.typeAttachmentApproval = details;

    mongo_data_system.usersByRole(role, (err, users) => {
        mongo_data_system.createMessage(message);
    });
};

exports.updateCommentStatus = function (req, res, status) {
    mongo_data_system.Comment.findOne({_id: req.body.commentId}, function (err, comment) {
        if (err) return res.status(404).send("Comment not found");
        if (comment) {
            comment.status = status;
            comment.save(function (err) {
                if (err) {
                    logging.errorLogger.error("Error: Cannot Update comment.", {
                        origin: "system.adminItemSvc.removeComment",
                        stack: new Error().stack
                    });
                    res.status(500).send("ERROR - cannot update comment");
                } else {
                    ioServer.ioServer.of("/comment").emit('commentUpdated', {username: req.user.username});
                    res.send({message: "Saved."});
                }
            });
        } else {
            res.status(404).send("Comment not found")
        }
    });
};
exports.updateReplyStatus = function (req, res, status) {
    let replyId = req.body.replyId;
    mongo_data_system.Comment.findOne({'replies._id': replyId}, function (err, comment) {
        if (err) return res.status(404).send("Reply not found");
        let reply;
        comment.replies.forEach(function (r) {
            if (r._id.toString() === replyId) {
                reply = r;
            }
        });
        if (reply) {
            reply.status = status;
            comment.save(function (err) {
                if (err) {
                    logging.errorLogger.error("Error: Cannot Update comment.", {
                        origin: "system.adminItemSvc.removeComment",
                        stack: new Error().stack
                    });
                    res.status(500).send("ERROR - cannot update comment");
                } else {
                    ioServer.ioServer.of("/comment").emit('commentUpdated', {username: req.user.username});
                    res.send({message: "Saved."});
                }
            });
        } else {
            res.status(404).send("Reply not found")
        }
    });
};

exports.declineComment = function (req, res) {
    if (!req.isAuthenticated() || !authorizationShared.hasRole(req.user, "CommentReviewer")) {
        res.status(403).send("You are not authorized to decline this comment.");
    }
    mongo_data_system.Comment.findOne({_id: req.body.commentId}, function (err, comment) {
        if (err || !comment) return res.status(404).send("Comment not found");

        if (req.body.replyIndex !== undefined) {
            if (comment.replies && comment.replies.length > replyIndex) {
                comment.replies.splice(req.body.replyIndex, 1);
                comment.save(function (err) {
                    if (err) res.status(500).send();
                    res.send("Reply declined");
                });
            } else {
                res.status(401).send();
            }
        } else {
            comment.remove(function (err) {
                if (err) res.status(500).send();
                return res.send("Comment declined");
            });
        }
    });
};

exports.approveComment = function (req, res) {
    if (!req.isAuthenticated() || !authorizationShared.hasRole(req.user, "CommentReviewer")) {
        res.status(403).send("You are not authorized to approve this comment.");
    }
    mongo_data_system.Comment.findOne({_id: req.body.commentId}, function (err, comment) {
        if (err || !comment) return res.status(404).send("Comment not found");

        if (req.body.replyIndex !== undefined) {
            if (comment.replies && comment.replies.length > req.body.replyIndex) {
                comment.replies[req.body.replyIndex].pendingApproval = false;
            }
            comment.markModified("replies");
        } else {
            comment.pendingApproval = false;
        }
        comment.save(function (err) {
            if (err) res.status(500).send();
            res.send("Approved");
        });

    });
};

exports.bulkAction = function (ids, action, cb) {
    var eltsTotal = ids.length;
    var eltsProcessed = 0;
    async.each(ids, function (id, doneOne) {
            action(id, function () {
                eltsProcessed++;
                doneOne(null, eltsProcessed);
            });
        },
        function () {
            if (eltsTotal === eltsProcessed) cb(null);
            else cb("Task not performed completely!");
        }
    );
};

exports.hideProprietaryIds = function (elt) {
    if (elt && elt.ids) {
        var blackList = [
            "LOINC"
        ];
        elt.ids.forEach(function (id) {
            if (blackList.indexOf(id.source) > -1) {
                id.id = "Login to see value.";
                id.source = "(" + id.source + ")";
            }
        });
    }
};


exports.bulkClassifyCdesStatus = {};
exports.bulkClassifyCdes = function (user, eltId, elements, body, cb) {
    if (!exports.bulkClassifyCdesStatus[user.username + eltId]) {
        exports.bulkClassifyCdesStatus[user.username + eltId] = {
            numberProcessed: 0,
            numberTotal: elements.length
        }
    }
    async.forEachSeries(elements, function (element, doneOneElement) {
        let classifReq = {
            orgName: body.orgName,
            categories: body.categories,
            tinyId: element.id,
            version: element.version
        };
        classificationNode.eltClassification(classifReq, classificationShared.actions.create, mongo_cde, function (err) {
            exports.bulkClassifyCdesStatus[user.username + eltId].numberProcessed++;
            doneOneElement();
        });
    }, function doneAllElement(errs) {
        if (cb) cb(errs);
    })
};

exports.resetBulkClassifyCdesStatus = function (statusObjId) {
    delete exports.bulkClassifyCdesStatus[statusObjId];
};
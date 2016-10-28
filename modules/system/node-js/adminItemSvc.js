var mongo_data_system = require('../../system/node-js/mongo-data')
    , async = require('async')
    , auth = require('./authorization')
    , authorizationShared = require('../../system/shared/authorizationShared')
    , fs = require('fs')
    , md5 = require("md5-file")
    , clamav = require('clamav.js')
    , config = require('./parseConfig')
    , logging = require('./logging')
    , email = require('../../system/node-js/email')
    , streamifier = require('streamifier')
    ;

exports.save = function (req, res, dao, cb) {
    var elt = req.body;
    if (req.isAuthenticated()) {
        if (!elt._id) {
            if (!elt.stewardOrg.name) {
                res.send("Missing Steward");
            } else {
                if (req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0 &&
                    req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 &&
                    !req.user.siteAdmin) {
                    res.status(403).send("not authorized");
                } else if (elt.registrationState && elt.registrationState.registrationStatus) {
                    if ((elt.registrationState.registrationStatus === "Standard" ||
                        elt.registrationState.registrationStatus === " Preferred Standard") &&
                        !req.user.siteAdmin) {
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
                    req.user.orgAdmin.indexOf(item.stewardOrg.name) < 0 &&
                    !req.user.siteAdmin) {
                    res.status(403).send("Not authorized");
                } else {
                    if ((item.registrationState.registrationStatus === "Standard" ||
                        item.registrationState.registrationStatus === "Preferred Standard") &&
                        !req.user.siteAdmin) {
                        res.status(403).send("This record is already standard.");
                    } else {
                        if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") &&
                            (item.registrationState.registrationStatus === "Standard" ||
                            item.registrationState.registrationStatus === "Preferred Standard") &&
                            !req.user.siteAdmin
                        ) {
                            res.status(403).send("Not authorized");
                        } else {
                            mongo_data_system.orgByName(item.stewardOrg.name, function (org) {
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
            return res.send(err);
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
    var fileBuffer = req.files.uploadedFiles.buffer;
    var stream = streamifier.createReadStream(fileBuffer);
    var streamFS = streamifier.createReadStream(fileBuffer);
    var streamFS1 = streamifier.createReadStream(fileBuffer);
    exports.scanFile(stream, res, function (scanned) {
        req.files.uploadedFiles.scanned = scanned;
        auth.checkOwnership(dao, req.body.id, req, function (err, elt) {
            if (err) return res.send(err);
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
                        md5.async(file.path, function (hash) {
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
        if (err) {
            return res.send(err);
        }
        var fileid = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);

        elt.save(function (err) {
            if (err) {
                res.send("error: " + err);
            } else {
                res.send(elt);
                mongo_data_system.removeAttachmentIfNotUsed(fileid);
            }
        });
    });
};

exports.removeAttachmentLinks = function (id, collection) {
    collection.update({"attachments.fileid": id}, {$pull: {"attachments": {"fileid": id}}});
};

exports.createApprovalMessage = function (user, role, type, details) {
    var message = {
        recipient: {recipientType: "role", name: role}
        , author: {authorType: "user", name: user.username}
        , date: new Date()
        , type: type
        , states: [{
            action: String
            , date: new Date()
            , comment: String
        }]
    };

    var emailContent = {
        subject: "CDE Message Pending"
        , body: "You have a pending message in NLM CDE application."
    };

    if (type === "CommentApproval") message.typeCommentApproval = details;
    if (type === "AttachmentApproval") message.typeAttachmentApproval = details;

    mongo_data_system.usersByRole(role, function (err, users) {
        email.emailUsers(emailContent, users);
        mongo_data_system.createMessage(message);
    });
};

exports.addComment = function (req, res, dao) {
    if (req.isAuthenticated()) {
        var idRetrievalFunc = dao.eltByTinyId ? dao.eltByTinyId : dao.byId;
        idRetrievalFunc(req.body.element.eltId, function (err, elt) {
            if (!elt || err) {
                res.status(404).send("Element does not exist.");
            } else {
                var comment = new mongo_data_system.Comment({
                    user: req.user._id
                    , username: req.user.username
                    , created: new Date().toJSON()
                    , text: req.body.comment
                    , element: {
                        eltType: dao.type,
                        eltId: req.body.element.eltId
                    }
                });
                if (!authorizationShared.canComment(req.user)) {
                    comment.pendingApproval = true;
                    var details = {
                        element: {
                            eltId: req.body.element.eltId,
                            name: elt.naming[0].designation, eltType: dao.type
                        },
                        comment: {
                            commentId: comment._id,
                            text: req.body.comment
                        }
                    };
                    exports.createApprovalMessage(req.user, "CommentReviewer", "CommentApproval", details);
                }
               comment.save(function (err) {
                    if (err) {
                        logging.errorLogger.error("Error: Cannot add comment.", {
                            origin: "system.adminItemSvc.addComment",
                            stack: new Error().stack
                        });
                        res.status(500).send("There was an issue saving this comment.");
                    } else {
                        var message = "Comment added.";
                        if (comment.pendingApproval) message += " Approval required."
                        res.send({message: message});
                    }
                });
            }
        });
    } else {
        res.status(403).send({message: "You are not authorized."});
    }
};

exports.replyToComment = function (req, res) {
    if (req.isAuthenticated()) {
        mongo_data_system.Comment.findOne({_id: req.body.commentId}, function (err, comment) {
            if (err) {
                return res.status(404).send("Comment not found");
            }
            var reply = {
                user: req.user._id,
                username: req.user.username,
                created: new Date().toJSON(),
                text: req.body.reply
            };
            if (!comment.replies) comment.replies = [];
            if (!authorizationShared.canComment(req.user)) {
                reply.pendingApproval = true;
                var details = {
                    element: {
                        tinyId: comment.element.eltId,
                        name: req.body.eltName
                    },
                    comment: {
                        commentId: comment._id,
                        replyIndex: comment.replies.length,
                        text: req.body.reply
                    }
                };
                exports.createApprovalMessage(req.user, "CommentReviewer", "CommentApproval", details);
            }
            comment.replies.push(reply);
            comment.save(function (err) {
                if (err) {
                    logging.errorLogger.error("Error: Cannot add comment.", {
                        origin: "system.adminItemSvc.addComment",
                        stack: new Error().stack
                    });
                    res.status(500).send(err);
                } else {
                    res.send({message: "Reply added"});
                }
            });
        });
    } else {
        res.status(403).send("You are not authorized.");
    }
};

exports.removeComment = function (req, res, dao) {
    if (req.isAuthenticated()) {
        mongo_data_system.Comment.findOne({_id: req.body.commentId}, function (err, comment) {
            if (err) {
                return res.status(404).send("Comment not found");
            }

            var removedComment;
            if (req.body.replyId) {
                if (comment.replies) {
                    comment.replies.forEach(r => {
                        if (r._id.toString() === req.body.replyId) {
                            removedComment = r;
                        }
                    });
                }
            } else {
                removedComment = comment;
            }
            if (removedComment) {
                removedComment.status = "deleted";
                var idRetrievalFunc = dao.eltByTinyId ? dao.eltByTinyId : dao.byId;
                idRetrievalFunc(comment.element.eltId, function (err, elt) {
                    if (err || !elt) return res.status(404).send("elt not found");
                    if (req.user.username === removedComment.username ||
                        (elt.stewardOrg && (req.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1)) ||
                        (elt.owner && (elt.owner.username === req.user.username)) ||
                        req.user.siteAdmin
                    ) {
                        comment.save(function (err) {
                            if (err) {
                                logging.errorLogger.error("Error: Cannot remove " + removedComment.type + ".", {
                                    origin: "system.adminItemSvc.removeComment",
                                    stack: new Error().stack
                                });
                                res.status(500).send(err);
                            } else {
                                res.send({message: "Comment removed"});
                            }
                        });
                    } else {
                        res.send({message: "You can only remove " + removedComment.type + " you own."});
                    }
                });

            } else {
                res.status(404).send("Comment not found")
            }
        });
    } else {
        res.status(403).send("You are not authorized.");
    }
};

exports.updateCommentStatus = function (req, res, status) {
    if (req.isAuthenticated()) {
        mongo_data_system.Comment.findOne({_id: req.body.commentId}, function (err, comment) {
            if (err) return res.status(404).send("Comment not found");

            var updatedComment;
            if (req.body.replyId) {
                if (comment.replies) {
                    comment.replies.forEach(function (r) {
                        if (r._id.toString() === req.body.replyId) {
                            updatedComment = r;
                        }
                    });
                }
            } else {
                updatedComment = comment;
            }
            if (updatedComment) {
                updatedComment.status = status;
                comment.save(function (err) {
                    if (err) {
                        logging.errorLogger.error("Error: Cannot Update comment.", {
                            origin: "system.adminItemSvc.removeComment",
                            stack: new Error().stack
                        });
                        res.status(500).send(err);
                    } else {
                        res.send({message: "Saved."});
                    }
                });
            } else {
                res.status(404).send("Comment not found")
            }
        });
    } else {
        res.status(403).send("You are not authorized.");
    }
};

exports.declineComment = function (req, res) {
    if (!req.isAuthenticated() || !authorizationShared.hasRole(req.user, "CommentReviewer")) {
        res.status(403).send("You are not authorized to approve a comment.");
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
            comment.remove(function(err) {
                if (err) res.status(500).send();
                return res.send("Comment declined");
            })
        }
    });
};

exports.approveComment = function (req, res) {
    if (!req.isAuthenticated() || !authorizationShared.hasRole(req.user, "CommentReviewer")) {
        res.status(403).send("You are not authorized to approve a comment.");
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


exports.acceptFork = function (req, res, dao) {
    if (req.isAuthenticated()) {
        if (!req.body.id) {
            res.send("Don't know what to accept");
        } else {
            return dao.byId(req.body.id, function (err, fork) {
                if (fork.archived === true) {
                    return res.send("Cannot accept an archived element");
                }
                dao.isForkOf(fork, function (err, orig) {

                    if (!orig) {
                        return res.send("Not a fork");
                    }
                    if (req.user.orgCurator.indexOf(orig.stewardOrg.name) < 0 &&
                        req.user.orgAdmin.indexOf(orig.stewardOrg.name) < 0 &&
                        !req.user.siteAdmin) {
                        res.status(403).send("not authorized");
                    } else {
                        if ((orig.registrationState.registrationStatus === "Standard" ||
                            orig.registrationState.registrationStatus === "Preferred Standard") &&
                            !req.user.siteAdmin) {
                            res.send("This record is already standard.");
                        } else {
                            if ((orig.registrationState.registrationStatus !== "Standard" &&
                                orig.registrationState.registrationStatus !== " Preferred Standard") &&
                                (orig.registrationState.registrationStatus === "Standard" ||
                                orig.registrationState.registrationStatus === "Preferred Standard") &&
                                !req.user.siteAdmin
                            ) {
                                res.status(403).send("not authorized");
                            } else {
                                return dao.acceptFork(fork, orig, function (err, response) {
                                    res.send(response);
                                });
                            }
                        }
                    }
                });
            });
        }
    } else {
        res.status(403).send("You are not authorized to do this.");
    }
};

exports.fork = function (req, res, dao) {
    if (req.isAuthenticated()) {
        if (!req.body.id) {
            res.send("Don't know what to fork");
        } else {
            return dao.byId(req.body.id, function (err, item) {
                if (item.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.length < 0 &&
                    req.user.orgAdmin.length < 0 &&
                    !req.user.siteAdmin) {
                    res.status(403).send("not authorized");
                } else {
                    item.stewardOrg.name = req.body.org;
                    item.changeNote = req.body.changeNote;
                    return dao.fork(item.toObject(), req.user, function (err, response) {
                        if (!err) res.send(response);
                        else res.status(403).send(err);
                    });
                }
            });
        }
    } else {
        res.status(403).send("You are not authorized to do this.");
    }
};

exports.forkRoot = function (req, res, dao) {
    dao.isForkOf(req.params.tinyId, function (err, cdes) {
        if (!cdes || cdes.length !== 1) {
            res.send("Not a regular fork");
        } else {
            res.send(cdes[0]);
        }
    });
};

exports.bulkAction = function (ids, action, cb) {
    var eltsTotal = ids.length;
    var eltsProcessed = 0;
    async.each(ids,
        function (id, cb) {
            action(id, function () {
                eltsProcessed++;
                cb();
            });
        },
        function () {
            if (eltsTotal === eltsProcessed) cb();
            else cb("Task not performed completely!");
        }
    );
};

exports.hideProprietaryIds = function(elt) {
    if (elt && elt.ids) {
        var blackList = [
            "LOINC"
        ];
        elt.ids.forEach(function(id) {
            if (blackList.indexOf(id.source) > -1) {
                id.id = "Login to see value.";
                id.source = "(" + id.source + ")";
            }
        });
    }
};

exports.removeAttachmentLinks = function (id, collection) {
    collection.update(
        {"attachments.fileid": id}
        , {
            $pull: {
                "attachments": {"fileid": id}
            }
        }
        , {multi: true}).exec();
};

exports.setAttachmentApproved = function (id, collection) {
    collection.update(
        {"attachments.fileid": id}
        , {
            $unset: {
                "attachments.$.pendingApproval": ""
            }
        }
        , {multi: true}).exec();
};

exports.fileUsed = function (id, collection, cb) {
    collection.find({"attachments.fileid": id}).count().exec(function (err, count) {
        cb(err, count > 0);
    });
};
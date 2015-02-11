var mongo_data_system = require('../../system/node-js/mongo-data')
    , classificationShared = require('../shared/classificationShared')
    , classificationNode = require('./classificationNode')
    , async = require('async')
    , auth = require('./authorization.js')
    , authorizationShared = require('../../system/shared/authorizationShared')
;


exports.save = function(req, res, dao) {
    var elt = req.body;
    if (req.isAuthenticated()) {
        if (!elt._id) {
            if (!elt.stewardOrg.name) {
                res.send("Missing Steward");
            } else {
                if (req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0
                        && req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0
                        && !req.user.siteAdmin) {
                    res.status(403).send("not authorized");
                } else if (elt.registrationState && elt.registrationState.registationStatus) {
                    if ((elt.registrationState.registrationStatus !== "Standard" && elt.registrationState.registrationStatus !== " Preferred Standard")
                            && !req.user.siteAdmin)
                        {
                            return res.status(403).send("Not authorized");
                        }
                } else {
                    return dao.create(elt, req.user, function(err, savedItem) {
                        res.send(savedItem);
                    });
                }
            }
        } else {
            return dao.byId(elt._id, function(err, item) {
                if (item.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.indexOf(item.stewardOrg.name) < 0
                        && req.user.orgAdmin.indexOf(item.stewardOrg.name) < 0
                        && !req.user.siteAdmin) {
                    res.status(403).send("Not authorized");
                } else {
                    if ((item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard")
                            && !req.user.siteAdmin) {
                        res.status(403).send("This record is already standard.");
                    } else {
                        if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") &&
                                (item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard")
                                && !req.user.siteAdmin
                                )
                        {
                            res.status(403).send("Not authorized");
                        } else {
                            mongo_data_system.orgByName(item.stewardOrg.name, function(org) {
                                var allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
                                if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1) {
                                    res.status(403).send("Not authorized");
                                } else {
                                    return dao.update(elt, req.user, function(err, response) {
                                        res.send(response);
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

exports.setAttachmentDefault = function(req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function(err, elt) {
        if (err) {
            logging.expressLogger.info(err);
            return res.send(err);
        }
        var state = req.body.state;
        for (var i = 0; i < elt.attachments.length; i++) {
            elt.attachments[i].isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        elt.save(function(err) {
            if (err) {
                res.send("error: " + err);
            } else {
                res.send(elt);
            }
        });
    });
}

exports.addAttachment = function(req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function(err, elt) {
        if (err) return res.send(err);
        dao.userTotalSpace(req.user.username, function(totalSpace) {
            if (totalSpace > req.user.quota) {
                res.send({message: "You have exceeded your quota"});
            } else {
                mongo_data_system.addAttachment(req.files.uploadedFiles, req.user, "some comment", elt, function() {
                    res.send(elt);            
                });                                            
            }
        });
    });
};

exports.removeAttachment = function(req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function(err, elt) {
        if (err) {
            return res.send(err);
        }
        elt.attachments.splice(req.body.index, 1);
        elt.save(function(err) {
            if (err) {
                res.send("error: " + err);
            } else {
                res.send(elt);
            }
        });
    });
};

exports.addComment = function(req, res, dao) {
    if (req.isAuthenticated()) {
        dao.eltByTinyId(req.body.element.tinyId, function(err, elt) {
            if (!elt || err) {
                res.status(404).send("Element does not exist.");
            } else {
                var comment = {
                    user: req.user._id
                    , username: req.user.username
                    , created: new Date().toJSON()
                    , text: req.body.comment
                };
                if (!authorizationShared.hasRole(req.user, "CommentEditor")) {
                    comment.pendingApproval = true;
                    var message = {
                        recipient: {recipientType: "role", name: "CommentCurator"}
                        , author: {authorType: "user", name: req.user.username}
                        , date: new Date()
                        , type: "CommentApproval"
                        , typeCommentApproval: {
                            element: {tinyId: req.body.element.tinyId}
                            , comment: {index: elt.comments.length}
                        }
                        , states: [{
                            action: String
                            , date: Date
                            , comment: String
                        }]                          
                    };
                    mongo_data_system.createMessage(message);
                }
                elt.comments.push(comment);
                elt.save(function(err) {
                    if (err) {
                        res.send(err);
                        return;
                    } else {
                        return res.send({message: "Comment added", elt: elt});
                    }
                });
            }
        });
    } else {
        res.send({message: "You are not authorized."});                   
    }
};

exports.removeComment = function(req, res, dao) {
    if (req.isAuthenticated()) {
        dao.eltByTinyId(req.body.element.tinyId, function (err, elt) {
            if (err) {
                res.status(404).send("Element does not exist.");
            }
            elt.comments.forEach(function(comment, i){
                if (comment._id == req.body.commentId) {
                    if( req.user.username === comment.username || 
                        (req.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1) ||
                        req.user.siteAdmin
                    ) {
                        elt.comments.splice(i, 1);
                        elt.save(function (err) {
                           if (err) {
                               res.send({message: err});
                           } else {
                               res.send({message: "Comment removed", elt: elt});
                           }
                        });                        
                    } else {
                        res.send({message: "You can only remove comments you own."});
                    }
                }
            });
        });
    } else {
        res.send("You are not authorized.");                   
    }
};

exports.acceptFork = function(req, res, dao) {
    if (req.isAuthenticated()) {
        if (!req.body.id) {
                res.send("Don't know what to accept");
        } else {
            return dao.byId(req.body.id, function(err, fork) {
                if (fork.archived === true) {
                    return res.send("Cannot accept an archived element");
                }
                dao.isForkOf(fork.tinyId, function(err, origs) {
                    if (origs.length !== 1) {
                        return res.send("Not a fork");
                    } 
                    var orig = origs[0];
                    if (req.user.orgCurator.indexOf(orig.stewardOrg.name) < 0
                            && req.user.orgAdmin.indexOf(orig.stewardOrg.name) < 0
                            && !req.user.siteAdmin) {
                        res.status(403).send("not authorized");
                    } else {
                        if ((orig.registrationState.registrationStatus === "Standard" || orig.registrationState.registrationStatus === "Preferred Standard")
                                && !req.user.siteAdmin) {
                            res.send("This record is already standard.");
                        } else {
                            if ((orig.registrationState.registrationStatus !== "Standard" && orig.registrationState.registrationStatus !== " Preferred Standard") &&
                                    (orig.registrationState.registrationStatus === "Standard" || orig.registrationState.registrationStatus === "Preferred Standard")
                                    && !req.user.siteAdmin
                                    )
                            {
                                res.status(403).send("not authorized");
                            } else {
                                return dao.acceptFork(fork, orig, function(err, response) {
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

exports.fork = function(req, res, dao) {
    if (req.isAuthenticated()) {
        if (!req.body.id) {
            res.send("Don't know what to fork");
        } else {
            return dao.byId(req.body.id, function(err, item) {
                if (item.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.length < 0
                        && req.user.orgAdmin.length < 0
                        && !req.user.siteAdmin) {
                    res.status(403).send("not authorized");
                } else {
                    item.stewardOrg.name = req.body.org;
                    item.changeNote = req.body.changeNote;
                    return dao.fork(item, req.user, function(err, response) {
                        res.send(response);
                    });
                }
            });
        }
    } else {
        res.status(403).send("You are not authorized to do this.");
    }
};

exports.forkRoot = function(req, res, dao) {
    dao.isForkOf(req.params.tinyId, function(err, cdes) {
        if (cdes.length !== 1) {
            res.send("Not a regular fork");
        } else {
            res.send(cdes[0]);
        }
    });
};

exports.bulkAction = function(ids, action, cb) {       
        var eltsTotal = ids.length;
        var eltsProcessed = 0;    
        async.each(ids,
            function(id, cb){
                action(id, function() {
                    eltsProcessed++;
                    cb();
                });
            },
            function(err){
                if (eltsTotal === eltsProcessed) cb();
                else cb("Task not performed completely!");   
            }
        );
};

exports.allPropertiesKeys = function(req, res, dao) {
    dao.allPropertiesKeys(function(err, keys) {
        if (err) res.status(500).send("Unexpected Error");
        else {
            res.send(keys);
        }
    });
};

exports.hideUnapprovedComments = function(adminItem) {
    adminItem.comments.forEach(function(c) {
        if (c.pendingApproval) c.text = "This comment is pending approval.";
    });
    return adminItem;
};

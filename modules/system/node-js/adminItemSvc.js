var mongo_data_system = require('../../system/node-js/mongo-data') //TODO: USE DEPENDENCY INJECTION


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
                    res.send(403, "not authorized");
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
                    res.send(403, "not authorized");
                } else {
                    if ((item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard")
                            && !req.user.siteAdmin) {
                        res.send("This record is already standard.");
                    } else {
                        if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") &&
                                (item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard")
                                && !req.user.siteAdmin
                                )
                        {
                            res.send(403, "not authorized");
                        } else {
                            return dao.update(elt, req.user, function(err, response) {
                                res.send(response);
                            });
                        }
                    }
                }
            });
        }
    } else {
        res.send(403, "You are not authorized to do this.");
    }
};

function isCuratorOrAdmin(req, elt) {
    return (req.user.orgAdmin && req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0)
           || (req.user.orgCurator && req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0);
};
    
function checkOwnership(dao, id, req, cb) {
    if (req.isAuthenticated()) {
        dao.byId(id, function (err, elt) {
            if (err || !elt) {
                return cb("Element does not exist.", null);
            }
            if (!req.user || !isCuratorOrAdmin(req, elt)
               ) {
                return cb("You do not own this element.", null);
            } else {
                cb(null, elt);
            }
        });
    } else {
        return cb("You are not authorized.", null);                   
    }
};

exports.setAttachmentDefault = function(req, res, dao) {
    checkOwnership(dao, req.body.id, req, function(err, elt) {
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
    checkOwnership(dao, req.body.id, req, function(err, elt) {
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
    checkOwnership(dao, req.body.id, req, function(err, elt) {
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
                        res.send(403, "not authorized");
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
                                res.send(403, "not authorized");
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
        res.send(403, "You are not authorized to do this.");
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
                    res.send(403, "not authorized");
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
        res.send(403, "You are not authorized to do this.");
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
const mongo_data_system = require('./mongo-data');
const async = require('async');
const auth = require('./authorization');
const fs = require('fs');
const md5 = require("md5-file");
const clamav = require('clamav.js');
const config = require('./parseConfig');
const logging = require('./logging');
const streamifier = require('streamifier');
const classificationNode = require('../classification/classificationNode');
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

exports.scanFile = (stream, res, cb) => {
    clamav.createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err, object, malicious) => {
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
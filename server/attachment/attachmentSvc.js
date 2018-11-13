const async = require('async');
const clamav = require('clamav.js');
const config = require('config');
const fs = require('fs');
const md5 = require('md5-file');
const streamifier = require('streamifier');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const handleError = require('../log/dbLogger').handleError;
const adminItemSvc = require('../system/adminItemSvc');
const daoManager = require('../system/moduleDaoManager');
const logging = require('../system/logging');
const mongo_data = require('../system/mongo-data');
const authorization = require('../system/authorization');
const attachmentDb = require('./attachmentDb');

exports.add = (req, res, db) => {
    if (!req.files.uploadedFiles) {
        res.status(400).send('No files to attach.');
        return;
    }

    let fileBuffer = req.files.uploadedFiles.buffer;
    let stream = streamifier.createReadStream(fileBuffer);
    let streamFS = streamifier.createReadStream(fileBuffer);
    let streamFS1 = streamifier.createReadStream(fileBuffer);
    exports.scanFile(stream, res, scanned => {
        req.files.uploadedFiles.scanned = scanned;
        db.checkOwnership(req, db, req.body.id, handleError({req, res}, elt => {
            db.userTotalSpace(req.user.username, totalSpace => {
                if (totalSpace > req.user.quota) {
                    return res.send({message: 'You have exceeded your quota'});
                }
                let file = req.files.uploadedFiles;
                file.stream = streamFS1;

                //store it to FS here
                let writeStream = fs.createWriteStream(file.path);
                streamFS.pipe(writeStream);
                writeStream.on('finish', () => {
                    md5(file.path, (err, hash) => {
                        file.md5 = hash;
                        exports.addToItem(elt, file, req.user, 'some comment', (attachment, requiresApproval) => {
                            if (requiresApproval) {
                                adminItemSvc.createApprovalMessage(req.user, 'AttachmentReviewer', 'AttachmentApproval', attachment);
                            }
                            res.send(elt);
                        });
                    });
                });
            });
        }));
    });
};

exports.addToItem = (item, file, user, comment, cb) => {
    function linkAttachmentToAdminItem(item, attachment, isFileCreated, cb) {
        if (!item.attachments) item.attachments = [];
        item.attachments.push(attachment);
        item.markModified('attachments');
        item.save(err => {
            if (cb) cb(attachment, isFileCreated, err);
        });
    }

    let attachment = {
        comment: comment,
        fileid: null,
        filename: file.originalname,
        filesize: file.size,
        filetype: file.mimetype,
        uploadedBy: {
            userId: user._id,
            username: user.username
        },
        uploadDate: Date.now(),
    };

    let streamDescription = {
        filename: attachment.filename,
        mode: 'w',
        content_type: attachment.filetype,
        metadata: {
            status: null
        }
    };
    if (file.scanned) {
        streamDescription.metadata.status = 'scanned';
    } else if (user.roles && user.roles.filter((r) => r === 'AttachmentReviewer').length > 0) {
        streamDescription.metadata.status = 'approved';
    } else {
        streamDescription.metadata.status = 'uploaded';
    }

    mongo_data.addFile(file, (err, newFile, isNew) => {
        if (!newFile) {
            return;
        }
        if (isNew) {
            if (!authorizationShared.hasRole(user, 'AttachmentReviewer')) {
                attachment.pendingApproval = true;
            }
            attachment.scanned = file.scanned;
        }
        attachment.fileid = newFile._id;
        linkAttachmentToAdminItem(item, attachment, isNew, cb);
    }, streamDescription);
};

exports.approvalApprove = (req, res) => {
    if (!authorizationShared.hasRole(req.user, 'AttachmentReviewer')) {
        return res.status(403).send();
    }
    attachmentDb.alterAttachmentStatus(req.params.id, 'approved', handleError({req, res}, () => {
        let asyncAttachmentApproved = (dao, done) => adminItemSvc.attachmentApproved(dao.dao, req.params.id, done);
        async.each(daoManager.getDaoList(), asyncAttachmentApproved, handleError({req, res}, () => {
            res.send('Attachment approved.');
        }));
    }));
};

exports.approvalDecline = (req, res) => {
    if (!authorizationShared.hasRole(req.user, 'AttachmentReviewer')) {
        return res.status(403).send();
    }
    let asyncAttachmentRemove = (dao, done) => adminItemSvc.attachmentRemove(dao.dao, req.params.id, done);
    async.each(daoManager.getDaoList(), asyncAttachmentRemove, handleError({req, res}, () => {
        mongo_data.deleteFileById(req.params.id, handleError({req, res}, () => {
            res.send('Attachment declined');
        }));
    }));
};

exports.remove = (req, res, db) => {
    db.checkOwnership(req, db, req.body.id, handleError({req, res}, elt => {
        let fileId = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);
        elt.save(handleError({req, res}, () => {
            exports.removeUnusedAttachment(fileId, () => {
                res.send(elt);
            });
        }));
    }));
};

exports.removeUnusedAttachment = function (id, callback) {
    async.map(daoManager.getDaoList(), (dao, done) => {
        adminItemSvc.fileUsed(dao.dao, id, done);
    }, (err, results) => {
        if (results.indexOf(true) === -1) {
            mongo_data.deleteFileById(id, callback);
        } else {
            callback();
        }
    });
};

exports.scanFile = (stream, res, cb) => {
    clamav.createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err, object, malicious) => {
        if (err) return cb(false);
        if (malicious) return res.status(431).send('The file probably contains a virus.');
        cb(true);
    });
};

exports.setDefault = (req, res, db) => {
    db.checkOwnership(req, db, req.body.id, (err, elt) => {
        if (err) {
            logging.expressLogger.info(err);
            return res.status(500).send('ERROR - attachment as default - cannot check ownership');
        }
        let state = req.body.state;
        for (let i = 0; i < elt.attachments.length; i++) {
            elt.attachments[i].isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        elt.save(err => {
            if (err) {
                res.send('error: ' + err);
            } else {
                res.send(elt);
            }
        });
    });
};

import { each, map } from 'async';
import { createScanner } from 'clamav.js';
import * as Config from 'config';
import { createWriteStream } from 'fs';
import * as md5 from 'md5-file';
import { createReadStream } from 'streamifier';
import { hasRole } from 'shared/system/authorizationShared';
import { handleError } from '../errorHandler/errorHandler';
import { attachmentApproved, attachmentRemove, createTask, fileUsed } from '../system/adminItemSvc';
import { getDaoList } from '../system/moduleDaoManager';
import { addFile, deleteFileById, userTotalSpace } from '../system/mongo-data';
import { alterAttachmentStatus } from '../attachment/attachmentDb';
import { CbError, Item } from 'shared/models.model';

const config = Config as any;

export function add(req, res, db, crudPermission) {
    if (!req.files.uploadedFiles) {
        res.status(400).send('No files to attach.');
        return;
    }

    let fileBuffer = req.files.uploadedFiles.buffer;
    let stream = createReadStream(fileBuffer);
    let streamFS = createReadStream(fileBuffer);
    let streamFS1 = createReadStream(fileBuffer);
    scanFile(stream, res, scanned => {
        req.files.uploadedFiles.scanned = scanned;
        db.byId(req.body.id, handleError({req, res}, elt => {
            let ownership = crudPermission(elt, req.user);
            if (!ownership) return res.status(401).send('You do not own this element');
            userTotalSpace(req.user.username, totalSpace => {
                if (totalSpace > req.user.quota) {
                    return res.send({message: 'You have exceeded your quota'});
                }
                let file = req.files.uploadedFiles;
                file.stream = streamFS1;

                // store it to FS here
                let writeStream = createWriteStream(file.path);
                streamFS.pipe(writeStream);
                writeStream.on('finish', () => {
                    md5(file.path, (err, hash) => {
                        file.md5 = hash;
                        addToItem(elt, file, req.user, 'some comment', (attachment, requiresApproval) => {
                            if (requiresApproval) {
                                createTask(req.user, 'AttachmentReviewer', 'approval', db.type,
                                    elt.tinyId, 'attachment');
                            }
                            res.send(elt);
                        });
                    });
                });
            });
        }));
    });
}

function linkAttachmentToAdminItem(item, attachment, isFileCreated, cb) {
    if (!item.attachments) item.attachments = [];
    item.attachments.push(attachment);
    item.markModified('attachments');
    item.save(err => {
        if (cb) cb(attachment, isFileCreated, err);
    });
}

export function addToItem(item, file, user, comment, cb) {
    let attachment: any = {
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

    addFile(file, (err, newFile, isNew) => {
        if (isNew) {
            if (!hasRole(user, 'AttachmentReviewer')) {
                attachment.pendingApproval = true;
            }
            attachment.scanned = file.scanned;
        }
        if (newFile) {
            attachment.fileid = newFile._id;
            linkAttachmentToAdminItem(item, attachment, isNew, cb);
        }
    }, streamDescription);
}

export function approvalApprove(req, res) {
    alterAttachmentStatus(req.params.id, 'approved', handleError({req, res}, () => {
        let asyncAttachmentApproved = (dao, done) => attachmentApproved(dao.dao, req.params.id, done);
        each(getDaoList(), asyncAttachmentApproved, handleError({req, res}, () => {
            res.send('Attachment approved.');
        }));
    }));
}

export function approvalDecline(req, res) {
    let asyncAttachmentRemove = (dao, done) => attachmentRemove(dao.dao, req.params.id, done);
    each(getDaoList(), asyncAttachmentRemove, handleError({req, res}, () => {
        deleteFileById(req.params.id, handleError({req, res}, () => {
            res.send('Attachment declined');
        }));
    }));
}

export function remove(req, res, db, crudPermission) {
    db.byId(req.body.id, handleError({req, res}, elt => {
        let ownership = crudPermission(elt, req.user);
        if (!ownership) return res.status(401).send('You do not own this element');
        let fileId = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);
        elt.save(handleError({req, res}, () => {
            removeUnusedAttachment(fileId, () => {
                res.send(elt);
            });
        }));
    }));
}

export function removeUnusedAttachment(id, cb) {
    map(
        getDaoList(),
        (dao: any, done) => fileUsed(dao.dao, id, done),
        (err, results) => results.indexOf(true) === -1 ? deleteFileById(id, cb) : cb()
    );
}

export function scanFile(stream, res, cb) {
    createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err, object, malicious) => {
        if (err) return cb(false);
        if (malicious) return res.status(431).send('The file probably contains a virus.');
        cb(true);
    });
}

export function setDefault(req, res, db, crudPermission) {
    db.byId(req.body.id, handleError({req, res}, elt => {
        let ownership = crudPermission(elt, req.user);
        if (!ownership) return res.status(401).send('You do not own this element');
        let state = req.body.state;
        for (let i = 0; i < elt.attachments.length; i++) {
            elt.attachments[i].isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        elt.save(handleError({req, res}, newElt => res.send(newElt)));
    }));
}

export function unapproved(cb: CbError<Item[]>) {
    map(
        getDaoList(),
        (dao: any, done) => dao.type !== 'board' ? dao.dao.find({'attachments.pendingApproval': true}, done) : done(undefined, []),
        (err, results) => cb(err === null ? undefined : err, [].concat.apply([], results))
    );
}

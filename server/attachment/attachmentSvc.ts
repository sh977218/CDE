import { each, map } from 'async';
import { createScanner } from 'clamav.js';
import * as Config from 'config';
import { Request, Response } from 'express';
import { createWriteStream } from 'fs';
import * as md5 from 'md5-file';
import { createReadStream } from 'streamifier';
import { hasRole } from 'shared/system/authorizationShared';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { attachmentApproved, attachmentRemove, createTask, fileUsed } from 'server/system/adminItemSvc';
import { getDaoList } from 'server/system/moduleDaoManager';
import { addFile, deleteFileById, ItemDocument, userTotalSpace } from 'server/system/mongo-data';
import { alterAttachmentStatus } from 'server/attachment/attachmentDb';
import { Attachment, Cb, CbError, CbError1, Item, User } from 'shared/models.model';

const config = Config as any;

export function add(req: Request & {files: {uploadedFiles: any}}, res: Response, db: any,
                    crudPermission: (item: Item, user: User) => boolean) {
    if (!req.files.uploadedFiles) {
        res.status(400).send('No files to attach.');
        return;
    }

    const fileBuffer = req.files.uploadedFiles.buffer;
    const stream = createReadStream(fileBuffer);
    const streamFS = createReadStream(fileBuffer);
    const streamFS1 = createReadStream(fileBuffer);
    scanFile(stream, res, scanned => {
        req.files.uploadedFiles.scanned = scanned;
        db.byId(req.body.id, handleNotFound({req, res}, (elt: ItemDocument) => {
            const ownership = crudPermission(elt, req.user);
            if (!ownership) { return res.status(401).send('You do not own this element'); }
            userTotalSpace(req.user.username, totalSpace => {
                if (totalSpace > req.user.quota) {
                    return res.send({message: 'You have exceeded your quota'});
                }
                const file = req.files.uploadedFiles;
                file.stream = streamFS1;

                // store it to FS here
                const writeStream = createWriteStream(file.path);
                streamFS.pipe(writeStream);
                writeStream.on('finish', () => {
                    md5(file.path, (err, hash) => {
                        file.md5 = hash;
                        addToItem(elt, file, req.user, 'some comment', (attachment?: Attachment, requiresApproval?: boolean) => {
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

function linkAttachmentToAdminItem(item: ItemDocument, attachment: Attachment, isFileCreated: boolean, cb: Cb<Attachment, boolean, Error>) {
    item.attachments.push(attachment);
    item.markModified('attachments');
    (item as any).save((err: Error) => {
        cb(attachment, isFileCreated, err);
    });
}

export function addToItem(item: ItemDocument, file: any, user: User, comment: string, cb: Cb<Attachment, boolean, Error>) {
    const attachment: Attachment = {
        comment,
        fileid: undefined,
        filename: file.originalname,
        filesize: file.size,
        filetype: file.mimetype,
        uploadedBy: {
            userId: user._id,
            username: user.username
        },
        uploadDate: Date.now(),
    };

    const streamDescription: any = {
        filename: attachment.filename,
        mode: 'w',
        content_type: attachment.filetype,
        metadata: {
            status: file.scanned ? 'scanned' : (hasRole(user, 'AttachmentReviewer') ?  'approved' : 'uploaded')
        }
    };

    addFile(file, (err, newFile, isNew) => {
        if (isNew) {
            if (!hasRole(user, 'AttachmentReviewer')) {
                attachment.pendingApproval = true;
            }
            attachment.scanned = file.scanned;
        }
        if (newFile) {
            attachment.fileid = newFile._id;
            linkAttachmentToAdminItem(item, attachment, !!isNew, cb);
        }
    }, streamDescription);
}

export function approvalApprove(req: Request, res: Response) {
    alterAttachmentStatus(req.params.id, 'approved', handleError({req, res}, () => {
        const asyncAttachmentApproved = (dao: any, done: CbError<Attachment>) => attachmentApproved(dao.dao, req.params.id, done);
        each(getDaoList(), asyncAttachmentApproved, handleError({req, res}, () => {
            res.send('Attachment approved.');
        }));
    }));
}

export function approvalDecline(req: Request, res: Response) {
    const asyncAttachmentRemove = (dao: any, done: CbError) => attachmentRemove(dao.dao, req.params.id, done);
    each(getDaoList(), asyncAttachmentRemove, handleError({req, res}, () => {
        deleteFileById(req.params.id, handleError({req, res}, () => {
            res.send('Attachment declined');
        }));
    }));
}

export function remove(req: Request, res: Response, db: any, crudPermission: (item: ItemDocument, user: User) => boolean) {
    db.byId(req.body.id, handleNotFound({req, res}, (elt: ItemDocument) => {
        const ownership = crudPermission(elt, req.user);
        if (!ownership) { return res.status(401).send('You do not own this element'); }
        const fileId = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);
        (elt.save as any)(handleError({req, res}, () => {
            removeUnusedAttachment(fileId + '', () => {
                res.send(elt);
            });
        }));
    }));
}

export function removeUnusedAttachment(id: string, cb: Cb<Error>) {
    map(
        getDaoList(),
        (dao: any, done) => fileUsed(dao.dao, id, done),
        (err, results) => results && results.indexOf(true) === -1 ? deleteFileById(id, cb) : cb()
    );
}

export function scanFile(stream: any, res: Response, cb: Cb<boolean>) {
    createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err: any, object: any, malicious: boolean) => {
        if (err) { return cb(false); }
        if (malicious) { return res.status(431).send('The file probably contains a virus.'); }
        cb(true);
    });
}

export function setDefault(req: Request, res: Response, db: any, crudPermission: (item: Item, user: User) => boolean) {
    db.byId(req.body.id, handleNotFound({req, res}, (elt: ItemDocument) => {
        const ownership = crudPermission(elt, req.user);
        if (!ownership) { return res.status(401).send('You do not own this element'); }
        const state = req.body.state;
        for (const attachment of elt.attachments) {
            attachment.isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        (elt.save as any)(handleError({req, res}, newElt => res.send(newElt)));
    }));
}

export function unapproved(cb: CbError1<ItemDocument[]>) {
    map<any, ItemDocument[]>(
        getDaoList(),
        (dao: any, done: CbError<ItemDocument[]>) => dao.type !== 'board'
            ? dao.dao.find({'attachments.pendingApproval': true}, done)
            : done(undefined, []),
        (err, results) => cb(
            err === null ? undefined : err,
            results ? ([] as (ItemDocument)[]).concat.apply([], results as any) : []
        )
    );
}

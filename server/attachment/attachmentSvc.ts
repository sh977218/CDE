import { map } from 'async';
import * as Config from 'config';
import { Request, Response } from 'express';
import { createWriteStream } from 'fs';
import * as md5 from 'md5-file';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { fileUsed } from 'server/system/adminItemSvc';
import { getItemDaoList } from 'server/system/itemDaoManager';
import { addFile, deleteFileById, ItemDocument } from 'server/system/mongo-data';
import { Attachment, Cb1, Cb3, CbError1, Item, User } from 'shared/models.model';

const createScanner = require('clamav.js').createScanner;
const createReadStream = require('streamifier').createReadStream;
const config = Config as any;

export function add(req: Request & { files: any }, res: Response, db: any,
                    crudPermission: (item: Item, user: User) => boolean) {
    if (!req.files) {
        res.status(400).send('No files to attach.');
        return;
    }

    const fileBuffer = req.files[0].buffer;
    const stream = createReadStream(fileBuffer);
    const streamFS = createReadStream(fileBuffer);
    const streamFS1 = createReadStream(fileBuffer);
    scanFile(stream, res, scanned => {
        req.files.scanned = scanned;
        db.byId(req.body.id, handleNotFound({req, res}, (elt: ItemDocument) => {
            const ownership = crudPermission(elt, req.user);
            if (!ownership) {
                return res.status(401).send('You do not own this element');
            }
            const file = req.files[0];
            file.stream = streamFS1;

            // store it to FS here
            const writeStream = createWriteStream(file.originalname);
            streamFS.pipe(writeStream);
            writeStream.on('finish', () => {
                md5(file.originalname, (err, hash) => {
                    file.md5 = hash;
                    addToItem(elt, file, req.user, 'some comment', (attachment?: Attachment, requiresApproval?: boolean) => {
                        res.send(elt);
                    });
                });
            });
        }));
    });
}

function linkAttachmentToAdminItem(item: ItemDocument, attachment: Attachment, isFileCreated: boolean,
                                   cb: Cb3<Attachment, boolean, Error>) {
    item.attachments.push(attachment);
    item.markModified('attachments');
    (item as any).save((err: Error) => {
        cb(attachment, isFileCreated, err);
    });
}

export function addToItem(item: ItemDocument, file: any, user: User, comment: string, cb: Cb3<Attachment, boolean, Error>) {
    const attachment: Attachment = {
        comment,
        fileid: '',
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
            status: file.scanned ? 'approved' : 'uploaded'
        }
    };

    addFile(file, streamDescription, (err, newFile, isNew) => {
        if (isNew) {
            attachment.scanned = file.scanned;
        }
        if (newFile) {
            attachment.fileid = newFile._id;
            linkAttachmentToAdminItem(item, attachment, !!isNew, cb);
        }
    });
}

export function remove(req: Request, res: Response, db: any, crudPermission: (item: ItemDocument, user: User) => boolean) {
    db.byId(req.body.id, handleNotFound({req, res}, (elt: ItemDocument) => {
        const ownership = crudPermission(elt, req.user);
        if (!ownership) {
            return res.status(401).send('You do not own this element');
        }
        const fileId = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);
        (elt.save as any)(handleError({req, res}, () => {
            removeUnusedAttachment(fileId + '', () => {
                res.send(elt);
            });
        }));
    }));
}

export function removeUnusedAttachment(id: string, cb: Cb1<Error | null>) {
    map(
        getItemDaoList(),
        (dao, done) => fileUsed(dao._model, id, done),
        (err, results) => results && results.indexOf(true) === -1 ? deleteFileById(id, cb) : cb(null)
    );
}

export function scanFile(stream: any, res: Response, cb: Cb1<boolean>) {
    createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err: any, object: any, malicious: boolean) => {
        if (err) {
            return cb(false);
        }
        if (malicious) {
            return res.status(431).send('The file probably contains a virus.');
        }
        cb(true);
    });
}

export function setDefault(req: Request, res: Response, db: any, crudPermission: (item: Item, user: User) => boolean) {
    db.byId(req.body.id, handleNotFound({req, res}, (elt: ItemDocument) => {
        const ownership = crudPermission(elt, req.user);
        if (!ownership) {
            return res.status(401).send('You do not own this element');
        }
        const state = req.body.state;
        for (const attachment of elt.attachments) {
            attachment.isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        (elt.save as any)(handleError({req, res}, newElt => res.send(newElt)));
    }));
}

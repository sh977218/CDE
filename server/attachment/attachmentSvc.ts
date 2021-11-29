import { map } from 'async';
import * as Config from 'config';
import { Request, Response } from 'express';
import { createWriteStream } from 'fs';
import * as md5 from 'md5-file';
import { respondError } from 'server/errorHandler/errorHandler';
import { fileUsed } from 'server/system/adminItemSvc';
import { getItemDaoList } from 'server/system/itemDaoManager';
import { addFile, deleteFileById } from 'server/system/mongo-data';
import { Attachable, AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { Attachment, Cb1, CbError2, User } from 'shared/models.model';
import { promisify } from 'util';

const createScanner = require('clamav.js').createScanner;
const createReadStream = require('streamifier').createReadStream;
const config = Config as any;

export function add<T extends Attachable>(req: Request & { files: any }, res: Response, db: AttachableDb<T>,
                                          crudPermission: (item: T, user: User) => boolean): Promise<Response> {
    if (!req.files) {
        return Promise.resolve(res.status(400).send('No files to attach.'));
    }

    const fileBuffer = req.files[0].buffer;
    const stream = createReadStream(fileBuffer);
    const streamFS = createReadStream(fileBuffer);
    const streamFS1 = createReadStream(fileBuffer);
    return scanFile(stream).then(
        scanned => db.byId(req.body.id)
            .then(item => {
                if (!item) {
                    return res.status(404).send();
                }
                if (!crudPermission(item, req.user)) {
                    return res.status(401).send('You do not own this element');
                }
                req.files.scanned = scanned;
                const file = req.files[0];
                file.stream = streamFS1;

                return new Promise<Response>(((resolve) => {
                    // store it to FS here
                    const writeStream = createWriteStream(file.originalname);
                    streamFS.pipe(writeStream);
                    writeStream.on('finish', () => {
                        md5(file.originalname, (err, hash) => {
                            if (err) {
                                return resolve(respondError({req, res})(err));
                            }
                            file.md5 = hash;
                            addToItem(db, item, file, req.user, 'some comment', (err, newItem, attachment) => {
                                resolve(err ? respondError({req, res})(err) : res.send(newItem));
                            });
                        });
                    });
                }));
            })
            .catch(respondError({req, res})),
        () => res.status(431).send('The file probably contains a virus.')
    );
}

export function addToItem<T extends Attachable>(db: AttachableDb<T>, item: T, file: any, user: User,
                                                comment: string, cb: CbError2<T | void, Attachment | void>) {
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

    addFile(
        file,
        {
            filename: attachment.filename,
            mode: 'w',
            content_type: attachment.filetype,
            metadata: {
                status: file.scanned ? 'approved' : 'uploaded'
            }
        },
        (err, newFile, isNew) => {
            if (isNew) {
                attachment.scanned = file.scanned;
            }
            if (newFile) {
                attachment.fileid = newFile._id;
                db.attach(item._id, attachment)
                    .then(
                        newItem => cb(null, newItem, attachment),
                        err => cb(err)
                    );
            }
        }
    );
}

export function remove<T extends Attachable>(req: Request, res: Response, db: AttachableDb<T>,
                                             crudPermission: (item: T, user: User) => boolean): Promise<Response> {
    return db.byId(req.body.id)
        .then(elt => {
            if (!elt) {
                return res.status(404).send();
            }
            if (!crudPermission(elt, req.user)) {
                return res.status(401).send('You do not own this element');
            }
            const fileId = elt.attachments[req.body.index].fileid + '';
            return db.removeAttachment(elt._id, req.body.index)
                .then(newElt => promisify(removeUnusedAttachment)(fileId)
                    .then(() => res.send(newElt)))
        })
        .catch(respondError({req, res}));
}

export function removeUnusedAttachment(id: string, cb: Cb1<Error | null>) {
    map(
        getItemDaoList(),
        (dao, done) => fileUsed(dao._model, id, done),
        (err, results) => results && results.indexOf(true) === -1 ? deleteFileById(id, cb) : cb(null)
    );
}

export function scanFile(stream: any): Promise<boolean> {
    return new Promise(((resolve, reject) => {
        createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err: any, object: any, malicious: boolean) => {
            if (err) {
                return resolve(false);
            }
            if (malicious) {
                return reject();
            }
            return resolve(true);
        });
    }));
}

export function setDefault<T extends Attachable>(req: Request, res: Response, db: AttachableDb<T>,
                                                 crudPermission: (item: T, user: User) => boolean): Promise<Response> {
    return db.byId(req.body.id)
        .then(elt => {
            if (!elt) {
                return res.status(404).send();
            }
            if (!crudPermission(elt, req.user)) {
                return res.status(401).send('You do not own this element');
            }
            return db.setDefaultAttachment(elt._id, req.body.index, req.body.state)
                .then(newElt => res.send(newElt));
        })
        .catch(respondError({req, res}));
}

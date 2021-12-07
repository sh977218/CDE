import { Request, Response } from 'express';
import * as md5 from 'md5';
import { config, dbPlugins, ObjectId } from 'server';
import { respondError } from 'server/errorHandler/errorHandler';
import { addFile, deleteFileById } from 'server/mongo/mongo/gfs';
import { FileCreateInfo } from 'server/system/mongo-data';
import { Attachable, AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { Attachment, User } from 'shared/models.model';

const createScanner = require('clamav.js').createScanner;
const createReadStream = require('streamifier').createReadStream;

interface FileInfo {
    buffer: string;
    mimetype?: string;
    originalname: string;
    size?: number;
}

export function add<T extends Attachable>(req: Request & { files: FileInfo[] }, res: Response, db: AttachableDb<T>,
                                          crudPermission: (item: T, user: User) => boolean): Promise<Response> {
    if (!req.files) {
        return Promise.resolve(res.status(400).send('No files to attach.'));
    }

    const fileBuffer = req.files[0].buffer;
    const stream = createReadStream(fileBuffer);
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
                const file = req.files[0];
                const fileCreate: FileCreateInfo = {
                    filename: file.originalname,
                    stream: streamFS1,
                    md5: md5(fileBuffer),
                };
                return addToItem(db, item, file, fileCreate, scanned, req.user, 'some comment')
                    .then(newItem => res.send(newItem));
            })
            .catch(respondError({req, res})),
        () => res.status(431).send('The file probably contains a virus.')
    );
}

export function addToItem<T extends Attachable>(db: AttachableDb<T>, item: T, file: FileInfo, fileCreate: FileCreateInfo, scanned: boolean,
                                                user: User, comment: string): Promise<T | null> {
    const attachment: Attachment = {
        comment,
        fileid: '',
        filename: file.originalname,
        filesize: file.size,
        filetype: file.mimetype,
        scanned,
        uploadedBy: {
            userId: user._id,
            username: user.username
        },
        uploadDate: Date.now(),
    };

    return addFile(
        fileCreate,
        {
            contentType: attachment.filetype,
            metadata: {
                md5: fileCreate.md5,
                status: scanned ? 'approved' : 'uploaded',
            }
        }
    ).then(newId => {
        attachment.fileid = newId.toString();
        return db.attach(item._id, attachment);
    });
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
                .then(newElt => removeUnusedAttachment(fileId)
                    .then(() => res.send(newElt)))
        })
        .catch(respondError({req, res}));
}

export function removeUnusedAttachment(id: string): Promise<void> {
    return Promise.all([
        dbPlugins.article.exists({'attachments.fileid': id}),
        dbPlugins.dataElement.exists({'attachments.fileid': id}),
        dbPlugins.form.exists({'attachments.fileid': id})
    ])
        .then(results => {
            if (results && results.indexOf(true) === -1) {
                return deleteFileById(new ObjectId(id));
            }
        });
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

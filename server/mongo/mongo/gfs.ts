import { Response } from 'express';
import { GridFSBucket, GridFSBucketReadStream, GridFSBucketWriteStreamOptions } from 'mongodb';
import { config, ObjectId } from 'server';
import { respondError } from 'server/errorHandler';
import { establishConnection } from 'server/system/connections';
import { FileCreateInfo } from 'server/system/mongo-data';

const conn = establishConnection(config.database.appData);
const db = conn.asPromise()
    .then(conn => conn.getClient())
    .then(mongoClient => mongoClient.db(config.database.appData.db));
export const gfs = db.then(db => new GridFSBucket(db, {
    bucketName: 'attachments'
}));

export function addFile(file: FileCreateInfo, streamDescription: GridFSBucketWriteStreamOptions | null = null): Promise<ObjectId> {
    return gfs.then(gfs => gfs.find({'metadata.md5': file.md5}).toArray().then(files => {
        const f = files[0];
        if (f) {
            return f._id;
        }
        if (!streamDescription) {
            streamDescription = {
                contentType: file.type
            };
        }
        const description = streamDescription;
        const _id = new ObjectId();
        return new Promise(((resolve, reject) => {
            file.stream.pipe(gfs.openUploadStreamWithId(_id, file.filename + '', description)
                .on('close', () => resolve(_id))
                .on('error', reject)
            );
        }));
    }));
}

export function deleteFileById(_id: ObjectId): Promise<void> {
    return exists({_id}).then(found => {
        if (found) {
            return gfs.then(bucket => bucket.delete(_id));
        }
    });
}

export function exists(query: {_id?: ObjectId, filename?: string}): Promise<boolean> {
    return gfs.then(bucket => bucket.find(query).toArray().then(files => {
        const file = files[0];
        return !!file?._id;
    }));
}

export function getFile(query: {_id?: ObjectId, filename?: string}): Promise<GridFSBucketReadStream | null> {
    return gfs.then(bucket => bucket.find(query).toArray().then(files => {
        const file = files[0];
        return file?._id ? bucket.openDownloadStream(file._id): null;
    }));
}

export function getFileAndRespond(query: {_id?: ObjectId, filename?: string}, res: Response): Promise<Response> {
    return gfs.then(gfs => gfs.find(query).toArray().then(files => {
        const file = files[0];
        if (!file) {
            return res.status(404).send('File not found.');
        }
        if (file.contentType) {
            res.contentType(file.contentType);
            if (file.contentType.indexOf('csv') !== -1) {
                res.setHeader('Content-disposition', 'attachment; filename=' + file.filename);
            }
        }
        res.header('Accept-Ranges', 'bytes');
        res.header('Content-Length', file.length + '');
        return gfs.openDownloadStream(file._id).pipe(res);
    }, respondError({res})));
}

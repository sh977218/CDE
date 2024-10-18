import { Response } from 'express';
import { handleError, respondError } from 'server/errorHandler';
import { Document, Model } from 'mongoose';
import { Cb1, CbError1 } from 'shared/models.model';

// sample: postCheckFn for custom unique id
// (data, cb) => {
//     model.findOne({ownId: data.ownId}, (err, exists) => {
//         if (err) {
//             cb(err);
//             return;
//         }
//         cb(undefined, !exists);
//     });
// }

export interface WritableCollection<T> {
    delete: (res: Response, id: string, cb: Cb1<{ deletedCount: number }>) => void;
    find: (res: Response, crit: any, cb: Cb1<(Document & T)[]>) => void;
    get: (res: Response, id: string, cb: Cb1<(Document & T) | null>) => void;
    post: (res: Response, data: T, cb: Cb1<Document & T>) => void;
    put: (res: Response, data: T, cb: Cb1<Document & T>) => void;
    save: (res: Response, data: T, cb: Cb1<Document & T>) => Promise<void>;
}

export function writableCollection<T extends { _id: string; __v: number }>(
    model: Model<Document & T>,
    postCheckFn = (data: T, cb: CbError1<boolean>) => cb(null, true),
    versionKey: '__v' = '__v'
): WritableCollection<T> {
    function post(res: Response, data: T, cb: Cb1<Document & T>) {
        const handlerOptions = { res };
        if (!postCheckFn) {
            respondError(handlerOptions)(new Error('id generation is not supported'));
            return;
        }
        postCheckFn(data, (err, pass) => {
            if (err) {
                respondError(handlerOptions)(err);
                return;
            }
            if (!pass) {
                res.status(409).send('Cannot create. Already exists.');
                return;
            }
            new model(data).save().then(cb, respondError(handlerOptions));
        });
    }
    function put(res: Response, data: T, cb: Cb1<Document & T>) {
        const handlerOptions = { res };
        if (typeof data[versionKey] !== 'number') {
            model.findOne({ _id: data._id } as any).then(exists => {
                if (exists && typeof exists[versionKey] === 'undefined') {
                    // WORKAROUND until data updated to mongo 4 __v
                    exists = null;
                }
                if (exists) {
                    res.status(409).send('Cannot create. Already exists.');
                    return;
                }
                new model(data).save().then(cb, respondError(handlerOptions));
            }, respondError(handlerOptions));
            return;
        }
        const query: any = { _id: data._id, [versionKey]: data[versionKey] };
        model.findOne(query).then(async oldInfo => {
            if (!oldInfo) {
                res.status(409).send('Edited by someone else. Please refresh and redo.');
                return;
            }
            data[versionKey]++;
            const updatedInfo: Partial<T> & { _doc?: T } = oldInfo;
            updatedInfo._doc = data;
            // new model(data).save();
            delete updatedInfo._id;
            model.updateOne(query, updatedInfo, { new: true }).then(doc => {
                if (!doc) {
                    res.status(409).send('Edited by someone else. Please refresh and redo.');
                    return;
                }
                cb(doc as any);
            }, respondError(handlerOptions));
        }, respondError(handlerOptions));
    }
    return {
        delete: (res: Response, id: string, cb: Cb1<{ deletedCount: number }>) => {
            model.deleteOne({ _id: id } as any, handleError({ res }, cb) as any);
        },
        find: (res: Response, crit: any, cb: Cb1<(Document & T)[]>) => {
            model.find(crit, handleError({ res }, cb));
        },
        get: (res: Response, id: string, cb: Cb1<(Document & T) | null>) => {
            model.findOne({ _id: id } as any).then(cb, respondError({ res }));
        },
        post,
        put,
        save: async (res: Response, data: T, cb: Cb1<Document & T>) => {
            if (data._id) {
                put(res, data, cb);
            } else {
                post(res, data, cb);
            }
        },
    };
}

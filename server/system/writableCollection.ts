import { Response } from 'express';
import { handleError, respondError } from 'server/errorHandler/errorHandler';
import { Document, Model } from 'mongoose';
import { Cb, CbError } from 'shared/models.model';

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

export function writableCollection<T extends {_id: string, __v: number}>(
    model: Model<Document & T>,
    postCheckFn = (data: T, cb: CbError<boolean>) => cb(undefined, true),
    versionKey: '__v' = '__v'
) {
    function post(res: Response, data: T, cb: Cb<Document & T>) {
        const handlerOptions = {res};
        if (!postCheckFn) {
            respondError(new Error('id generation is not supported'), handlerOptions);
            return;
        }
        postCheckFn(data, (err, pass) => {
            if (err) {
                respondError(err, handlerOptions);
                return;
            }
            if (!pass) {
                res.status(409).send('Cannot create. Already exists.');
                return;
            }
            new model(data).save(handleError(handlerOptions, cb));
        });
    }
    function put(res: Response, data: T, cb: Cb<Document & T>) {
        const handlerOptions = {res};
        if (typeof data[versionKey] !== 'number') {
            model.findOne({_id: data._id}, handleError(handlerOptions, exists => {
                if (exists && typeof exists[versionKey] === 'undefined') { // WORKAROUND until data updated to mongo 4 __v
                    exists = undefined;
                }
                if (exists) {
                    res.status(409).send('Cannot create. Already exists.');
                    return;
                }
                new model(data).save(handleError(handlerOptions, cb));
            }));
            return;
        }
        const query: any = {_id: data._id, [versionKey]: data[versionKey]};
        model.findOne(query, handleError(handlerOptions, async oldInfo => {
            if (!oldInfo) {
                res.status(409).send('Edited by someone else. Please refresh and redo.');
                return;
            }
            data[versionKey]++;
            (oldInfo as any)._doc = data;
            // new model(data).save();
            delete oldInfo._id;
            model.update(query, oldInfo, {new: true}, handleError(handlerOptions, doc => {
                if (!doc) {
                    res.status(409).send('Edited by someone else. Please refresh and redo.');
                    return;
                }
                cb(doc);
            }));
        }));
    }
    return {
        delete: (res: Response, id: string, cb: Cb<{deletedCount: number}>) => {
            model.remove({_id: id}, handleError({res}, cb));
        },
        find: (res: Response, crit: any, cb: Cb<(Document & T)[]>) => {
            model.find(crit, handleError({res}, cb));
        },
        get: (res: Response, id: string, cb: Cb<Document & T | null>) => {
            model.findOne({_id: id}, handleError({res}, cb));
        },
        post,
        put,
        save: async (res: Response, data: T, cb: Cb<Document & T>) => {
            if (data._id) {
                put(res, data, cb);
            } else {
                post(res, data, cb);
            }
        }
    };
}

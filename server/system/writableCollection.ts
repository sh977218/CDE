import { handleError, respondError } from '../errorHandler/errorHandler';

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

export function writableCollection(model, postCheckFn = (data, cb) => cb(undefined, true), versionKey = '__v') {
    function post(res, data, cb) {
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
    function put(res, data, cb) {
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
        let query = {_id: data._id, [versionKey]: data[versionKey]};
        model.findOne(query, handleError(handlerOptions, oldInfo => {
            if (!oldInfo) {
                res.status(409).send('Edited by someone else. Please refresh and redo.');
                return;
            }
            data[versionKey]++;
            oldInfo._doc = data;
            new model(data).save();
            model.save(query, oldInfo, {new: true}, handleError(handlerOptions, doc => {
                if (!doc) {
                    res.status(409).send('Edited by someone else. Please refresh and redo.');
                    return;
                }
                cb(doc);
            }));
        }));
    }
    return {
        delete: (res, id, cb) => {
            model.remove({_id: id}, handleError({res}, cb));
        },
        find: (res, crit, cb) => {
            model.find(crit, handleError({res}, cb));
        },
        get: (res, id, cb) => {
            model.findOne({_id: id}, handleError({res}, cb));
        },
        post,
        put,
        save: (res, data, cb) => {
            if (data._id) put(res, data, cb); else post(res, data, cb);
        }
    };
}

const dbLogger = require('../log/dbLogger');
const handleError = dbLogger.handleError;
const respondError = dbLogger.respondError;

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
module.exports = function writableCollection(model, postCheckFn = (data, cb) => cb(undefined, true), versionKey = '__v') {
    function post(res, data, cb) {
        const errorOptions = {res, origin: 'writableCollection post ' + model};
        if (!postCheckFn) {
            respondError(new Error('id generation is not supported'), errorOptions);
            return;
        }
        postCheckFn(data, (err, pass) => {
            if (err) {
                respondError(err, errorOptions);
                return;
            }
            if (!pass) {
                res.status(409).send('Cannot create. Already exists.');
                return;
            }
            new model(data).save(handleError(errorOptions, cb));
        });
    }
    function put(res, data, cb) {
        const errorOptions = {res, origin: 'writableCollection put ' + model};
        if (typeof data[versionKey] !== 'number') {
            model.findOne({_id: data._id}, handleError(errorOptions, exists => {
                if (exists && typeof exists[versionKey] === 'undefined') { // WORKAROUND until data updated to mongo 4 __v
                    exists = undefined;
                }
                if (exists) {
                    res.status(409).send('Cannot create. Already exists.');
                    return;
                }
                new model(data).save(handleError(errorOptions, cb));
            }));
            return;
        }
        let query = {_id: data._id, [versionKey]: data[versionKey]};
        model.findOne(query, handleError(errorOptions, oldInfo => {
            if (!oldInfo) {
                res.status(409).send('Edited by someone else. Please refresh and redo.');
                return;
            }
            data[versionKey]++;
            oldInfo._doc = data;
            model.updateOne(query, oldInfo, handleError(errorOptions, status => {
                if (status.nModified === 1) {
                    cb(oldInfo.toObject());
                } else {
                    res.status(409).send('Edited by someone else. Please refresh and redo.');
                }
            }));
        }));
    }
    return {
        delete: (res, id, cb) => {
            model.remove({_id: id}, handleError({res, origin: 'writableCollection delete ' + model}, cb));
        },
        find: (res, crit, cb) => {
            model.find(crit, handleError({res, origin: 'writableCollection find ' + model}, cb));
        },
        get: (res, id, cb) => {
            model.findOne({_id: id}, handleError({res, origin: 'writableCollection get ' + model}, cb));
        },
        post,
        put,
        save: (res, data, cb) => {
            if (data._id) put(res, data, cb); else post(res, data, cb);
        }
    };
};
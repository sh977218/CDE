const handleError = require('../log/dbLogger.js').handleError;
const respondError = require('../log/dbLogger.js').respondError;

module.exports = function timestamped(model, noPost) {
    return {
        delete: (res, id, cb) => {
            model.remove({_id: id}, handleError({res, origin: 'timestamped delete ' + model}, cb));
        },
        find: (res, crit, cb) => {
            model.find(crit, handleError({res, origin: 'timestamped find ' + model}, cb));
        },
        get: (res, id, cb) => {
            model.findOne({_id: id}, handleError({res, origin: 'timestamped get ' + model}, cb));
        },
        put: (res, data, cb) => {
            const errorOptions = {res, origin: 'timestamped put ' + model};
            if (!data._id) {
                if (noPost) {
                    respondError(new Error('id generation is not supported'), errorOptions);
                    return;
                }
                data.timestamp = new Date();
                new model(data).save(handleError(errorOptions, cb));
                return;
            }
            model.findOne({_id: data._id}, handleError(errorOptions, oldInfo => {
                if (!oldInfo) {
                    data.timestamp = new Date();
                    new model(data).save(handleError(errorOptions, cb));
                    return;
                }
                const timestamp = new Date(data.timestamp);
                if (oldInfo.toObject().timestamp.getTime() !== timestamp.getTime()) {
                    res.status(409).send('Edited by someone else. Please refresh and redo.');
                    return;
                }
                data.timestamp = new Date();
                model.update({_id: data._id, timestamp: timestamp}, data, handleError(errorOptions, status => {
                    if (status.nModified === 1) {
                        cb(data);
                    } else {
                        res.status(409).send('Edited by someone else. Please refresh and redo.');
                    }
                }));
            }));
        },
    };
};

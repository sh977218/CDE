// cb(err, bool)
exports.exists = (ModelOrQuery, condition, cb) => {
    ModelOrQuery.find(condition, {"_id" : 1}).limit(1).exec((err, result) => {
        cb(err, !!result);
    });
};

const router = require('express').Router();
const mongo_user = require('./mongo_user');

router.post('/me', function (req, res) {
    if (!req.user) return res.status(401).send();
    // if (req.user._id.toString() !== req.body._id)
    //     return res.status(401).send();
    mongo_data.userById(req.user._id, function (err, user) {
        user.email = req.body.email;
        user.publishedForms = req.body.publishedForms;
        user.save(dbLogger.handleGenericError({res: res, origin: "/user/me"}, () => {
            res.send()
        }));
    });
    user.save((err, o) => {
        if (err) dbLogger.handleGenericError({res: res, origin: "/user/me"});
        else {
            res.send();
        }
    });
});

exports.updateUserAvatar = function (user, cb) {
    mongo_data.userByName(user.username, function (err, found) {
        if (err) return cb(err);
        found.avatarUrl = user.avatarUrl;
        found.save(cb);
    });
};


exports.updateSearchSettings = function (username, settings, cb) {
    mongo_data.userByName(username, function (err, user) {
        user.searchSettings = settings;
        //user.markModified('searchSettings');
        user.save(cb);
    });
};

exports.module = router;

exports.updateUserAvatar = function(user, cb) {
    mongo_data.userByName(user.username, function(err, found) {
        if (err) return cb(err);
        found.avatarUrl = user.avatarUrl;
        found.save(cb);
    });
};


exports.updateSearchSettings = function(username, settings, cb) {
    mongo_data.userByName(username, function(err, user){
        user.searchSettings = settings;
        //user.markModified('searchSettings');
        user.save(cb);
    });
};
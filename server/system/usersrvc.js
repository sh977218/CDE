var mongo_data = require('./mongo-data')
    , authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared')
    ;

exports.myOrgs = function(user) {
    if (!user) return [];
    return user.orgAdmin.concat(user.orgCurator);
};

exports.updateUserRoles = function(user, cb) {
    mongo_data.userByName(user.username, function(err, found) {
        if (err) return cb(err);
        found.roles = user.roles;
        found.save(cb);
    });
};

exports.updateUserAvatar = function(user, cb) {
    mongo_data.userByName(user.username, function(err, found) {
        if (err) return cb(err);
        found.avatarUrl = user.avatarUrl;
        found.save(cb);
    });
};

exports.myOrgsAdmins = function (req, res) {
    mongo_data.userById(req.user._id, function (err, foundUser) {
        mongo_data.orgAdmins(function (err, users) {
            res.send(foundUser.orgAdmin
                .map(org => ({
                    name: org,
                    users: users
                        .filter(u => u.orgAdmin.indexOf(org) > -1)
                        .map(u => ({
                            _id: u._id,
                            username: u.username,
                        })),
                }))
                .filter(r => r.users.length > 0));
        });
    });
};

exports.orgCurators = function (req, res) {
    mongo_data.orgCurators(req.user.orgAdmin, function (err, users) {
        res.send(req.user.orgAdmin
            .map(org => ({
                name: org,
                users: users
                    .filter(user => user.orgCurator.indexOf(org) > -1)
                    .map(user => ({
                        _id: user._id,
                        username: user.username,
                    })),
            }))
            .filter(org => org.users.length > 0)
        );
    });
};

exports.orgAdmins = function (req, res) {
    mongo_data.managedOrgs((err, managedOrgs) => {
        mongo_data.orgAdmins((err, users) => {
            res.send(managedOrgs
                .map(mo => ({
                    name: mo.name,
                    users: users
                        .filter(u => u.orgAdmin.indexOf(mo.name) > -1)
                        .map(u => ({
                            _id: u._id,
                            username: u.username,
                        })),
                }))
            );
        });
    });
};

exports.addOrgAdmin = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, user) {
        if (!user) {
            res.send("Unknown Username");
        } else {
            if (user.orgAdmin.indexOf(req.body.org) > -1) {
                res.send("User is already an Administrator for this Organization");
            } else {
                if (authorizationShared.hasRole(user, "CommentReviewer")) user.roles.push("CommentReviewer");
                user.orgAdmin.push(req.body.org);
                user.save(function () {
                    res.send("Organization Administrator Added");
                });
            }
        }
    });  
};

exports.removeOrgAdmin = function(req, res) {
    mongo_data.userById(req.body.userId, function(err, found) {
        if (!found) {
            res.send("Unknown User");
        } else {
            var orgInd = found.orgAdmin.indexOf(req.body.org);
            if (orgInd < 0) {
                res.send("User is not an Administrator for this Organization");
            } else {
                found.orgAdmin.splice(orgInd, 1);
                found.save(function () {
                    res.send("Organization Administrator Removed");
                });
            }
        }
    });  
};

exports.addOrgCurator = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, user) {
        if (!user) {
            res.send("Unknown Username");
        } else {
            if (user.orgCurator.indexOf(req.body.org) > -1) {
                res.send("User is already a Curator for this Organization");
            } else {
                user.orgCurator.push(req.body.org);
                if (authorizationShared.hasRole(user, "CommentReviewer")) user.roles.push("CommentReviewer");
                user.save(function () {
                    res.send("Organization Curator Added");
                });
            }
        }
    });  
};

exports.removeOrgCurator = function(req, res) {
    mongo_data.userById(req.body.userId, function(err, found) {
        if (!found) {
            res.send("Unknown User");
        } else {
            var orgInd = found.orgCurator.indexOf(req.body.org);
            if (orgInd < 0) {
                res.send("User is not a Curator for this Organization");
            } else {
                found.orgCurator.splice(orgInd, 1);
                found.save(function () {
                    res.send("Organization Curator Removed");
                });
            }
        }
    });  
};

exports.getAllUsernames = function(req, res) {
    mongo_data.getAllUsernames(function(err, usernames) {
        if(err) res.status(500).end(err);
        else {
            res.send(usernames);
        }
    });
};
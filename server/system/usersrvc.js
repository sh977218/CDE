const mongo_data = require('./mongo-data');
const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const errorHandler = require("../errorHandler/errHandler");
const handle404 = errorHandler.handle404;
const handleError = errorHandler.handleError;

exports.myOrgs = function(user) {
    if (!user) return [];
    return user.orgAdmin.concat(user.orgCurator);
};

exports.updateUserRoles = function(req, res) {
    let user = req.body;
    mongo_data.userByName(user.username, handle404({req, res}, found => {
        found.roles = user.roles;
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
};

exports.updateUserAvatar = function(req, res) {
    let user = req.body;
    mongo_data.userByName(user.username, handle404({req, res}, found => {
        found.avatarUrl = user.avatarUrl;
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
};

exports.myOrgsAdmins = function (req, res) {
    mongo_data.userById(req.user._id, handle404({req, res}, foundUser => {
        mongo_data.orgAdmins(handle404({req, res}, users => {
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
        }));
    }));
};

exports.orgCurators = function (req, res) {
    mongo_data.orgCurators(req.user.orgAdmin, handle404({req, res}, users => {
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
    }));
};

exports.orgAdmins = function (req, res) {
    mongo_data.managedOrgs(handle404({req, res}, managedOrgs => {
        mongo_data.orgAdmins(handle404({req, res}, users => {
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
        }));
    }));
};

exports.addOrgAdmin = function(req, res) {
    mongo_data.userByName(req.body.username, handle404({req, res}, user => {
        let changed = false;
        if (user.orgAdmin.indexOf(req.body.org) === -1) {
            user.orgAdmin.push(req.body.org);
            changed = true;
        }
        if (!authorizationShared.hasRole(user, 'CommentReviewer')) {
            user.roles.push('CommentReviewer');
            changed = true;
        }

        if (!changed) {
            return res.send();
        }
        user.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
};

exports.removeOrgAdmin = function(req, res) {
    mongo_data.userById(req.body.userId, handle404({req, res}, found => {
        let orgInd = found.orgAdmin.indexOf(req.body.org);
        if (orgInd < 0) {
            return res.send();
        }
        found.orgAdmin.splice(orgInd, 1);
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
};

exports.addOrgCurator = function(req, res) {
    mongo_data.userByName(req.body.username, handle404({req, res}, user => {
        let changed = false;
        if (user.orgCurator.indexOf(req.body.org) === -1) {
            user.orgCurator.push(req.body.org);
            changed = true;
        }
        if (!authorizationShared.hasRole(user, 'CommentReviewer')) {
            user.roles.push('CommentReviewer');
            changed = true;
        }

        if (!changed) {
            return res.send();
        }
        user.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
};

exports.removeOrgCurator = function(req, res) {
    mongo_data.userById(req.body.userId, handle404({req, res}, found => {
        let orgInd = found.orgCurator.indexOf(req.body.org);
        if (orgInd < 0) {
            return res.send();
        }
        found.orgCurator.splice(orgInd, 1);
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
};

exports.getAllUsernames = function(req, res) {
    mongo_data.getAllUsernames(handleError({req, res}, usernames => res.send(usernames)));
};

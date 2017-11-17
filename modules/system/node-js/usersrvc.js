var mongo_data = require('./mongo-data')
    , authorizationShared = require('@std/esm')(module)('../../system/shared/authorizationShared')
    ;
    
exports.isCuratorOf = function(user, orgName){
    if (!user) return false;
    return user.orgCurator.indexOf(orgName)>-1 || user.orgAdmin.indexOf(orgName)>-1 || user.siteAdmin;
};

exports.isAdminOf = function(user, orgName){
    if (!user) return false;
    return user.orgAdmin.indexOf(orgName)>-1 || user.siteAdmin;
};

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


exports.addSiteAdmin = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            found.siteAdmin = true;
            found.save(function () {
                res.send("User Added");
            });
        }
    });  
};

exports.removeSiteAdmin = function(req, res) {
    mongo_data.userById(req.body.id, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            found.siteAdmin = false;            
            found.save(function () {
                res.send("Site Administrator Removed");
            });
        }
    });  
};

exports.myOrgsAdmins = function(req, res) {
    if (!req.isAuthenticated()) {
        res.send({orgs: []});
    } else {
        mongo_data.userById(req.user._id, function(err, foundUser) {
            var result = {"orgs": []};
            mongo_data.orgAdmins(function(err, users) {
                var myOrgs = foundUser.orgAdmin;
                for (var i = 0; i < myOrgs.length; i++) {
                    var usersList = [];
                    users.forEach(function (u) {
                        if (u.orgAdmin.indexOf(myOrgs[i]) > -1) {
                            usersList.push({
                                "username": u.username
                                , "_id": u._id
                            });
                        }
                    });
                    if (usersList.length > 0) {
                        result.orgs.push({
                            "name": myOrgs[i]
                            , "users": usersList
                        });
                    }
                }
               res.send(result); 
            });
        });
    }
};

exports.orgCurators = function(req, res) {
    if (!req.isAuthenticated()) {
        res.send("You must log in to do this.");
    } else {
        mongo_data.userById(req.user._id, function(err, foundUser) {
            var result = {"orgs": []};
            if (foundUser.orgAdmin.length > 0) {
                mongo_data.orgCurators(foundUser.orgAdmin, function(err, users) {
                    var myOrgs = foundUser.orgAdmin;
                    for (var i = 0; i < myOrgs.length; i++) {
                        var usersList = [];
                        for (var j in users) {
                            if (users[j].orgCurator.indexOf(myOrgs[i]) > -1) {
                                usersList.push({
                                    "username": users[j].username
                                    , "_id": users[j]._id
                                });
                            }
                        }
                        if (usersList.length > 0) {
                            result.orgs.push({
                                "name": myOrgs[i]
                                , "users": usersList
                            });
                        }
                    }
                   res.send(result); 
                });
            } else {
                res.send("User is not an Org Admin");
            }
        });
    }
};


exports.orgAdmins = function(req, res) {
    if (!authorizationShared.hasRole(req.user, "OrgAuthority")) return res.status(403).send("Not Authorized");

    let result = {"orgs": []};
    mongo_data.managedOrgs(managedOrgs => {
        mongo_data.orgAdmins((err, users) => {
            managedOrgs.forEach(mo => {
                let newOrg = {"name": mo.name, "users": []};
                result.orgs.push(newOrg);
                // var usersList = [];
                users.forEach(u => {
                    if (u.orgAdmin.indexOf(mo.name) > -1) {
                        newOrg.users.push({
                            "username": u.username,
                            "_id": u._id
                        });
                    }
                });
            });
            res.send(result);
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
            var orgInd = found.orgAdmin.indexOf(req.body.orgName);
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
            var orgInd = found.orgCurator.indexOf(req.body.orgName);
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

exports.updateSearchSettings = function(username, settings, cb) {
    mongo_data.userByName(username, function(err, user){
        user.searchSettings = settings;
        //user.markModified('searchSettings');
        user.save(cb);
    });
};
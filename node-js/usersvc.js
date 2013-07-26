var mongo_data = require('./mongo-data')
    , util = require('util')
    ;
    
exports.register = function(req, res) {    
    mongo_data.userByName(req.body.username, function(err, found) {
        if (found) {
            res.send("user already exists");
        } else {
            console.log(req.body);
            var user = {username: req.body.username
                        , password: req.body.password};
            mongo_data.addUser(user, function() {
                res.send("Thank you for registering");
            });
        }
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

exports.myRegAuthsAdmins = function(req, res) {
    if (!req.isAuthenticated()) {
        res.send({regAuths: []});
    } else {
        mongo_data.userById(req.user._id, function(err, foundUser) {
            var result = {"regAuths": []};
            mongo_data.regAuthAdmins(function(err, users) {
                var myRegAuths = foundUser.regAuthAdmin;
                for (var i = 0; i < myRegAuths.length; i++) {
                    var usersList = [];
                    for (var j in users) {
                        if (users[j].regAuthAdmin.indexOf(myRegAuths[i]) > -1) {
                            usersList.push({
                                "username": users[j].username
                                , "_id": users[j]._id
                            });
                        }
                    }
                    if (usersList.length > 0) {
                        result.regAuths.push({
                            "name": myRegAuths[i]
                            , "users": usersList
                        });
                    }
                }
               res.send(result); 
            });
        });
    }
};

exports.regAuthCurators = function(req, res) {
    if (!req.isAuthenticated()) {
        res.send("You must log in to do this.");
    } else {
        mongo_data.userById(req.user._id, function(err, foundUser) {
            var result = {"regAuths": []};
            if (foundUser.regAuthAdmin.length > 0) {
                mongo_data.regAuthCurators(foundUser.regAuthAdmin, function(err, users) {
                    var myRegAuths = foundUser.regAuthAdmin;
                    for (var i = 0; i < myRegAuths.length; i++) {
                        var usersList = [];
                        for (var j in users) {
                            if (users[j].regAuthCurator.indexOf(myRegAuths[i]) > -1) {
                                usersList.push({
                                    "username": users[j].username
                                    , "_id": users[j]._id
                                });
                            }
                        }
                        if (usersList.length > 0) {
                            result.regAuths.push({
                                "name": myRegAuths[i]
                                , "users": usersList
                            });
                        }
                    }
                   res.send(result); 
                });
            } else {
                res.send("User is not a Registration Authority Admin");
            }
        });
    }
};


exports.regAuthAdmins = function(req, res) {
    mongo_data.managedRegAuths(function(managedRegAuths) {
        var result = {"regAuths": []};
        mongo_data.regAuthAdmins(function(err, users) {
            for (var i in managedRegAuths) {
                var usersList = [];
                for (var j in users) {
                    if (users[j].regAuthAdmin.indexOf(managedRegAuths[i].name) > -1) {
                        usersList.push({
                            "username": users[j].username
                            , "_id": users[j]._id
                        });
                    }
                }
                if (usersList.length > 0) {
                    result.regAuths.push({
                        "name": managedRegAuths[i].name
                        , "users": usersList
                    });
                }
            }

           res.send(result); 
        });
    });
};

exports.addRegAuthAdmin = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            if (found.regAuthAdmin.indexOf(req.body.regAuth) > -1) {
                res.send("User is already an Administrator for this Registration Authority");
            } else {
                found.regAuthAdmin.push(req.body.regAuth);
                found.save(function () {
                    res.send("Registration Authority Administrator Added");
                });
            }
        }
    });  
};

exports.removeRegAuthAdmin = function(req, res) {
    mongo_data.userById(req.body.userId, function(err, found) {
        if (!found) {
            res.send("Unknown User");
        } else {
            var regAuthInd = found.regAuthAdmin.indexOf(req.body.regAuthName);
            if (regAuthInd < 0) {
                res.send("User is not an Administrator for this Registration Authority");
            } else {
                found.regAuthAdmin.splice(regAuthInd, 1);
                found.save(function () {
                    res.send("Registration Authority Administrator Removed");
                });
            }
        }
    });  
};

exports.addRegAuthCurator = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            if (found.regAuthCurator.indexOf(req.body.regAuth) > -1) {
                res.send("User is already a Curator for this Registration Authority");
            } else {
                found.regAuthCurator.push(req.body.regAuth);
                found.save(function () {
                    res.send("Registration Authority Curator Added");
                });
            }
        }
    });  
};

exports.removeRegAuthCurator = function(req, res) {
    mongo_data.userById(req.body.userId, function(err, found) {
        if (!found) {
            res.send("Unknown User");
        } else {
            var regAuthInd = found.regAuthCurator.indexOf(req.body.regAuthName);
            if (regAuthInd < 0) {
                res.send("User is not a Curator for this Registration Authority");
            } else {
                found.regAuthCurator.splice(regAuthInd, 1);
                found.save(function () {
                    res.send("Registration Authority Curator Removed");
                });
            }
        }
    });  
};

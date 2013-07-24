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

exports.myContextsAdmins = function(req, res) {
    if (!req.isAuthenticated()) {
        res.send({contexts: []});
    } else {
        mongo_data.userById(req.user._id, function(err, foundUser) {
            var result = {"contexts": []};
            mongo_data.contextAdmins(function(err, users) {
                var myContexts = foundUser.contextAdmin;
                for (var i = 0; i < myContexts.length; i++) {
                    var usersList = [];
                    for (var j in users) {
                        if (users[j].contextAdmin.indexOf(myContexts[i]) > -1) {
                            usersList.push({
                                "username": users[j].username
                                , "_id": users[j]._id
                            });
                        }
                    }
                    if (usersList.length > 0) {
                        result.contexts.push({
                            "name": myContexts[i]
                            , "users": usersList
                        });
                    }
                }
               res.send(result); 
            });
        });
    }
};

exports.contextCurators = function(req, res) {
    if (!req.isAuthenticated()) {
        res.send("You must log in to do this.");
    } else {
        mongo_data.userById(req.user._id, function(err, foundUser) {
            var result = {"contexts": []};
            if (foundUser.contextAdmin.length > 0) {
                mongo_data.contextCurators(foundUser.contextAdmin, function(err, users) {
                    var myContexts = foundUser.contextAdmin;
                    for (var i = 0; i < myContexts.length; i++) {
                        var usersList = [];
                        for (var j in users) {
                            if (users[j].contextCurator.indexOf(myContexts[i]) > -1) {
                                usersList.push({
                                    "username": users[j].username
                                    , "_id": users[j]._id
                                });
                            }
                        }
                        if (usersList.length > 0) {
                            result.contexts.push({
                                "name": myContexts[i]
                                , "users": usersList
                            });
                        }
                    }
                   res.send(result); 
                });
            } else {
                res.send("User is not a Context Admin");
            }
        });
    }
};


exports.contextAdmins = function(req, res) {
    mongo_data.managedContexts(function(managedContexts) {
        var result = {"contexts": []};
        mongo_data.contextAdmins(function(err, users) {
            for (var i in managedContexts) {
                var usersList = [];
                for (var j in users) {
                    if (users[j].contextAdmin.indexOf(managedContexts[i].name) > -1) {
                        usersList.push({
                            "username": users[j].username
                            , "_id": users[j]._id
                        });
                    }
                }
                if (usersList.length > 0) {
                    result.contexts.push({
                        "name": managedContexts[i].name
                        , "users": usersList
                    });
                }
            }

           res.send(result); 
        });
    });
};

exports.addContextAdmin = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            if (found.contextAdmin.indexOf(req.body.context) > -1) {
                res.send("User is already an Administrator for this Context");
            } else {
                found.contextAdmin.push(req.body.context);
                found.save(function () {
                    res.send("Context Administrator Added");
                });
            }
        }
    });  
};

exports.removeContextAdmin = function(req, res) {
    mongo_data.userById(req.body.userId, function(err, found) {
        if (!found) {
            res.send("Unknown User");
        } else {
            var contextInd = found.contextAdmin.indexOf(req.body.contextName);
            if (contextInd < 0) {
                res.send("User is not an Administrator for this Context");
            } else {
                found.contextAdmin.splice(contextInd, 1);
                found.save(function () {
                    res.send("Context Administrator Removed");
                });
            }
        }
    });  
};

exports.addContextCurator = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            if (found.contextCurator.indexOf(req.body.context) > -1) {
                res.send("User is already a Curator for this Context");
            } else {
                found.contextCurator.push(req.body.context);
                found.save(function () {
                    res.send("Context Curator Added");
                });
            }
        }
    });  
};

exports.removeContextCurator = function(req, res) {
    mongo_data.userById(req.body.userId, function(err, found) {
        if (!found) {
            res.send("Unknown User");
        } else {
            var contextInd = found.contextCurator.indexOf(req.body.contextName);
            if (contextInd < 0) {
                res.send("User is not a Curator for this Context");
            } else {
                found.contextCurator.splice(contextInd, 1);
                found.save(function () {
                    res.send("Context Curator Removed");
                });
            }
        }
    });  
};

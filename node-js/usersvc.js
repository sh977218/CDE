var mongo_data = require('./mongo-data')
    , util = require('util')
    ;
    
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
                    for (var j in users) {
                        if (users[j].orgAdmin.indexOf(myOrgs[i]) > -1) {
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
    mongo_data.managedOrgs(function(managedOrgs) {
        var result = {"orgs": []};
        mongo_data.orgAdmins(function(err, users) {
            for (var i in managedOrgs) {
                var usersList = [];
                for (var j in users) {
                    if (users[j].orgAdmin.indexOf(managedOrgs[i].name) > -1) {
                        usersList.push({
                            "username": users[j].username
                            , "_id": users[j]._id
                        });
                    }
                }
                if (usersList.length > 0) {
                    result.orgs.push({
                        "name": managedOrgs[i].name
                        , "users": usersList
                    });
                }
            }

           res.send(result); 
        });
    });
};

exports.addOrgAdmin = function(req, res) {
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            if (found.orgAdmin.indexOf(req.body.org) > -1) {
                res.send("User is already an Administrator for this Organization");
            } else {
                found.orgAdmin.push(req.body.org);
                found.save(function () {
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
    mongo_data.userByName(req.body.username, function(err, found) {
        if (!found) {
            res.send("Unknown Username");
        } else {
            if (found.orgCurator.indexOf(req.body.org) > -1) {
                res.send("User is already a Curator for this Organization");
            } else {
                found.orgCurator.push(req.body.org);
                found.save(function () {
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

exports.pinToBoard = function(req, res) {
    var uuid = req.params.uuid;
    mongo_data.boardsByUserId(req.user._id, function(boards) {
        var boardId = req.params.boardId;
        mongo_data.boardById(boardId, function(err, board) {
            if (err) return res.send("Board cannot be found.");
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                return res.send("You must own a board to edit it.");
            } else {        
                var pin = {
                    pinnedDate: Date.now()
                    , deUuid: uuid
                };
                for (var i = 0 ; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i].deUuid) === JSON.stringify(uuid)) {
                        res.statusCode = 202;
                        return res.send("Already added to the board.");
                    }
                }
                board.pins.push(pin);
                mongo_data.save(board, function(err, b) {
                    return res.send("Added to Board"); 
                });
            }
        })
    });
};

exports.removePinFromBoard = function(req, res) {
    var boardId = req.params.boardId;
    var pinId = req.params.pinId;
    mongo_data.boardById(boardId, function(err, board) {
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
            return res.send("You must own a board to edit it.");
        } else {        
            for (var i = 0; i < board.pins.length; i++) {
                if (JSON.stringify(board.pins[i]._id) === JSON.stringify(pinId)) {
                    board.pins.splice(i, 1);
                    return board.save(function (err, b) {
                        res.send("Removed");
                    });
                }
                res.send("Nothing removed");
            }
        }
    });
};

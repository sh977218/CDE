var mongoose = require('mongoose')
    , config = require('config')
    , schemas = require('./schemas')
    , schemas_system = require('../../system/node-js/schemas') 
    , mongo_data_system = require('../../system/node-js/mongo-data') 
    , shortid = require("shortid") 
    , connHelper = require('../../system/node-js/connections')
;

exports.name = "CDEs";
        
var mongoUri = config.mongoUri;
var DataElement;
var PinningBoard;
var Message;
var User;

var connectionEstablisher = connHelper.connectionEstablisher;

var iConnectionEstablisherCde = new connectionEstablisher(mongoUri, 'CDE');
iConnectionEstablisherCde.connect(function(conn) {
    DataElement = conn.model('DataElement', schemas.dataElementSchema);
    PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);
    Message = conn.model('Message', schemas.message); 
    User = conn.model('User', schemas_system.userSchema);
});

var mongo_data = this;

exports.DataElement = DataElement;

exports.boardsByUserId = function(userId, callback) {
    PinningBoard.find({"owner.userId": userId}).exec(function (err, result) {
        callback(result); 
    });
};

exports.publicBoardsByDeTinyId = function(tinyId, callback) {
    PinningBoard.find({"pins.deTinyId": tinyId, "shareStatus": "Public"}).exec(function (err, result) {
        callback(result); 
    });
};

exports.userTotalSpace = function(name, callback) {
    mongo_data_system.userTotalSpace(DataElement, name, callback);
};

exports.deCount = function (callback) {
    DataElement.find().count().exec(function (err, count) {
        callback(count);
    });
};

exports.boardList = function(from, limit, searchOptions, callback) {
    PinningBoard.find(searchOptions).exec(function (err, boards) {
        // TODO Next line throws "undefined is not a function.why?
        PinningBoard.find(searchOptions).count(searchOptions).exec(function (err, count) {
            callback("",{
                    boards: boards
                    , page: Math.ceil(from / limit)
                    , pages: Math.ceil(count / limit)
                    , totalNumber: count
                });
             });
    });
};  

exports.desByConcept = function (concept, callback) {
    DataElement.find(
            {'$or': [{'objectClass.concepts.originId': concept.originId},
                     {'property.concepts.originId': concept.originId}, 
                     {'dataElementConcept.concepts.originId': concept.originId}]},
        "naming source sourceId registrationState stewardOrg updated updatedBy createdBy tinyId version views")
                .limit(20)
                .where("archived").equals(null)
                .exec(function (err, cdes) {
        callback(cdes); 
    });
};

exports.eltByTinyIdAndVersion = function(tinyId, version, callback) {
    DataElement.findOne({'tinyId': tinyId, "version": version}).exec(function (err, de) {
       callback("", de); 
    });
};

exports.eltByTinyId = function(tinyId, version, callback) {
    DataElement.findOne({'tinyId': tinyId, "archived": null}).exec(function (err, de) {
       callback("", de); 
    });
};

exports.formatCde = function(cde) {
    function escapeHTML(s) {return s.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}
    cde._doc.stewardOrgCopy = cde.stewardOrg;
    cde._doc.primaryNameCopy = escapeHTML(cde.naming[0].designation);
    cde._doc.primaryDefinitionCopy = escapeHTML(cde.naming[0].definition); 
};

exports.cdesByIdList = function(idList, callback) {
    DataElement.find().where('_id')
        .in(idList)
        .slice('valueDomain.permissibleValues', 10)
        .exec(function(err, cdes) {
            cdes.forEach(mongo_data.formatCde);
            callback("", cdes); 
    });
};

exports.cdesByTinyIdList = function(idList, callback) {
    DataElement.find({'archived':null}).where('tinyId')
            .in(idList)
            .slice('valueDomain.permissibleValues', 10)
            .exec(function(err, cdes) {
                cdes.forEach(mongo_data.formatCde);
                callback("", cdes); 
    });
};

exports.priorCdes = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement !== null) {
            return DataElement.find({}, "naming source sourceId registrationState stewardOrg updated updatedBy createdBy tinyId version views changeNote")
                    .where("_id").in(dataElement.history).exec(function(err, cdes) {
                callback("", cdes);
            });
        } else {
            
        }
    });
};

exports.acceptFork = function(fork, orig, callback) {
    fork.isFork = undefined;
    orig.archived = true;
    fork.stewardOrg = orig.stewardOrg;
    fork.registrationState.registrationStatus = orig.registrationState.registrationStatus;
    fork.save(function(err) {
       if (err) {callback(err);} 
       else {
           orig.save(function(err) {
               callback(err);
           });
       }
    });
};

exports.isForkOf = function(tinyId, callback) {
    return DataElement.find({tinyId: tinyId})
        .where("archived").equals(null).where("isFork").equals(null).exec(function(err, cdes) {
            callback("", cdes);
    });
};

exports.forks = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement !== null) {
            return DataElement.find({tinyId: dataElement.tinyId, isFork: true}, "naming stewardOrg updated updatedBy createdBy created updated changeNote")
                .where("archived").equals(null).where("registrationState.registrationStatus").ne("Retired").exec(function(err, cdes) {
                    callback("", cdes);
            });
        } else {
            callback("", []);
        }
    });
};

exports.byId = function(cdeId, callback) {
    DataElement.findOne({'_id': cdeId}, function(err, cde) {
        callback("", cde);
    });
};

exports.incDeView = function(cde) {
    DataElement.update({_id: cde._id}, {$inc: {views: 1}}).exec();
};

exports.boardById = function(boardId, callback) {
    PinningBoard.findOne({'_id': boardId}, function (err, b) {
        callback("", b);
    });
};

exports.removeBoard = function (boardId, callback) {
    PinningBoard.remove({'_id': boardId}, function (err) {
        callback();
    });
};
//TODO: Consider moving
exports.addToViewHistory = function(cde, user) {
    User.findOne({'_id': user._id}, function (err, u) {
        u.viewHistory.splice(0, 0, cde.tinyId);
        if (u.viewHistory.length > 1000) {
            u.viewHistory.length(1000);
        };
        u.save();
    });
};

exports.name_autocomplete = function(name, callback) {
    DataElement.find({}, {"naming.designation": 1}).where("naming").elemMatch(function(elem) {
        elem.where("designation").equals(new RegExp(name, 'i'));
    }).limit(20).exec(function(err, result) {
        callback("", result);
    });
};

exports.newBoard = function(board, callback) {
    var newBoard = new PinningBoard(board);
    newBoard.save(function(err) {
        callback("", newBoard);        
    });
};

exports.save = function(mongooseObject, callback) {
    mongooseObject.save(function(err) {
       callback("", mongooseObject); 
    });
};

exports.create = function(cde, user, callback) {
    var newDe = new DataElement(cde);
    newDe.registrationState = {
        registrationStatus: "Incomplete"
    };
    newDe.created = Date.now();
    newDe.createdBy.userId = user._id;
    newDe.createdBy.username = user.username;
    newDe.tinyId = shortid.generate();
    newDe.save(function (err) {
        callback(err, newDe);
    });    
};

exports.fork = function(elt, user, callback) {
    exports.update(elt, user, callback, function(newDe, dataElement) {
        newDe.isFork = true;
        newDe.registrationState.registrationStatus = "Incomplete";
        dataElement.archived = undefined;      
    });
};

exports.update = function(elt, user, callback, special) {
    return DataElement.findById(elt._id, function(err, dataElement) {
        var jsonDe = JSON.parse(JSON.stringify(dataElement));
        delete jsonDe._id;
        var newDe = new DataElement(jsonDe);
        newDe.history.push(dataElement._id);
        newDe.naming = elt.naming;
        newDe.version = elt.version;
        newDe.changeNote = elt.changeNote;
        newDe.updated = new Date().toJSON();
        newDe.updatedBy.userId = user._id;
        newDe.updatedBy.username = user.username;
        newDe.registrationState.registrationStatus = elt.registrationState.registrationStatus;
        newDe.registrationState.effectiveDate = elt.registrationState.effectiveDate;
        newDe.registrationState.untilDate = elt.registrationState.untilDate;
        newDe.registrationState.administrativeNote = elt.registrationState.administrativeNote;
        newDe.registrationState.unresolvedIssue = elt.registrationState.unresolvedIssue;
        newDe.registrationState.administrativeStatus = elt.registrationState.administrativeStatus;
        newDe.registrationState.replacedBy = elt.registrationState.replacedBy;
        newDe.dataElementConcept = elt.dataElementConcept;
        newDe.objectClass = elt.objectClass;
        newDe.property = elt.property;
        newDe.properties = elt.properties;
        newDe.valueDomain = elt.valueDomain;
        newDe.attachments = elt.attachments;
        newDe.ids = elt.ids;
        newDe.classification = elt.classification;
        newDe.stewardOrg.name = elt.stewardOrg.name;
        dataElement.archived = true;

        if (special) {
            special(newDe, dataElement);
        }

        if (newDe.naming.length < 1) {
            console.log("Cannot save without names");
            callback("Cannot save without names");
        }

        dataElement.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                newDe.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                    callback("", newDe);
                });
            }
        });
    });
};

exports.createMessage = function(msg, cb) {
    var message = new Message(msg);
    message.save(function() {
        cb();
    });
};

exports.updateMessage = function(msg, cb) {
    var id = msg._id;
    delete msg._id;
    Message.update({_id: id}, msg).exec(function(err) {
        cb(err);
    });    
};

exports.getMessages = function(req, callback) {
   switch (req.params.type) {
       case "received":
            var authorRecipient = {
                $and: [
                    {
                        $or: [
                            {
                                "recipient.recipientType": "stewardOrg"
                                , "recipient.name": {$in: req.user.orgAdmin.concat(req.user.orgCurator)}
                            }
                            , {
                                "recipient.recipientType": "user"
                                , "recipient.name": req.user.username
                            }
                        ]
                    },
                    {
                        "typeRequest.states.0.action": "Filed"
                    }
                ]
            };            
            break;
        case "sent":
            var authorRecipient = {
                $or: [
                    {
                        "author.authorType":"stewardOrg"
                        , "author.name": {$in: req.user.orgAdmin.concat(req.user.orgCurator)}
                    }
                    , {
                        "author.authorType":"user"
                        , "author.name": req.user.username
                    }
                ]
            };
            break; 
        case "archived":
            var authorRecipient = {
                $and: [
                    {
                        $or: [
                            {
                                "recipient.recipientType": "stewardOrg"
                                , "recipient.name": {$in: req.user.orgAdmin.concat(req.user.orgCurator)}
                            }
                            , {
                                "recipient.recipientType": "user"
                                , "recipient.name": req.user.username
                            }
                        ]
                    },
                    {
                        "typeRequest.states.0.action": "Approved"
                    }
                ]
            };             
            break;
    }
    if (!authorRecipient) {
        callback("Type not specified!");
        return;
    }
    
    Message.find(authorRecipient).where().exec(function(err, result) {
        if (!err) callback(null, result);
        else callback(err);
    });
};

exports.archiveCde = function(cde, callback) {
    DataElement.findOne({'_id': cde._id}, function(err, cde) {
        cde.archived = true;        
        cde.save(function() {
            callback("", cde);
        });
    });
};

exports.query = function(query, callback) {
    DataElement.find(query).exec(function(err, result) {
        callback(err, result);
    });
};

exports.transferSteward = function(from, to, callback) {
    DataElement.update({'stewardOrg.name':from},{$set:{'stewardOrg.name':to}},{multi:true}).exec(function(err, result) {
        callback(err, result);
    });
};
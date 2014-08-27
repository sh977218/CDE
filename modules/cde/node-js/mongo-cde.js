var mongoose = require('mongoose')
    , util = require('util')
    , xml2js = require('xml2js')
    , uuid = require('node-uuid')
    , Grid = require('gridfs-stream')
    , fs = require('fs')
    , config = require('config')
    , schemas = require('./schemas')
    , schemas_system = require('../../system/node-js/schemas') //TODO: USE DEPENDENCY INJECTION
    , mongo_data_system = require('../../system/node-js/mongo-data') //TODO: USE DEPENDENCY INJECTION
    ;

var mongoUri = config.mongoUri;

var conn = mongoose.createConnection(mongoUri);
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {
	console.log('mongodb connection open');
    });    
exports.mongoose_connection = conn;

var User = conn.model('User', schemas_system.userSchema);

var xmlParser = new xml2js.Parser();

var DataElement = conn.model('DataElement', schemas.dataElementSchema);

var PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);
var Message = conn.model('Message', schemas.message);

var gfs = Grid(conn.db, mongoose.mongo);

var mongo_data = this;

exports.DataElement = DataElement;

exports.boardsByUserId = function(userId, callback) {
    PinningBoard.find({"owner.userId": userId}).exec(function (err, result) {
        callback(result); 
    });
};

exports.publicBoardsByDeUuid = function(uuid, callback) {
    PinningBoard.find({"pins.deUuid": uuid, "shareStatus": "Public"}).exec(function (err, result) {
        callback(result); 
    });
};

exports.getFile = function(callback, res, id) {
    res.writeHead(200, { "Content-Type" : "image/png"});
    gfs.createReadStream({ _id: id }).pipe(res);
};
 
exports.addCdeAttachment = function(file, user, comment, cde, cb) {
    var writestream = gfs.createWriteStream({});
    writestream.on('close', function (newfile) {
        cde.attachments.push({
            fileid: newfile._id
            , filename: file.name
            , filetype: file.type
            , uploadDate: Date.now()
            , comment: comment 
            , uploadedBy: {
                userId: user._id
                , username: user.username
            }
            , filesize: file.size
        });
        cde.save(function() {
            cb();
        });
    });
    
    fs.createReadStream(file.path).pipe(writestream);

};

exports.userTotalSpace = function(name, callback) {
  DataElement.aggregate(
    {$match: {"attachments.uploadedBy.username": "cabigAdmin"}},
    {$unwind: "$attachments"},
    {$group: {_id: {uname: "$attachments.uploadedBy.username"} , totalSize: {$sum: "$attachments.filesize"}}},
    {$sort: {totalSize : -1}}
        , function (err, res) {
            var result = 0;
            if (res.length > 0) {
                result = res[0].totalSize;
            }
           callback(result);
        });
};

exports.addComment = function(deId, comment, userId, callback) {
    exports.byId(deId, function(err, de) {
        mongo_data_system.userById(userId, function(err, user) {
            de.comments.push({
                user: user._id
                , username: user.username
                , created: new Date().toJSON()
                , text: comment
            });
            de.save(function (err) {
                callback(err, de);
            });
        });
    });
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
        "naming source sourceId registrationState stewardOrg updated updatedBy createdBy uuid version views")
                .limit(20)
                .where("archived").equals(null)
                .exec(function (err, cdes) {
        callback(cdes); 
    });
};

exports.deByUuidAndVersion = function(uuid, version, callback) {
    DataElement.findOne({'uuid': uuid, "version": version}).exec(function (err, de) {
       callback("", de); 
    });
};

exports.formatCde = function(cde) {
    function escapeHTML(s) {return s.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}
    cde._doc.classificationCopy = cde.classification;
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

exports.cdesByUuidList = function(idList, callback) {
    DataElement.find({'archived':null}).where('uuid')
            .in(idList)
            .slice('valueDomain.permissibleValues', 10)
            .exec(function(err, cdes) {
                cdes.forEach(mongo_data.formatCde);
                callback("", cdes); 
    });
};

exports.priorCdes = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement != null) {
            return DataElement.find({}, "naming source sourceId registrationState stewardOrg updated updatedBy createdBy uuid version views changeNote")
                    .where("_id").in(dataElement.history).exec(function(err, cdes) {
                callback("", cdes);
            });
        } else {
            
        }
    });
};

exports.forks = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement != null) {
            return DataElement.find({uuid: dataElement.uuid, isFork: true}, "naming stewardOrg updated updatedBy createdBy created updated changeNote")
                    .exec(function(err, cdes) {
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
        u.viewHistory.splice(0, 0, cde._id);
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
    newDe.uuid = uuid.v4();
    newDe.save(function (err) {
        callback(err, newDe);
    });    
};

exports.update = function(elt, user, callback) {
    update(elt, user, false, callback);
};

exports.updateOrFork = function(elt, user, fork, callback) {
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

        if (fork === true) {
            newDe.isFork = true;
        } else {
            dataElement.archived = true;
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
                        "typeMergeRequest.states.0.action": "Filed"
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
                        "typeMergeRequest.states.0.action": "Approved"
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
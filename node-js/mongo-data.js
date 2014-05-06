 var mongoose = require('mongoose')
    , util = require('util')
    , vsac_io = require('./vsac-io')
    , xml2js = require('xml2js')
    , uuid = require('node-uuid')
    , Grid = require('gridfs-stream')
    , fs = require('fs')
    , envconfig = require('../envconfig')
    ;

var mongoUri = process.env.MONGO_URI || envconfig.mongo_uri || 'mongodb://localhost/nlmcde';

mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('mongodb connection open');
    });

var xmlParser = new xml2js.Parser();

var schemas = require('./schemas');

var DataElement = mongoose.model('DataElement', schemas.dataElementSchema);
var User = mongoose.model('User', schemas.userSchema);
var Form = mongoose.model('Form', schemas.formSchema);
var Org = mongoose.model('Org', schemas.orgSchema);
var PinningBoard = mongoose.model('PinningBoard', schemas.pinningBoardSchema);
var Message = mongoose.model('Message', schemas.message);

var gfs = Grid(db.db, mongoose.mongo);

exports.pVCodeSystemList = [];

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

exports.conceptSystem_autocomplete = function(callback) {
    Org.distinct("classifications.name", function(err, systems) {
        callback(systems);
    }); 
};

exports.conceptSystem_org_autocomplete = function(orgName, callback) {
    Org.distinct("classifications.name", {"name": orgName}, function(err, systems) {
        callback(systems);
    });    
};

exports.org_autocomplete = function(name, callback) {
    Org.find({"name": new RegExp(name, 'i')}, function(err, orgs) {
        callback(orgs);
    }); 
};

exports.removeClassificationFromOrg = function(orgName, conceptSystem, concept, callback) {
    var mongoQuery = {
        $pull: {
            classification: {
                "stewardOrg.name": orgName,
                "elements.name": conceptSystem,
                "elements.elements.name": concept
            }
        }
    };
    DataElement.update({}, mongoQuery, {multi: true}).exec(function(err) {
        if (err) { 
            callback("Unable to unclassify. " + err);
            return;
        } else {
            var mongoQuery = {
                $pull: {
                        "classifications.$.elements": {
                            "name": concept
                        }
                }
            };
            Org.update({"name": orgName, "classifications.name": conceptSystem}, mongoQuery).exec(function(err) {
                if (err) { 
                    callback("Unable to remove Classification. " + err);
                    return;
                } else {
                    return callback();
                }
            });
        }
    });
};

exports.addClassificationToOrg = function(orgName, conceptSystemName, conceptName, callback) {
    var mongo_data = this;
    this.findConceptSystem = function(stewardOrg, conceptSystemName) {
        for(var i=0; i<stewardOrg.classifications.length; i++) {
            if(stewardOrg.classifications[i].name===conceptSystemName) {
                return stewardOrg.classifications[i];
            }
        }
        return null;
    };
    this.findConcept = function(conceptSystem, conceptName) {
        for(var i=0; i<conceptSystem.elements.length; i++) {
            if(conceptSystem.elements[i].name===conceptName) {
                return conceptSystem.elements[i];
            }
        }
        return null;
    };    
    this.addConceptSystem = function(stewardOrg, conceptSystemName) {
        stewardOrg.classifications.push({name: conceptSystemName});
        return stewardOrg.classifications[stewardOrg.classifications.length-1];
    };  
    this.addConcept = function(conceptSystem, conceptName) {
        if (!conceptSystem.elements) {
            conceptSystem.elements = [];
        }
        conceptSystem.elements.push({name: conceptName});
    };     
    Org.findOne({"name": orgName}).exec(function(err, stewardOrg) {
        conceptSystem = mongo_data.findConceptSystem(stewardOrg, conceptSystemName);
        if (!conceptSystem) {
            conceptSystem = mongo_data.addConceptSystem(stewardOrg, conceptSystemName);
        }
        concept = mongo_data.findConcept(conceptSystem, conceptName);
        if (!concept) {
            mongo_data.addConcept(conceptSystem, conceptName);
        }    
        stewardOrg.save(function (err) {
            if (err) { 
                callback("Unable to add Classification. " + err);
                return;
            } else {
                return callback();
            }  
        });
    });
};

exports.getFile = function(callback, res, id) {
    res.writeHead(200, { "Content-Type" : "image/png"});
    gfs.createReadStream({ _id: id }).pipe(res);
};
 
exports.orgNames = function(callback) {
    Org.find({}, {name: true, _id: false}).exec(function(err, result) {
        callback(err, result);
    });
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

exports.userByName = function(name, callback) {
    User.findOne({'username': name}).exec(function (err, u) {
       callback("", u); 
    });
};

exports.userById = function(id, callback) {
    User.findOne({'_id': id}).exec(function (err, u) {
       callback("", u); 
    });
};

exports.addUser = function(user, callback) {
    var newUser = new User(user);
    newUser.save(function() {
        callback(newUser);
    });
};

exports.siteadmins = function(callback) {
    User.find({'siteAdmin': true}).select('username').exec(function (err, users) {
        callback("", users);
    });
};

exports.orgAdmins = function(callback) {
    User.find({orgAdmin: {$not: {$size: 0}}}).exec(function (err, users) {
        callback("", users);
    });
};

exports.orgCurators = function(orgs, callback) {
    User.find().where("orgCurator").in(orgs).exec(function (err, users) {
        callback("", users);
    });
};

exports.addComment = function(deId, comment, userId, callback) {
    exports.cdeById(deId, function(err, de) {
        exports.userById(userId, function(err, user) {
            de.comments.push({
                user: user._id
                , username: user.username
                , created: new Date().toJSON()
                , text: comment
            });
            de.save(function (err) {
                callback("");
            });
        });
    });
};

exports.addToCart = function (user, formId, callback) {
    User.findOne({'_id': user._id}).exec(function (err, u) {
       u.formCart.push(formId);
       u.save(function (err) {
          callback(""); 
       });
    });
};

exports.classificationSystems = function(callback) {
      DataElement.find().distinct('classification.conceptSystem', function(error, classifs) {
          callback(classifs);
      });
};

exports.orgByName = function(orgName,callback) {
    Org.findOne({"name": orgName}).exec(function(error, org) {
        callback(org);
    });
};


exports.removeFromCart = function (user, formId, callback) {
    User.findOne({'_id': user._id}).exec(function (err, u) {
        if (u.formCart.indexOf(formId) > -1) {
            u.formCart.splice(u.formCart.indexOf(formId), 1);
            u.save(function (err) {
                if (err) {
                    console.log("Could not remove from cart");
                }
                callback(""); 
            });
        } else {
            console.log("This form is not in the cart. " + formId);
        }
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

exports.formlist = function(from, limit, searchOptions, callback) {
    Form.find(searchOptions).skip(from).limit(limit).sort('name').exec(function (err, forms) {
        Form.count(searchOptions).exec(function (err, count) {
        callback("",{
               forms: forms,
               page: Math.ceil(from / limit),
               pages: Math.ceil(count / limit)
           });
        });
    });
};  

exports.desByConcept = function (concept, callback) {
    DataElement.find(
            {'$or': [{'objectClass.concepts.originId': concept.originId},
                     {'property.concepts.originId': concept.originId}, 
                     {'dataElementConcept.concepts.originId': concept.originId}]},
        "naming origin originId registrationState stewardOrg updated updatedBy createdBy uuid version views")
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

exports.formById = function(formId, callback) {
    Form.findOne({'_id': formId}).exec(function(err, form) {
        callback("", form);
    });
};

exports.formsByIdList = function(idList, callback) {
    Form.find().where('_id').in(idList).exec(function(err, forms) {
       callback("", forms); 
    });
};

exports.cdesByIdList = function(idList, callback) {
    DataElement.find().where('_id')
            .in(idList)
            .slice('valueDomain.permissibleValues', 10)
            .exec(function(err, cdes) {
       callback("", cdes); 
    });
};

exports.cdesByUuidList = function(idList, callback) {
    DataElement.find({'archived':null}).where('uuid')
            .in(idList)
            .slice('valueDomain.permissibleValues', 10)
            .exec(function(err, cdes) {
       callback("", cdes); 
    });
};


exports.listOrgs = function(callback) {
    DataElement.find().distinct('stewardOrg.name', function(error, orgs) {
        callback("", orgs.sort());
    });
};

exports.managedOrgs = function(callback) {
    Org.find().exec(function(err, orgs) {
        callback(orgs);
    });
};

exports.addOrg = function(name, res) {
  Org.findOne({"name": name}).exec(function(err, found) {
      if (found) {
          res.send("Org Already Exists");
      } else {
          var newOrg = new Org({"name": name});
          newOrg.save(function() {
              res.send("Org Added");
          });
      }
  });  
};

exports.removeOrg = function (id, callback) {
  Org.findOne({"_id": id}).remove().exec(function (err) {
      callback();
  });
};

exports.priorCdes = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement != null) {
            return DataElement.find({}, "naming origin originId registrationState stewardOrg updated updatedBy createdBy uuid version views")
                    .where("_id").in(dataElement.history).exec(function(err, cdes) {
                callback("", cdes);
            });
        } else {
            
        }
    });
};

exports.cdeById = function(cdeId, callback) {
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

exports.addToViewHistory = function(cde, user) {
    User.findOne({'_id': user._id}, function (err, u) {
        u.viewHistory.splice(0, 0, cde._id);
        if (u.viewHistory.length > 1000) {
            us.viewHistory.length(1000);
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

exports.name_autocomplete_form = function (searchOptions, callback) {
    var name = searchOptions.name;
    delete searchOptions.name;
    Form.find(searchOptions, {name: 1, _id: 0}).where('name').equals(new RegExp(name, 'i')).limit(20).exec(function (err, result) {
        callback("", result);
    });
};

exports.newBoard = function(board, callback) {
    var newBoard = new PinningBoard(board);
    newBoard.save(function(err) {
        callback("", newBoard);        
    });
};

exports.saveForm = function(req, callback) {
    if (!req.body._id ) {
        var form = new Form(req.body);
        form.created = Date.now();
        form.createdBy.userId = req.user._id;
        form.createdBy.username = req.user.username;
        return form.save(function(err) {
            if (err) {
                callback(err, form);
            }
            callback("", form);
        });
    } else {
        var form = new Form(req.body);
        var formId = req.body._id;
        delete req.body._id;
        Form.update({'_id': formId}, req.body, function(err) {
            if (err) {
                console.log("Error Saving Form " + err);
            }
            callback("", form);
        });
    }
};

exports.save = function(mongooseObject, callback) {
    mongooseObject.save(function(err) {
       callback("", mongooseObject); 
    });
};

exports.saveCde = function(req, callback) {
    if (req.body._id) { // CDE already exists
        return DataElement.findById(req.body._id, function (err, dataElement) {
            var jsonDe = JSON.parse(JSON.stringify(dataElement));
            delete jsonDe._id;
            var newDe = new DataElement(jsonDe);
            newDe.history.push(dataElement._id);
            newDe.naming = req.body.naming;
            newDe.version = req.body.version;
            newDe.changeNote = req.body.changeNote;
            newDe.updated = new Date().toJSON();
            newDe.updatedBy.userId = req.user._id;
            newDe.updatedBy.username = req.user.username;
            newDe.registrationState.registrationStatus = req.body.registrationState.registrationStatus;
            newDe.registrationState.effectiveDate = req.body.registrationState.effectiveDate;
            newDe.registrationState.untilDate = req.body.registrationState.untilDate;
            newDe.registrationState.administrativeNote = req.body.registrationState.administrativeNote;
            newDe.registrationState.unresolvedIssue = req.body.registrationState.unresolvedIssue;
            newDe.registrationState.administrativeStatus = req.body.registrationState.administrativeStatus;
            newDe.registrationState.replacedBy = req.body.registrationState.replacedBy;
            newDe.dataElementConcept = req.body.dataElementConcept;
            newDe.objectClass = req.body.objectClass;
            newDe.property = req.body.property;
            newDe.properties = req.body.properties;
            newDe.valueDomain = req.body.valueDomain;
            newDe.attachments = req.body.attachments;
            newDe.ids = req.body.ids;
            
            dataElement.archived = true;
            
            if (newDe.naming.length < 1) {
                console.log("Cannot save without names");
                callback ("Cannot save without names");
            }
            
            dataElement.save(function (err) {
                 if (err) {
                     console.log(err);
                 } else {
                     newDe.save(function (err) {
                         if (err) {
                            console.log(err);
                         }
                         callback("", newDe);
                     });
                 }
           });
       });
    } else { // CDE does not already exists
        var newDe = new DataElement(req.body);
        newDe.registrationState = {
            registrationStatus: "Incomplete"
        };
        newDe.created = Date.now();
        newDe.createdBy.userId = req.user._id;
        newDe.createdBy.username = req.user.username;
        newDe.uuid = uuid.v4();
        newDe.save(function (err) {
            callback(err, newDe);
        });
    }
};

exports.fetchPVCodeSystemList = function() {
    var mongo_data = this;
    DataElement.distinct("valueDomain.permissibleValues.codeSystemName").exec(function(err, codeSystemNames) {
        mongo_data.pVCodeSystemList = codeSystemNames;
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
            /*var query = {
                $or: [
                    {
                        "recipient.recipientType":"stewardOrg"
                        , "recipient.name": {$in: req.user.orgAdmin.concat(req.user.orgCurator)}
                    }
                    , {
                        "recipient.recipientType":"user"
                        , "recipient.name": req.user.username
                    }
                ]
            };*/
            var query = {
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
            }            
            break;
        case "sent":
            var query = {
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
        case "archive":
            var query = {
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
    if (!query) {
        callback("Type not specified!");
        return;
    }
    Message.find(query).exec(function(err, result) {
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
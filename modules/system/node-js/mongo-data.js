var schemas = require('./schemas')
    , mongoose = require('mongoose')
    , config = require('config')
    , mongoUri = config.mongoUri
    , Grid = require('gridfs-stream')
    , fs = require('fs')
    , connHelper = require('./connections')
    , express = require('express')
    , session = require('express-session')
    , MongoStore = require('connect-mongo')(session)
    , shortid = require("shortid")
    , logging = require('../../system/node-js/logging.js')
    , email = require('../../system/node-js/email')
    , adminItemSvc = require('./adminItemSvc')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , daoManager = require('./moduleDaoManager')
    , clamav = require('clamav.js')
    , async = require('async')
    ;

var conn;
var localConn;
var Org;
var User;
var gfs;
var connectionEstablisher = connHelper.connectionEstablisher;
var Message;
var ClusterStatus;
var sessionStore;
var fs_files;
var classificationAudit;

var iConnectionEstablisherSys = new connectionEstablisher(mongoUri, 'SYS');
iConnectionEstablisherSys.connect(function(resCon) {
    exports.mongoose_connection = resCon;
    conn = resCon;
    Org = conn.model('Org', schemas.orgSchema);
    User = conn.model('User', schemas.userSchema);
    Message = conn.model('Message', schemas.message);
    ClusterStatus = conn.model('ClusterStatus', schemas.clusterStatus);
    gfs = Grid(conn.db, mongoose.mongo);
    sessionStore = new MongoStore({ 
        mongooseConnection: resCon  
    });
    exports.sessionStore = sessionStore;
    fs_files = conn.model('fs_files', schemas.fs_files);
    classificationAudit = conn.model('classificationAudit', schemas.classificationAudit);
});

var iConnectionEstablisherLocal = new connectionEstablisher(config.database.local.uri, 'LOCAL');
iConnectionEstablisherLocal.connect(function(resCon) {
        localConn = resCon;        
});

exports.sessionStore = sessionStore;

exports.mongoose_connection = conn;

exports.getClusterHostStatus = function(server, callback) {
    ClusterStatus.findOne({hostname: server.hostname, port: server.port}).exec(function(err, result) {
       callback(err, result);
    });
};

exports.getClusterHostStatuses = function(callback) {
    ClusterStatus.find().exec(function(err, statuses) {
        callback(err, statuses);
    });
};

exports.updateClusterHostStatus = function(status, callback) {
    status.lastUpdate = new Date();
    ClusterStatus.update({port: status.port, hostname: status.hostname}, status, {upsert: true}, function(err) {
        if (err){
            logging.errorLogger.error("Unable to retrieve state of host in cluster config.", err);
        }
        if (callback) callback(err);
    });
};

exports.org_autocomplete = function(name, callback) {
    Org.find({"name": new RegExp(name, 'i')}, function(err, orgs) {
        callback(orgs);
    }); 
};

exports.orgNames = function(callback) {
    Org.find({}, {name: true, _id: false}).exec(function(err, result) {
        callback(err, result);
    });
};

exports.userByName = function(name, callback) {
    User.findOne({'username': new RegExp('^'+name+'$', "i")}).exec(function (err, u) {
       callback(err, u); 
    });
};

exports.usersByPartialName = function(name, callback) {
    User.find({'username': new RegExp(name, 'i')}).exec(function (err, users) {
        for (var i = 0; i < users.length; i++) {
            delete users[i].password;
        }
        callback(err, users); 
    });
};

exports.usernamesByIp = function(ip, callback) {
    User.find({"knownIPs": {$in: [ip]}}, {username: 1}).exec(function (err, usernames) {
       callback(usernames); 
    });
};

exports.userById = function(id, callback) {
    User.findOne({'_id': id}).exec(function (err, u) {
       callback("", u); 
    });
};

exports.addUser = function(user, callback) {
    user.username = user.username.toLowerCase();
    var newUser = new User(user);
    newUser.save(function() {
        callback(newUser);
    });
};

exports.siteadmins = function(callback) {
    User.find({'siteAdmin': true}).select('username email').exec(function (err, users) {
        callback(err, users);
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


exports.orgByName = function(orgName,callback) {
    Org.findOne({"name": orgName}).exec(function(error, org) {
        callback(org);
    });
};


exports.listOrgs = function(callback) {
    Org.distinct('name', function(error, orgs) {
        callback("", orgs.sort());
    });
};

exports.listOrgsLongName = function(callback) {
    Org.find({}, {'_id': 0, 'name':1, 'longName':1}).exec(function(err, result) {
        callback("", result);
    });
};

exports.listOrgsDetailedInfo = function(callback) {
    Org.find({}, {'_id': 0, 'name':1, 'longName':1, 'mailAddress':1, "emailAddress":1, "phoneNumber":1, "uri":1, "workingGroupOf":1}).exec(function(err, result) {
        callback("", result);
    });
};

exports.managedOrgs = function(callback) {
    Org.find().exec(function(err, orgs) {
        callback(orgs);
    });
};

exports.addOrg = function(newOrgArg, res) {
  Org.findOne({"name": newOrgArg.name}).exec(function(err, found) {
      if (found) {
          res.send("Org Already Exists");
      } else {
          var newOrg = new Org(newOrgArg);
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

exports.userTotalSpace = function(Model, name, callback) {
    Model.aggregate(
            {$match: {"attachments.uploadedBy.username": name}},
    {$unwind: "$attachments"},
    {$group: {_id: {uname: "$attachments.uploadedBy.username"}, totalSize: {$sum: "$attachments.filesize"}}},
    {$sort: {totalSize: -1}}
    , function(err, res) {
        var result = 0;
        if (res.length > 0) {
            result = res[0].totalSize;
        }
        callback(result);
    });
};

exports.addAttachment = function(file, user, comment, elt, cb) {

    var linkAttachmentToAdminItem = function(attachment, elt, newFileCreated, cb) {
        elt.attachments.push(attachment);
        elt.save(function() {
            if (cb) cb(attachment, newFileCreated);
        });
    };

    var addNewFile = function(stream, attachment, elt, user, cb) {
        var streamDescription = {
            filename: attachment.filename
            , mode: 'w'
            , content_type: attachment.filetype
            , metadata: {
                status: null
            }
        };

        if (file.scanned) streamDescription.metadata.status = "scanned";
        else streamDescription.metadata.status = "uploaded";
        if (file.ingested) streamDescription.metadata.status = "approved";

        var writestream = gfs.createWriteStream(streamDescription);

        writestream.on('close', function (newfile) {
            attachment.fileid = newfile._id;
            if (!file.ingested) attachment.pendingApproval = true;
            attachment.scanned = file.scanned;
            linkAttachmentToAdminItem(attachment, elt, true, cb);
        });

        stream.pipe(writestream);
    };    

    var attachment = {
        fileid: null
        , filename: file.originalname
        , filetype: file.type
        , uploadDate: Date.now()
        , comment: comment 
        , filesize: file.size
    };

    if (user) { 
        attachment.uploadedBy = {
            userId: user._id
            , username: user.username
        }
    }       
    
    gfs.findOne({md5: file.md5}, function (err, f) {
        if (!f) addNewFile(file.stream, attachment, elt, user, cb);
        else {
            attachment.fileid = f._id;
            linkAttachmentToAdminItem(attachment, elt, false, cb);
        }
    });       
    
};

exports.deleteFileById = function(id, cb) {
    gfs.remove({_id: id}, function (err) {
        if (cb) cb(err);
    });
};

exports.alterAttachmentStatus = function(id, status, cb) {
    fs_files.update({_id: id}, {$set: {"metadata.status": status}}).exec(function(err) {
        if (cb) cb(err);
    });
    if (status === "approved") {
        daoManager.getDaoList().forEach(function(dao){
            dao.setAttachmentApproved(id);
        });    
    }
};

exports.removeAttachmentIfNotUsed = function(id) {    
    async.map(daoManager.getDaoList(), function(dao, cb) {
        dao.fileUsed(id, cb);
    }, function(err, results){
        if (results.indexOf(true)===-1) exports.deleteFileById(id);
    });
};

exports.getFile = function(user, id, res) {
    gfs.exist({ _id: id }, function (err, found) {
        if (err || !found) {
            res.status(404).send("File not found.");
            return logging.errorLogger.error("File not found.", {origin: "system.mongo.getFile", stack: new Error().stack, details: "fileid "+id});
        }
        gfs.findOne({ _id: id}, function (err, file) {
            if (file.metadata.status === "approved" || authorizationShared.hasRole(user, "AttachmentReviewer")) gfs.createReadStream({ _id: id }).pipe(res);
            else res.status(403).send("This file has not been approved yet.");
        });
                
    });        
};

exports.updateOrg = function(org, res) {
    var id = org._id;
    delete org._id;
    Org.findOneAndUpdate({_id: id}, org).exec(function(err, found) {
        if (found) {
            res.send('Org has been updated.');
        } else {
            res.send('Org does not exist.');
        }
    });
};

exports.rsStatus = function (cb) {
    var db = conn.db;
    db.admin().command({"replSetGetStatus": 1}, function (err, doc) {
        cb(err, doc);        
    });
};

exports.rsConf = function(cb) {
    localConn.db.collection('system.replset').findOne({}, function(err, conf) {
       cb(err, conf); 
    });
};

exports.switchToReplSet = function (replConfig, force, cb) {
    localConn.db.collection('system.replset').findOne({}, function(err, conf) {
        if (err) cb(err);
        else {
            replConfig.version = conf.version + 1;        
            conn.db.admin().command({"replSetReconfig": replConfig, force: force}, function (err, doc) {
                if (err) {
                    mongoose.disconnect();
                    cb(err, doc);
                } else {
                    cb(err, doc);
                }
            });
        }
    });   
};

exports.getAllUsernames = function(callback) {
    User.find({}, {username: true, _id: false}).exec(function(err, usernames) {
        callback(err, usernames);
    });
};

exports.generateTinyId = function() {
    return shortid.generate().replace(/-/g,"_");
};

exports.createMessage = function(msg, cb) {
    msg.states = [{
        action: "Filed"
        , date: new Date()
        , comment: "cmnt"
    }];      
    var message = new Message(msg);  
    message.save(function() {
        if (cb) cb();
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
    var authorRecipient = {
        "$and": [
            {
                "$or": [
                    {
                        "recipient.recipientType": "stewardOrg"
                        , "recipient.name": {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    }
                    , {
                        "recipient.recipientType": "user"
                        , "recipient.name": req.user.username
                    }                   
                ]
            },
            {
                "states.0.action": null
            }
        ]
    };      
    
    req.user.roles.forEach(function(r){
        var roleFilter = {
            "recipient.recipientType": "role"
            , "recipient.name": r
        };        
        authorRecipient["$and"][0]["$or"].push(roleFilter);
    });
    
    switch (req.params.type) {
       case "received":
            authorRecipient["$and"][1]["states.0.action"] = "Filed";
            break;
        case "sent":
            authorRecipient = {
                $or: [
                    {
                        "author.authorType":"stewardOrg"
                        , "author.name": {$in: [].concat(req.user.orgAdmin.concat(req.user.orgCurator))}
                    }
                    , {
                        "author.authorType":"user"
                        , "author.name": req.user.username
                    }
                ]
            };
            break; 
        case "archived":
            authorRecipient["$and"][1]["states.0.action"] = "Approved";            
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

exports.addUserRole = function(request, cb) {
    exports.userByName(request.username, function(err, u){
        u.roles.push(request.role);
        u.save(function(err, u){
            if(cb) cb(err, u);
        });
    });
};

exports.usersByRole = function(role, cb) {
    User.find({roles:role}).exec(function(err, users) {
        cb(err, users);
    });    
};

exports.mailStatus = function(user, cb){
    exports.getMessages({user:user, params: {type:"received"}}, function(err, mail){
        cb(err, mail.length);
    });
};

exports.addToClassifAudit = function(msg) {
    var classifRecord = new classificationAudit(msg);
    classifRecord.save();
};

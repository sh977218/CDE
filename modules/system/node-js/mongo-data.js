var schemas = require('./schemas')
    , mongoose = require('mongoose')
    , config = require('config')
    , mongoUri = config.mongoUri
    , Grid = require('gridfs-stream')
    , fs = require('fs')
    , conn = mongoose.createConnection(mongoUri)
    , connHelper = require('./connections')
    ;

var conn;
var localConn;
var Org;
var User;
var gfs;
var connectionEstablisher = connHelper.connectionEstablisher;

var iConnectionEstablisherSys = new connectionEstablisher(mongoUri, 'SYS');
iConnectionEstablisherSys.connect(function(resCon) {
    exports.mongoose_connection = resCon;
    conn = resCon;
    Org = conn.model('Org', schemas.orgSchema);
    User = conn.model('User', schemas.userSchema);
    gfs = Grid(conn.db, mongoose.mongo);
});

var iConnectionEstablisherLocal = new connectionEstablisher(config.database.local.uri, 'LOCAL');
iConnectionEstablisherLocal.connect(function(resCon) {
        localConn = resCon;        
});

exports.mongoose_connection = conn;

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
    User.findOne({'username': name}).exec(function (err, u) {
       callback("", u); 
    });
};

exports.usersByPartialName = function(name, callback) {
    User.find({'username': new RegExp(name, 'i')}).exec(function (err, users) {
        for (var i = 0; i < users.length; i++) {
            delete users[i].password;
        }
        callback("", users); 
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
    var newUser = new User(user);
    newUser.save(function() {
        callback(newUser);
    });
};

exports.siteadmins = function(callback) {
    User.find({'siteAdmin': true}).select('username email').exec(function (err, users) {
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
    var writestream = gfs.createWriteStream({
        filename: file.name
        , mode: 'w'
        , content_type: file.type
    });

    writestream.on('close', function (newfile) {
        elt.attachments.push({
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
        elt.save(function() {
            cb();
        });
    });
    
    fs.createReadStream(file.path).pipe(writestream);
};

exports.getFile = function(callback, res, id) {
    gfs.createReadStream({ _id: id }).pipe(res);
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

exports.switchToReplSet = function (replConfig, cb) {
    localConn.db.collection('system.replset').findOne({}, function(err, conf) {
        if (err) cb(err)
        else {
            replConfig.version = conf.version + 1;        
            conn.db.admin().command({"replSetReconfig": replConfig}, function (err, doc) {
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

exports.disconnect = function() {
    mongoose.disconnect();
};

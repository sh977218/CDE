var schemas = require('./schemas')
    , mongoose = require('mongoose')
    , config = require('config')
    , mongoUri = config.mongoUri
    , mongoUri = config.mongoUri
    , conn = mongoose.createConnection(mongoUri)
    , Org = conn.model('Org', schemas.orgSchema)    
    , User = conn.model('User', schemas.userSchema)
    ;


conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {
	console.log('mongodb connection open');
    });    
exports.mongoose_connection = conn;

//TODO: MOVE TO SYSTEM
exports.org_autocomplete = function(name, callback) {
    Org.find({"name": new RegExp(name, 'i')}, function(err, orgs) {
        callback(orgs);
    }); 
};

//TODO: MOVE TO SYSTEM
exports.orgNames = function(callback) {
    Org.find({}, {name: true, _id: false}).exec(function(err, result) {
        callback(err, result);
    });
};


//TODO: MOVE TO SYSTEM
exports.userByName = function(name, callback) {
    User.findOne({'username': name}).exec(function (err, u) {
       callback("", u); 
    });
};
//TODO: MOVE TO SYSTEM
exports.usersByPartialName = function(name, callback) {
    User.find({'username': new RegExp(name, 'i')}).exec(function (err, users) {
        for (var i = 0; i < users.length; i++) {
            delete users[i].password;
        }
        callback("", users); 
    });
};

//TODO: MOVE TO SYSTEM
exports.userById = function(id, callback) {
    User.findOne({'_id': id}).exec(function (err, u) {
       callback("", u); 
    });
};
//TODO: MOVE TO SYSTEM
exports.addUser = function(user, callback) {
    var newUser = new User(user);
    newUser.save(function() {
        callback(newUser);
    });
};
//TODO: MOVE TO SYSTEM
exports.siteadmins = function(callback) {
    User.find({'siteAdmin': true}).select('username').exec(function (err, users) {
        callback("", users);
    });
};
//TODO: MOVE TO SYSTEM
exports.orgAdmins = function(callback) {
    User.find({orgAdmin: {$not: {$size: 0}}}).exec(function (err, users) {
        callback("", users);
    });
};
//TODO: MOVE TO SYSTEM
exports.orgCurators = function(orgs, callback) {
    User.find().where("orgCurator").in(orgs).exec(function (err, users) {
        callback("", users);
    });
};

//TODO: MOVE TO SYSTEM
exports.orgByName = function(orgName,callback) {
    Org.findOne({"name": orgName}).exec(function(error, org) {
        callback(org);
    });
};

//TODO: MOVE TO SYSTEM
exports.listOrgs = function(callback) {
    Org.distinct('name', function(error, orgs) {
        callback("", orgs.sort());
    });
};
//TODO: MOVE TO SYSTEM
exports.listOrgsLongName = function(callback) {
    Org.find({}, {'_id': 0, "name":1, "longName":1}).exec(function(err, result) {
        callback("", result);
    });
};

//TODO: MOVE TO SYSTEM
exports.managedOrgs = function(callback) {
    Org.find().exec(function(err, orgs) {
        callback(orgs);
    });
};
//TODO: MOVE TO SYSTEM
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
//TODO: MOVE TO SYSTEM
exports.removeOrg = function (id, callback) {
  Org.findOne({"_id": id}).remove().exec(function (err) {
      callback();
  });
};
//TODO: MOVE TO SYSTEM
exports.updateOrgLongName = function(org, res) {
  Org.findOne({'name': org.name}).exec(function(err, found) {
    if(found) {
        Org.update({'name':org.name}, { 'longName':org.longName }).exec();
        res.send('Org has been updated.');
    } else {
        res.send('Org did not exist.');
    }
  });
};

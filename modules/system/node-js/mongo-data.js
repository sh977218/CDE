var schemas = require('./schemas')
    , mongoose = require('mongoose')
    , config = require('config')
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
    Org.find({}, {'_id': 0, "name":1, "longName":1}).exec(function(err, result) {
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

exports.updateOrg = function(org, res, field) {
  Org.findOne({'name': org.name}).exec(function(err, found) {
    if(found) {
        switch(field) {
            case 'longName':
                Org.update({'name':org.name}, { 'longName':org.longName }).exec();
                res.send('Org long name has been updated.');
                break;
            case 'mailAddress':
                Org.update({'name':org.name}, {'mailAddress':org.mailAddress}).exec();
                res.send('Org mailing address has been updated.');
                break;
            case 'emailAddress':
                Org.update({'name':org.name}, {'emailAddress':org.emailAddress}).exec();
                res.send('Org e-mail address has been updated.');
                break;
            case 'phoneNumber':
                Org.update({'name':org.name}, {'phoneNumber':org.phoneNumber}).exec();
                res.send('Org phone number has been updated.');
                break;
            case 'uri':
                Org.update({'name':org.name}, {'uri':org.uri}).exec();
                res.send('Org website uri has been updated.');
                break;
            default:
                res.send('Cannot recognize org field to update.');
                break;
        }
    } else {
        res.send('Org did not exist.');
    }
  });
};


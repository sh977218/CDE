var mongoose = require('mongoose')
    , util = require('util')
    , vsac_io = require('./vsac-io')
    , xml2js = require('xml2js')
;

var mongoUri = process.env.MONGOHQ_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';

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
var RegAuth = mongoose.model('RegAuth', schemas.regAuthSchema);

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
        callback();
    });
};

exports.siteadmins = function(callback) {
    User.find({'siteAdmin': true}).select('username').exec(function (err, users) {
        callback("", users);
    });
};

exports.regAuthAdmins = function(callback) {
    User.find({regAuthAdmin: {$not: {$size: 0}}}).exec(function (err, users) {
        callback("", users);
    });
};

exports.regAuthCurators = function(regAuths, callback) {
    User.find().where("regAuthCurator").in(regAuths).exec(function (err, users) {
        callback("", users);
    });
};

exports.addComment = function(deId, comment, userId, callback) {
    exports.cdeById(deId, function(err, de) {
        console.log("Found DE: " + de.name);
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

exports.cdelist = function(from, limit, searchOptions, callback) {
    DataElement.find(searchOptions).where("archived").equals(null).skip(from).limit(limit).sort('-formUsageCounter').slice('valueDomain.permissibleValues', 10).exec(function (err, cdes) {
        DataElement.count(searchOptions).exec(function (err, count) {
        callback("",{
               cdes: cdes,
               page: Math.ceil(from / limit),
               pages: Math.ceil(count / limit)
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

exports.cdesforapproval = function(regAuths, callback) {
    DataElement.find({'workflowStatus': 'Internal Review'}).where('owningRegAuth').in(regAuths).exec(function(err, cdes) {
       callback("", {cdes: cdes}); 
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

exports.cdesByUuidList = function(idList, callback) {
    DataElement.find().where('uuid').in(idList).exec(function(err, cdes) {
       callback("", cdes); 
    });
};

exports.listRegAuths = function(callback) {
    DataElement.find().distinct('owningRegAuth', function(error, regAuths) {
        callback("", regAuths.sort());
    });
};

exports.managedRegAuths = function(callback) {
    RegAuth.find().exec(function(err, regAuths) {
        callback(regAuths);
    });
};

exports.addRegAuth = function(name, res) {
  RegAuth.findOne({"name": name}).exec(function(err, found) {
      if (found) {
          res.send("RegAuth Already Exists");
      } else {
          var newRegAuth = new RegAuth({"name": name});
          newRegAuth.save(function() {
              res.send("RegAuth Added");
          });
      }
  });  
};

exports.removeRegAuth = function (id, callback) {
  RegAuth.findOne({"_id": id}).remove().exec(function (err) {
      callback();
  });
};

exports.priorCdes = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        return DataElement.find().where("_id").in(dataElement.history).exec(function(err, cdes) {
            callback("", cdes);
        });
    });
};

exports.cdeById = function(cdeId, callback) {
    DataElement.findOne({'_id': cdeId}, function(err, cde) {
        callback("", cde);
    });
};


exports.name_autocomplete = function (searchOptions, callback) {
    var name = searchOptions.name;
    delete searchOptions.name;
    DataElement.find(searchOptions, {name: 1, _id: 0}).where('name').equals(new RegExp(name, 'i')).limit(20).exec(function (err, result) {
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

// @TODO
// Fix this, cdeArchive removed.
exports.linktovsac = function(req, callback) {
    return DataElement.findById(req.body.cde_id, function (err, dataElement) {
        cdeArchive(dataElement, function (arcCde) {
            dataElement.history.push(arcCde._id);
            dataElement.valueDomain.vsacOid = req.body.vs_id;
            vsac_io.getValueSet(req.body.vs_id, function (valueSet_xml) {
                xmlParser.parseString(valueSet_xml, function (err, result) {
                    dataElement.valueDomain.name = result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                    dataElement.valueDomain.definition = '';
                    dataElement.valueDomain.permissibleValues = [];
                    dataElement.changeNote = req.body.changeNote;
                    console.log("Change note: " + dataElement.changeNote);
                    dataElement.updated = new Date().toJSON();


                    for (var i in result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept']) {
                        var pv = result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i];
                        dataElement.valueDomain.permissibleValues.push({
                                validValue: pv['$'].displayName
                                , valueCode: pv['$'].code
                                , codeSystemName: pv['$'].codeSystemName                       
                        });
                    }
                    return dataElement.save(function (err) {
                         if (err) {
                             console.log(err);
                         }
                         return dataElement;
                    });
                });
                callback("", dataElement);
            });       
        });
    });
};

exports.saveForm = function(req, callback) {
    if (!req.body._id ) {
        var form = new Form();
        form.name = req.body.name;
        form.instructions = req.body.instructions;
        form.owningRegAuth = req.body.owningRegAuth;
        form.created = Date.now();
        return form.save(function(err) {
            if (err) {
                callback(err, form);
            }
            console.log("No form Id, created new form");
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
    if (req.body._id) {
        return DataElement.findById(req.body._id, function (err, dataElement) {
            var jsonDe = JSON.parse(JSON.stringify(dataElement));
            delete jsonDe._id;
            var newDe = new DataElement(jsonDe);
            newDe.history.push(dataElement._id);
            newDe.name = req.body.name;
            newDe.definition = req.body.definition;
            newDe.changeNote = req.body.changeNote;
            newDe.updated = new Date().toJSON();
            newDe.updatedBy.userId = req.user._id;
            newDe.updatedBy.username = req.user.username;
            newDe.workflowStatus = req.body.workflowStatus;
            
            dataElement.archived = true;
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
        newDe.workflowStatus = "Draft";
        newDe.created = Date.now();
        newDe.createdBy.userId = req.user._id;
        newDe.createdBy.username = req.user.username;
        newDe.save(function (err) {
            callback(err, newDe);
        });
    }
};

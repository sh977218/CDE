var mongoose = require('mongoose')
    , util = require('util')
    , vsac_io = require('./vsac-io')
    , xml2js = require('xml2js')

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
var DataElementArchive = mongoose.model('DataElementArchive', schemas.dataElementArchiveSchema);
var User = mongoose.model('User', schemas.userSchema);
var Form = mongoose.model('Form', schemas.formSchema);

exports.userByName = function(name, callback) {
    User.findOne({'username': name}).lean().exec(function (err, u) {
       callback("", u); 
    });
};

exports.userById = function(id, callback) {
    User.findOne({'_id': id}).lean().exec(function (err, u) {
       callback("", u); 
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
    // @TODO 
    // Is there a better way to do this:
    if (searchOptions) {
        if (!searchOptions.owningContext) {
           delete searchOptions.owningContext;
        } 
        if (!searchOptions.workflowStatus) {
            delete searchOptions.workflowStatus;
        }
    }
    
    DataElement.find(searchOptions).skip(from).limit(limit).sort('name').slice('valueDomain.permissibleValues', 10).exec(function (err, cdes) {
        DataElement.count(searchOptions).exec(function (err, count) {
        callback("",{
               cdes: cdes,
               page: Math.ceil(from / limit),
               pages: Math.ceil(count / limit)
           });
        });
    });
};  

exports.formlist = function(callback) {
    Form.find().exec(function(err, forms) {
       callback("", {forms: forms}); 
    });
};

exports.cdesforapproval = function(contexts, callback) {
    DataElement.find({'workflowStatus': 'Internal Review'}).where('owningContext').in(contexts).exec(function(err, cdes) {
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
    DataElement.find().where('uuid').in(idList).exec(function(err, forms) {
       callback("", forms); 
    });
};

exports.listcontexts = function(callback) {
    DataElement.find().distinct('owningContext', function(error, contexts) {
        callback("", contexts);
    });
};

exports.priorCdes = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        return DataElementArchive.find().where("_id").in(dataElement.history).exec(function(err, cdes) {
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

exports.linktovsac = function(req, callback) {
    return DataElement.findById(req.body.cde_id, function (err, dataElement) {
        cdeArchive(dataElement, function (arcCde) {
            dataElement.history.push(arcCde._id);
            dataElement.valueDomain.vsacOid = req.body.vs_id;
            vsac_io.getValueSet(req.body.vs_id, function (valueSet_xml) {
                xmlParser.parseString(valueSet_xml, function (err, result) {
                    dataElement.valueDomain.name = result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                    dataElement.valueDomain.preferredName = '';
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
        form.owningContext = req.body.owningContext;
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

// @TODO we should be able to replace this by a straightforward save like for forms.
exports.saveCde = function(req, callback) {
   return DataElement.findById(req.body._id, function (err, dataElement) {
        return cdeArchive(dataElement, function (arcCde) {
            dataElement.history.push(arcCde._id);
            dataElement.name = req.body.name;
            dataElement.definition = req.body.definition;
            dataElement.changeNote = req.body.changeNote;
            dataElement.updated = new Date().toJSON();
            dataElement.workflowStatus = req.body.workflowStatus;
            return dataElement.save(function (err) {
                if (err) {
                    console.log(err);
                }
                callback("", dataElement);
            });
        });

    });
};

// @TODO Following is prone to error, see if there's a deep copy mechanism. 
// Somethign simple like new DataElement might work
cdeArchive = function(cde, callback) {
    var deArchive = new DataElementArchive();
    deArchive.name = cde.name;
    deArchive.uuid = cde.uuid;
    deArchive.origin = cde.origin;
    deArchive.originId = cde.originId;
    deArchive.definition = cde.definition;
    deArchive.valueDomain = cde.valueDomain;
    deArchive.changeNote = cde.changeNote;
    deArchive.created = cde.created;
    deArchive.updated = cde.updated;
    deArchive.history = cde.history;
    deArchive.owningContext = cde.owningContext;
    deArchive.workflowStatus = cde.workflowStatus;
    deArchive.save(function(err) {
        if(err) {
            console.log(err);
        }
    });
    callback(deArchive); 
};
var mongoose = require('mongoose')
    , config = require('config')
    , schemas = require('./schemas')
    , mongo_data_system = require('../../system/node-js/mongo-data') //TODO: USE DEPENDENCY INJECTION
    , shortid = require("shortid") 
    , connHelper = require('../../system/node-js/connections')
    ;

exports.name = "forms";

var mongoUri = config.mongoUri;
var Form;

var connectionEstablisher = connHelper.connectionEstablisher;

var iConnectionEstablisherForm = new connectionEstablisher(mongoUri, 'Forms');
iConnectionEstablisherForm.connect(function(conn) {
    Form = conn.model('Form', schemas.formSchema);
});

exports.idExists = function(id, callback) { 
    Form.count({_id: id}).count().then(function(result) {
        callback(result === 0);
    });
};

exports.findForms = function(request, callback) {
    var criteria = {};
    if (request && request.term) {
        criteria = {
            "naming.designation": new RegExp(request.term)
        };
    }
    Form.find(criteria).where("archived").equals(null).exec(function (err, forms) {
        callback(err, forms);
    });
};

exports.update = function(form, user, callback) {
    var origId = form._id;
    delete form._id;

    var newForm = new Form(form);    
    newForm.updated = Date.now();
    newForm.updatedBy = {
        userId: user._id
        , username: user.username
    }; 
    newForm.save(function(err) {
        Form.update({_id: origId}, {archived: true}, function(nbUpdated) {
            callback(err, newForm);        
        });
    });        
    
};

exports.create = function(form, user, callback) {
    var newForm = new Form(form);
    newForm.registrationState = {
        registrationStatus: "Incomplete"
    };
    newForm.created = Date.now();
    newForm.tinyId = shortid.generate();
    newForm.createdBy = {
        userId: user._id
        , username: user.username
    };
    newForm.save(function(err) {
        callback(err, newForm);
    });
};

exports.byId = function(id, callback) {
    Form.findById(id, function(err, form) {
        callback(err, form);
    });     
};

exports.userTotalSpace = function(name, callback) {
    mongo_data_system.userTotalSpace(Form, name, callback);
};

exports.query = function(query, callback) {
    Form.find(query).exec(function(err, result) {
        callback(err, result);
    });
};

exports.allPropertiesKeys = function(callback) {
    Form.distinct("properties.key").exec(function (err, keys) {
        callback(err, keys);
    });
};

exports.transferSteward = function(from, to, callback) {
    Form.update({'stewardOrg.name':from},{$set:{'stewardOrg.name':to}},{multi:true}).exec(function(err, result) {
        callback(err, result);
    });
};

exports.byTinyIdAndVersion = function(tinyId, version, callback) {
    Form.findOne({'tinyId': tinyId, "version": version}).exec(function (err, elt) {
       callback("", elt); 
    });
};

exports.eltByTinyId = function(tinyId, callback) {
    Form.findOne({'tinyId': tinyId, "archived": null}).exec(function (err, elt) {
       callback("", elt); 
    });
};

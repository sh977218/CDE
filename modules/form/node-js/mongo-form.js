var mongoose = require('mongoose')
    , config = require('config')
    , schemas = require('./schemas')
    , uuid = require('node-uuid')
    ;
    
var mongoUri = config.mongoUri;

var conn = mongoose.createConnection(mongoUri);

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {
    console.log('mongodb connection open');
});    

var Form = conn.model('Form', schemas.formSchema);

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
    newForm.uuid = uuid.v4();
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


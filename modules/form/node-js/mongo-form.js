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

exports.findForms = function(criteria, callback) {
    if (!criteria) criteria = {};
    Form.find(criteria).exec(function (err, forms) {
        callback(err, forms);
    });
};

exports.update = function(form, user, callback) {
    form.updated = Date.now();
    form.updatedBy = {
        userId: user._id
        , username: user.username
    }; 
    var id = form._id;
    delete form._id;
    Form.update({_id: id}, form, function(err, nbAffected) {
        callback(); 
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
        Form.findById(newForm, function(err, form) {
            callback(form);
        });        
    });
};

exports.byId = function(id, callback) {
    Form.findById(id, function(err, form) {
        callback(form);
    });     
};


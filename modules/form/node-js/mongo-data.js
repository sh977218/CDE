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

exports.createForm = function(form, callback) {
    var newForm = new Form(form);
    newForm.registrationState = {
        registrationStatus: "Incomplete"
    };
    newForm.created = Date.now();
//    newForm.createdBy.userId = req.user._id;
//    newForm.createdBy.username = req.user.username;
    newForm.save(function(err) {
        Form.findById(newForm, function(err, form) {
            callback(form);
        });        
    });
};

exports.viewForm = function(form, callback) {
    Form.findById(form._id, function(err, form) {
        callback(form);
    });     
};


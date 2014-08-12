var mongo_data = require('./mongo-data');

exports.findForms = function(req, res) {
    mongo_data.findForms(req.body.criteria, function(err, forms) {
        res.send(forms);
    });
};

exports.createForm = function(req, res) {
    mongo_data.createForm(req.body.form, req.user, function(form) {
        res.send(form);
    });    
};

exports.formById = function(req, res) {
    mongo_data.formById(req.params.id, function(form) {
        res.send(form);
    });    
};
var mongo_data = require('./mongo-data');

exports.renderListPage = function(req, res) {
    res.render('list', 'form');
};

exports.createFormPage = function(req, res) {
    res.render('createForm', 'form');
};

exports.findForms = function(req, res) {
    mongo_data.findForms(req.body.criteria, function(err, forms) {
        res.send(forms);
    });
};

exports.createForm = function(req, res) {
    mongo_data.createForm(req.body.form, function(form) {
        res.send(form);
    });    
};
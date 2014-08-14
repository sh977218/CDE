var mongo_data = require('./mongo-form')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
;

exports.findForms = function(req, res) {
    mongo_data.findForms(req.body.criteria, function(err, forms) {
        res.send(forms);
    });
};

exports.save = function(req, res) {
    adminSvc.save(req, res, mongo_data);
};

exports.formById = function(req, res) {
    mongo_data.formById(req.params.id, function(form) {
        res.send(form);
    });    
};
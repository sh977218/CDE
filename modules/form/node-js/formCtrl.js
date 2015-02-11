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
    mongo_data.byId(req.params.id, function(err, form) {
        if (form) {
            form = adminSvc.hideUnapprovedComments(form);
            res.send(form);
        } else {
            res.send(404);
        }
    });    
};
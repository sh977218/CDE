var mongo_data = require('./mongo-form')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
;

exports.findForms = function(req, res) {
    mongo_data.findForms(req.body.criteria, function(err, forms) {
        forms.forEach(exports.hideUnapprovedComments);
        res.send(forms);
    });
};

exports.save = function(req, res) {
    adminSvc.save(req, res, mongo_data);
};

exports.formById = function(req, res) {
    var type = req.query.type === 'tinyId'?'eltByTinyId':'byId';
    mongo_data[type](req.params.id, function(err, form) {
        if (form) {
            adminSvc.hideUnapprovedComments(form);
            res.send(form);
        } else {
            res.status(404).end();
        }
    });    
};